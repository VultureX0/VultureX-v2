import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  connectionRequests,
  connections,
  conversationParticipants,
  conversations,
  interests,
  notifications,
  users,
  startups,
  investors,
  type ConnectionRequestStatus,
} from "@/db/schema";
import { isUuid } from "@/lib/utils";
import { ConnectionError } from "./errors";
import { getProfiles, normalizePair, pairKeyFor, type ProfileSummary } from "./profiles";

const MAX_REQUEST_MESSAGE = 500;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type RequestRow = typeof connectionRequests.$inferSelect;

export type InterestState =
  | "none"
  | "self"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "rejected"
  | "rejected_by_me";

export type InterestStatus = {
  status: InterestState;
  requestId: string | null;
  conversationId: string | null;
};

export type RequestCard = {
  id: string;
  status: ConnectionRequestStatus;
  message: string | null;
  createdAt: string;
  user: ProfileSummary;
  conversationId: string | null;
};

export type RequestsOverview = {
  incoming: RequestCard[];
  sent: RequestCard[];
  connections: {
    conversationId: string;
    user: ProfileSummary;
    connectedAt: string;
  }[];
  counts: { pendingIncoming: number };
};

/**
 * Create (or reopen) an Interest+ request. The request row is the single
 * source of truth; a notification is written in the same transaction so the
 * recipient can never miss a request that committed.
 */
export async function sendRequest(
  senderUserId: string,
  recipientUserId: string,
  rawMessage?: string | null
) {
  if (!isUuid(recipientUserId)) {
    throw new ConnectionError("A valid member id is required.", 400, "INVALID_TARGET");
  }
  if (senderUserId === recipientUserId) {
    throw new ConnectionError("You cannot send an interest request to yourself.", 400, "SELF_REQUEST");
  }

  const trimmed = typeof rawMessage === "string" ? rawMessage.trim() : "";
  if (trimmed.length > MAX_REQUEST_MESSAGE) {
    throw new ConnectionError(
      `Keep your note under ${MAX_REQUEST_MESSAGE} characters.`,
      400,
      "MESSAGE_TOO_LONG"
    );
  }
  const message = trimmed || null;

  return db.transaction(async (tx) => {
    const [sender] = await tx
      .select({
        role: users.role,
        name: users.name,
        email: users.email,
        startupId: startups.id,
        startupName: startups.name,
        investorId: investors.id,
        investorName: investors.fullName,
      })
      .from(users)
      .leftJoin(startups, eq(startups.userId, users.id))
      .leftJoin(investors, eq(investors.userId, users.id))
      .where(eq(users.id, senderUserId))
      .limit(1);

    const [recipient] = await tx
      .select({
        role: users.role,
        name: users.name,
        email: users.email,
        startupId: startups.id,
        startupName: startups.name,
        investorId: investors.id,
        investorName: investors.fullName,
      })
      .from(users)
      .leftJoin(startups, eq(startups.userId, users.id))
      .leftJoin(investors, eq(investors.userId, users.id))
      .where(eq(users.id, recipientUserId))
      .limit(1);

    if (!sender || !recipient) {
      throw new ConnectionError("Member not found.", 404, "TARGET_NOT_FOUND");
    }
    if (sender.role !== "startup" && sender.role !== "investor") {
      throw new ConnectionError(
        "Only startup and investor accounts can send interest.",
        403,
        "ROLE_NOT_ALLOWED"
      );
    }
    if (recipient.role !== "startup" && recipient.role !== "investor") {
      throw new ConnectionError(
        "Interest+ is only available between startups and investors.",
        400,
        "ROLE_NOT_ALLOWED"
      );
    }

    const senderProfileReady =
      sender.role === "startup" ? !!sender.startupId : !!sender.investorId;
    const recipientProfileReady =
      recipient.role === "startup" ? !!recipient.startupId : !!recipient.investorId;
    if (!senderProfileReady) {
      throw new ConnectionError(
        "Complete your profile before sending interest.",
        409,
        "PROFILE_REQUIRED"
      );
    }
    if (!recipientProfileReady) {
      throw new ConnectionError(
        "This member has not finished their profile yet.",
        409,
        "TARGET_PROFILE_INCOMPLETE"
      );
    }

    const pairKey = pairKeyFor(senderUserId, recipientUserId);
    const now = new Date();

    // Lock the pair so two simultaneous clicks can't create two rows.
    const [existing] = await tx
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.pairKey, pairKey))
      .for("update")
      .limit(1);

    let request: RequestRow | undefined;

    if (existing) {
      if (existing.status === "pending") {
        throw new ConnectionError(
          existing.senderUserId === senderUserId
            ? "You already sent this request. It is waiting for a response."
            : "This member already sent you an interest request — respond to it instead.",
          409,
          "ALREADY_PENDING"
        );
      }
      if (existing.status === "accepted") {
        throw new ConnectionError(
          "You are already connected. Open Messages to continue the conversation.",
          409,
          "ALREADY_CONNECTED"
        );
      }
      if (existing.status === "rejected" && existing.senderUserId === senderUserId) {
        // A rejected sender must never re-open the request by clicking again.
        throw new ConnectionError(
          "This request was declined. You cannot resend it.",
          403,
          "REQUEST_DECLINED"
        );
      }

      // Safe re-open: the sender withdrew, or the person who declined is now
      // the one initiating. Clear the old actionable notification first so the
      // partial unique index allows a fresh one.
      await tx
        .delete(notifications)
        .where(
          and(
            eq(notifications.requestId, existing.id),
            eq(notifications.type, "interest_request")
          )
        );

      [request] = await tx
        .update(connectionRequests)
        .set({
          senderUserId,
          recipientUserId,
          message,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          respondedAt: null,
        })
        .where(eq(connectionRequests.id, existing.id))
        .returning();
    } else {
      [request] = await tx
        .insert(connectionRequests)
        .values({ senderUserId, recipientUserId, pairKey, message })
        .onConflictDoNothing()
        .returning();

      if (!request) {
        throw new ConnectionError(
          "A request between you two already exists.",
          409,
          "ALREADY_PENDING"
        );
      }
    }

    // Keep the legacy investor -> startup interest row in sync. The old
    // dashboard counters and /api/interest continue to work unchanged.
    if (
      sender.role === "investor" &&
      sender.investorId &&
      recipient.role === "startup" &&
      recipient.startupId
    ) {
      await tx
        .insert(interests)
        .values({
          investorId: sender.investorId,
          startupId: recipient.startupId,
          message,
        })
        .onConflictDoNothing();
    }

    const senderName =
      sender.role === "startup"
        ? sender.startupName || sender.name || sender.email
        : sender.investorName || sender.name || sender.email;
    const body =
      recipient.role === "startup"
        ? `${senderName} is interested in connecting with your startup.`
        : `${senderName} wants to connect with you.`;

    await tx
      .insert(notifications)
      .values({
        recipientUserId,
        actorUserId: senderUserId,
        type: "interest_request",
        requestId: request!.id,
        body,
      })
      .onConflictDoNothing();

    return request!;
  });
}

/**
 * Accept or reject a pending request. Only the intended recipient can act;
 * acceptance creates the connection and its single conversation atomically.
 */
export async function respondToRequest(
  actorUserId: string,
  requestId: string,
  action: "accept" | "reject"
) {
  if (!isUuid(requestId)) {
    throw new ConnectionError("Unknown request.", 404, "REQUEST_NOT_FOUND");
  }

  return db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, requestId))
      .for("update")
      .limit(1);

    if (!request) {
      throw new ConnectionError("Request not found.", 404, "REQUEST_NOT_FOUND");
    }
    if (request.recipientUserId !== actorUserId) {
      throw new ConnectionError(
        "Only the recipient can respond to this request.",
        403,
        "NOT_RECIPIENT"
      );
    }
    if (request.status !== "pending") {
      throw new ConnectionError(
        "This request has already been answered.",
        409,
        "NOT_PENDING"
      );
    }

    const now = new Date();
    const nextStatus: ConnectionRequestStatus =
      action === "accept" ? "accepted" : "rejected";

    const [updated] = await tx
      .update(connectionRequests)
      .set({ status: nextStatus, respondedAt: now, updatedAt: now })
      .where(
        and(
          eq(connectionRequests.id, request.id),
          eq(connectionRequests.status, "pending")
        )
      )
      .returning();

    if (!updated) {
      throw new ConnectionError(
        "This request has already been answered.",
        409,
        "NOT_PENDING"
      );
    }

    // The request notification is no longer actionable.
    await tx
      .update(notifications)
      .set({ readAt: now })
      .where(
        and(
          eq(notifications.recipientUserId, actorUserId),
          eq(notifications.requestId, request.id),
          eq(notifications.type, "interest_request")
        )
      );

    let conversationId: string | null = null;

    if (action === "accept") {
      const { connection, conversation } = await ensureConnection(tx, updated);
      conversationId = conversation.id;

      // Point the recipient's original request notification at the new
      // conversation so the bell can open it directly after accepting.
      await tx
        .update(notifications)
        .set({
          conversationId: conversation.id,
          connectionId: connection.id,
        })
        .where(
          and(
            eq(notifications.requestId, request.id),
            eq(notifications.type, "interest_request")
          )
        );

      await tx
        .insert(notifications)
        .values({
          recipientUserId: request.senderUserId,
          actorUserId,
          type: "request_accepted",
          requestId: request.id,
          connectionId: conversation.connectionId,
          conversationId: conversation.id,
          body: "Your interest request was accepted. You can start messaging now.",
        })
        .onConflictDoNothing();
    } else {
      await tx
        .insert(notifications)
        .values({
          recipientUserId: request.senderUserId,
          actorUserId,
          type: "request_rejected",
          requestId: request.id,
          body: "Your interest request was declined.",
        })
        .onConflictDoNothing();
    }

    // Mirror the decision on the legacy interest row (if one exists).
    const [sender] = await tx
      .select({
        role: users.role,
        startupId: startups.id,
        investorId: investors.id,
      })
      .from(users)
      .leftJoin(startups, eq(startups.userId, users.id))
      .leftJoin(investors, eq(investors.userId, users.id))
      .where(eq(users.id, request.senderUserId))
      .limit(1);
    const [recipient] = await tx
      .select({
        role: users.role,
        startupId: startups.id,
        investorId: investors.id,
      })
      .from(users)
      .leftJoin(startups, eq(startups.userId, users.id))
      .leftJoin(investors, eq(investors.userId, users.id))
      .where(eq(users.id, request.recipientUserId))
      .limit(1);

    if (sender?.role === "investor" && sender.investorId && recipient?.startupId) {
      await tx
        .update(interests)
        .set({ status: action === "accept" ? "accepted" : "declined" })
        .where(
          and(
            eq(interests.investorId, sender.investorId),
            eq(interests.startupId, recipient.startupId)
          )
        );
    }

    return { status: nextStatus, conversationId };
  });
}

/** Sender can cancel a pending request; it can be sent again afterwards. */
export async function withdrawRequest(senderUserId: string, requestId: string) {
  if (!isUuid(requestId)) {
    throw new ConnectionError("Unknown request.", 404, "REQUEST_NOT_FOUND");
  }

  return db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, requestId))
      .for("update")
      .limit(1);

    if (!request) {
      throw new ConnectionError("Request not found.", 404, "REQUEST_NOT_FOUND");
    }
    if (request.senderUserId !== senderUserId) {
      throw new ConnectionError(
        "Only the sender can withdraw this request.",
        403,
        "NOT_SENDER"
      );
    }
    if (request.status !== "pending") {
      throw new ConnectionError(
        "Only pending requests can be withdrawn.",
        409,
        "NOT_PENDING"
      );
    }

    const [updated] = await tx
      .update(connectionRequests)
      .set({ status: "withdrawn", updatedAt: new Date(), respondedAt: null })
      .where(
        and(
          eq(connectionRequests.id, request.id),
          eq(connectionRequests.status, "pending")
        )
      )
      .returning();

    if (!updated) {
      throw new ConnectionError("This request can no longer be withdrawn.", 409, "NOT_PENDING");
    }

    await tx
      .delete(notifications)
      .where(
        and(
          eq(notifications.requestId, request.id),
          eq(notifications.type, "interest_request")
        )
      );

    return updated;
  });
}

/** Idempotently create the connection + conversation + participants. */
async function ensureConnection(tx: Tx, request: RequestRow) {
  const [userAId, userBId] = normalizePair(
    request.senderUserId,
    request.recipientUserId
  );

  const [inserted] = await tx
    .insert(connections)
    .values({ requestId: request.id, userAId, userBId })
    .onConflictDoNothing()
    .returning();

  const connection =
    inserted ??
    (
      await tx
        .select()
        .from(connections)
        .where(and(eq(connections.userAId, userAId), eq(connections.userBId, userBId)))
        .limit(1)
    )[0];

  if (!connection) {
    throw new ConnectionError(
      "Could not create the connection.",
      500,
      "CONNECTION_FAILED"
    );
  }

  const [insertedConversation] = await tx
    .insert(conversations)
    .values({ connectionId: connection.id })
    .onConflictDoNothing()
    .returning();

  const conversation =
    insertedConversation ??
    (
      await tx
        .select()
        .from(conversations)
        .where(eq(conversations.connectionId, connection.id))
        .limit(1)
    )[0];

  if (!conversation) {
    throw new ConnectionError(
      "Could not create the conversation.",
      500,
      "CONVERSATION_FAILED"
    );
  }

  // Separate inserts: a multi-row ON CONFLICT DO NOTHING would skip the
  // second participant if only the first already existed.
  await tx
    .insert(conversationParticipants)
    .values({ conversationId: conversation.id, userId: userAId })
    .onConflictDoNothing();
  await tx
    .insert(conversationParticipants)
    .values({ conversationId: conversation.id, userId: userBId })
    .onConflictDoNothing();

  return { connection, conversation };
}

/**
 * Materialize connections for accepted requests that predate this feature
 * (including legacy accepted interests imported by the migration).
 */
export async function ensureConnectionsForUser(userId: string) {
  const rows = await db
    .select({ request: connectionRequests })
    .from(connectionRequests)
    .leftJoin(connections, eq(connections.requestId, connectionRequests.id))
    .where(
      and(
        eq(connectionRequests.status, "accepted"),
        or(
          eq(connectionRequests.senderUserId, userId),
          eq(connectionRequests.recipientUserId, userId)
        ),
        isNull(connections.id)
      )
    )
    .limit(50);

  for (const row of rows) {
    await db.transaction(async (tx) => {
      const [fresh] = await tx
        .select()
        .from(connectionRequests)
        .where(eq(connectionRequests.id, row.request.id))
        .for("update")
        .limit(1);
      if (fresh?.status === "accepted") {
        await ensureConnection(tx, fresh);
      }
    });
  }
}

/** Status for one counterpart, used by profile pages and cards. */
export async function getInterestStatus(
  viewerId: string,
  targetUserId: string
): Promise<InterestStatus> {
  if (viewerId === targetUserId) {
    return { status: "self", requestId: null, conversationId: null };
  }

  const [row] = await db
    .select({
      id: connectionRequests.id,
      status: connectionRequests.status,
      senderUserId: connectionRequests.senderUserId,
      conversationId: conversations.id,
    })
    .from(connectionRequests)
    .leftJoin(connections, eq(connections.requestId, connectionRequests.id))
    .leftJoin(conversations, eq(conversations.connectionId, connections.id))
    .where(eq(connectionRequests.pairKey, pairKeyFor(viewerId, targetUserId)))
    .limit(1);

  if (!row) return { status: "none", requestId: null, conversationId: null };

  const conversationId = row.conversationId ?? null;
  if (row.status === "accepted") {
    return { status: "accepted", requestId: row.id, conversationId };
  }
  if (row.status === "pending") {
    return {
      status: row.senderUserId === viewerId ? "pending_sent" : "pending_received",
      requestId: row.id,
      conversationId: null,
    };
  }
  if (row.status === "rejected") {
    return {
      status: row.senderUserId === viewerId ? "rejected" : "rejected_by_me",
      requestId: row.id,
      conversationId: null,
    };
  }
  return { status: "none", requestId: null, conversationId: null };
}

/** Bulk variant used by Explore / investor directory cards. */
export async function getInterestStatuses(
  viewerId: string,
  targetUserIds: string[]
): Promise<Record<string, InterestStatus>> {
  const targets = [...new Set(targetUserIds)].filter(
    (id) => id !== viewerId && isUuid(id)
  );
  const result: Record<string, InterestStatus> = {};
  for (const id of targetUserIds) {
    if (id === viewerId) result[id] = { status: "self", requestId: null, conversationId: null };
  }
  if (targets.length === 0) return result;

  const keys = targets.map((id) => pairKeyFor(viewerId, id));
  const rows = await db
    .select({
      id: connectionRequests.id,
      pairKey: connectionRequests.pairKey,
      status: connectionRequests.status,
      senderUserId: connectionRequests.senderUserId,
      recipientUserId: connectionRequests.recipientUserId,
      conversationId: conversations.id,
    })
    .from(connectionRequests)
    .leftJoin(connections, eq(connections.requestId, connectionRequests.id))
    .leftJoin(conversations, eq(conversations.connectionId, connections.id))
    .where(inArray(connectionRequests.pairKey, keys));

  const byPair = new Map(rows.map((row) => [row.pairKey, row]));
  for (const targetId of targets) {
    const row = byPair.get(pairKeyFor(viewerId, targetId));
    if (!row) {
      result[targetId] = { status: "none", requestId: null, conversationId: null };
    } else if (row.status === "accepted") {
      result[targetId] = {
        status: "accepted",
        requestId: row.id,
        conversationId: row.conversationId ?? null,
      };
    } else if (row.status === "pending") {
      result[targetId] = {
        status: row.senderUserId === viewerId ? "pending_sent" : "pending_received",
        requestId: row.id,
        conversationId: null,
      };
    } else if (row.status === "rejected") {
      result[targetId] = {
        status: row.senderUserId === viewerId ? "rejected" : "rejected_by_me",
        requestId: row.id,
        conversationId: null,
      };
    } else {
      result[targetId] = { status: "none", requestId: null, conversationId: null };
    }
  }

  return result;
}

/** Incoming + sent requests and the accepted connections for one user. */
export async function getRequestsOverview(userId: string): Promise<RequestsOverview> {
  await ensureConnectionsForUser(userId);

  const rows = await db
    .select({
      id: connectionRequests.id,
      senderUserId: connectionRequests.senderUserId,
      recipientUserId: connectionRequests.recipientUserId,
      status: connectionRequests.status,
      message: connectionRequests.message,
      createdAt: connectionRequests.createdAt,
      conversationId: conversations.id,
      connectedAt: connections.createdAt,
    })
    .from(connectionRequests)
    .leftJoin(connections, eq(connections.requestId, connectionRequests.id))
    .leftJoin(conversations, eq(conversations.connectionId, connections.id))
    .where(
      or(
        eq(connectionRequests.senderUserId, userId),
        eq(connectionRequests.recipientUserId, userId)
      )
    )
    .orderBy(desc(connectionRequests.createdAt))
    .limit(100);

  const otherIds = rows.map((row) =>
    row.senderUserId === userId ? row.recipientUserId : row.senderUserId
  );
  const profiles = await getProfiles(otherIds);

  const incoming: RequestCard[] = [];
  const sent: RequestCard[] = [];
  const connected: RequestsOverview["connections"] = [];

  for (const row of rows) {
    const isSender = row.senderUserId === userId;
    const otherId = isSender ? row.recipientUserId : row.senderUserId;
    const user = profiles.get(otherId);
    if (!user) continue;

    const card: RequestCard = {
      id: row.id,
      status: row.status,
      message: row.message,
      createdAt: (row.createdAt ?? new Date()).toISOString(),
      user,
      conversationId: row.conversationId ?? null,
    };

    if (isSender) sent.push(card);
    else incoming.push(card);

    if (row.status === "accepted" && row.conversationId) {
      connected.push({
        conversationId: row.conversationId,
        user,
        connectedAt: (row.connectedAt ?? row.createdAt ?? new Date()).toISOString(),
      });
    }
  }

  return {
    incoming,
    sent,
    connections: connected,
    counts: {
      pendingIncoming: incoming.filter((row) => row.status === "pending").length,
    },
  };
}
