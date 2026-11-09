import { and, asc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  connectionRequests,
  connections,
  conversationParticipants,
  conversations,
  messages,
  notifications,
} from "@/db/schema";
import { isUuid } from "@/lib/utils";
import { ConnectionError } from "./errors";
import { getProfiles, type ProfileSummary } from "./profiles";
import { ensureConnectionsForUser } from "./requests";

export const MESSAGE_MAX_LENGTH = 4000;
const THREAD_LIMIT = 200;

export type ConversationSummary = {
  id: string;
  otherUser: ProfileSummary;
  lastMessage: {
    body: string;
    senderUserId: string;
    createdAt: string;
  } | null;
  lastActivityAt: string;
  unreadCount: number;
};

export type ThreadMessage = {
  id: string;
  body: string;
  senderUserId: string;
  createdAt: string;
  mine: boolean;
};

/**
 * Verify that the user is a member of the conversation. Returns 404 for
 * outsiders so a guessed conversation id reveals nothing.
 */
async function assertParticipant(userId: string, conversationId: string) {
  if (!isUuid(conversationId)) {
    throw new ConnectionError("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
  }

  const [row] = await db
    .select({
      conversationId: conversationParticipants.conversationId,
      connectionId: connections.id,
      userAId: connections.userAId,
      userBId: connections.userBId,
      lastReadAt: conversationParticipants.lastReadAt,
    })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversations.id, conversationParticipants.conversationId)
    )
    .innerJoin(connections, eq(connections.id, conversations.connectionId))
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  if (!row) {
    throw new ConnectionError("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
  }

  return row;
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  // Materialize connections for accepted legacy interests before listing.
  await ensureConnectionsForUser(userId);

  const rows = await db
    .select({
      id: conversations.id,
      userAId: connections.userAId,
      userBId: connections.userBId,
      lastMessageAt: conversations.lastMessageAt,
      lastReadAt: conversationParticipants.lastReadAt,
    })
    .from(conversations)
    .innerJoin(connections, eq(connections.id, conversations.connectionId))
    .innerJoin(
      conversationParticipants,
      and(
        eq(conversationParticipants.conversationId, conversations.id),
        eq(conversationParticipants.userId, userId)
      )
    )
    .where(or(eq(connections.userAId, userId), eq(connections.userBId, userId)))
    .orderBy(sql`${conversations.lastMessageAt} desc`)
    .limit(100);

  if (rows.length === 0) return [];

  const profiles = await getProfiles(
    rows.map((row) => (row.userAId === userId ? row.userBId : row.userAId))
  );
  const ids = rows.map((row) => row.id);
  const idList = sql.join(ids.map((id) => sql`${id}::uuid`), sql`, `);

  // One query for the newest message per conversation.
  const lastRows = (await db.execute(sql`
    select distinct on (conversation_id)
      conversation_id, body, sender_user_id, created_at
    from messages
    where conversation_id in (${idList})
    order by conversation_id, created_at desc
  `)) as unknown as {
    conversation_id: string;
    body: string;
    sender_user_id: string;
    created_at: string;
  }[];

  const lastByConversation = new Map(
    lastRows.map((row) => [row.conversation_id, row])
  );

  // One query for unread counts, using each participant's read cursor.
  const unreadRows = (await db.execute(sql`
    select m.conversation_id, count(*)::int as unread
    from messages m
    join conversation_participants p
      on p.conversation_id = m.conversation_id
     and p.user_id = ${userId}::uuid
    where m.sender_user_id <> ${userId}::uuid
      and m.created_at > p.last_read_at
      and m.conversation_id in (${idList})
    group by m.conversation_id
  `)) as unknown as { conversation_id: string; unread: number }[];

  const unreadByConversation = new Map(
    unreadRows.map((row) => [row.conversation_id, Number(row.unread)])
  );

  const result: ConversationSummary[] = [];
  for (const row of rows) {
    const otherId = row.userAId === userId ? row.userBId : row.userAId;
    const otherUser = profiles.get(otherId);
    if (!otherUser) continue;
    const last = lastByConversation.get(row.id);
    result.push({
      id: row.id,
      otherUser,
      lastMessage: last
        ? {
            body: last.body,
            senderUserId: last.sender_user_id,
            createdAt: new Date(last.created_at).toISOString(),
          }
        : null,
      lastActivityAt: (
        last ? new Date(last.created_at) : new Date(row.lastMessageAt)
      ).toISOString(),
      unreadCount: unreadByConversation.get(row.id) ?? 0,
    });
  }

  return result.sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
}

export async function getThread(userId: string, conversationId: string) {
  const participant = await assertParticipant(userId, conversationId);
  const otherId =
    participant.userAId === userId ? participant.userBId : participant.userAId;
  const profiles = await getProfiles([otherId]);
  const otherUser = profiles.get(otherId);
  if (!otherUser) {
    throw new ConnectionError("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
  }

  const rows = await db
    .select({
      id: messages.id,
      body: messages.body,
      senderUserId: messages.senderUserId,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(THREAD_LIMIT);

  return {
    conversation: {
      id: conversationId,
      otherUser,
      lastReadAt: new Date(participant.lastReadAt).toISOString(),
    },
    messages: rows.map<ThreadMessage>((row) => ({
      id: row.id,
      body: row.body,
      senderUserId: row.senderUserId,
      createdAt: (row.createdAt ?? new Date()).toISOString(),
      mine: row.senderUserId === userId,
    })),
  };
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  rawBody: string
) {
  const participant = await assertParticipant(userId, conversationId);
  const otherId =
    participant.userAId === userId ? participant.userBId : participant.userAId;

  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  if (!body) {
    throw new ConnectionError("Write a message before sending.", 400, "EMPTY_MESSAGE");
  }
  if (body.length > MESSAGE_MAX_LENGTH) {
    throw new ConnectionError(
      `Messages are limited to ${MESSAGE_MAX_LENGTH} characters.`,
      400,
      "MESSAGE_TOO_LONG"
    );
  }

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(messages)
      .values({ conversationId, senderUserId: userId, body })
      .returning();

    await tx
      .update(conversations)
      .set({ lastMessageAt: created.createdAt ?? new Date() })
      .where(eq(conversations.id, conversationId));

    await tx
      .insert(notifications)
      .values({
        recipientUserId: otherId,
        actorUserId: userId,
        type: "message",
        conversationId,
        messageId: created.id,
        body:
          body.length > 140 ? `${body.slice(0, 137).trimEnd()}…` : body,
      })
      .onConflictDoNothing();

    return {
      id: created.id,
      body: created.body,
      senderUserId: created.senderUserId,
      createdAt: (created.createdAt ?? new Date()).toISOString(),
      mine: true,
    } satisfies ThreadMessage;
  });
}

/** Move this user's read cursor and clear the matching notifications. */
export async function markConversationRead(userId: string, conversationId: string) {
  await assertParticipant(userId, conversationId);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(conversationParticipants)
      .set({ lastReadAt: now })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    await tx
      .update(notifications)
      .set({ readAt: now })
      .where(
        and(
          eq(notifications.recipientUserId, userId),
          eq(notifications.conversationId, conversationId),
          isNull(notifications.readAt)
        )
      );
  });

  return { ok: true };
}

/** Badge data for the sidebar: unread messages + unread notifications. */
export async function getUnreadSummary(userId: string) {
  const rows = (await db.execute(sql`
    select
      (
        select count(*)::int
        from messages m
        join conversation_participants p
          on p.conversation_id = m.conversation_id
         and p.user_id = ${userId}::uuid
        where m.sender_user_id <> ${userId}::uuid
          and m.created_at > p.last_read_at
      ) as messages,
      (
        select count(*)::int
        from notifications n
        where n.recipient_user_id = ${userId}::uuid
          and n.read_at is null
      ) as notifications,
      (
        select count(*)::int
        from connection_requests r
        where r.recipient_user_id = ${userId}::uuid
          and r.status = 'pending'
      ) as pending_requests
  `)) as unknown as {
    messages: number;
    notifications: number;
    pending_requests: number;
  }[];

  return {
    messages: Number(rows[0]?.messages ?? 0),
    notifications: Number(rows[0]?.notifications ?? 0),
    pendingRequests: Number(rows[0]?.pending_requests ?? 0),
  };
}

/** Number of accepted-but-unopened conversations is not needed; kept simple. */
export async function countConnections(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(connections)
    .where(or(eq(connections.userAId, userId), eq(connections.userBId, userId)));
  return Number(row?.count ?? 0);
}

/** Guard used by the API layer to resolve a request's connection. */
export async function findConversationForRequest(requestId: string) {
  const [row] = await db
    .select({ conversationId: conversations.id })
    .from(connectionRequests)
    .innerJoin(connections, eq(connections.requestId, connectionRequests.id))
    .innerJoin(conversations, eq(conversations.connectionId, connections.id))
    .where(eq(connectionRequests.id, requestId))
    .limit(1);
  return row?.conversationId ?? null;
}

/** Used only for tests / diagnostics; not exposed over HTTP. */
export async function countUnreadMessages(userId: string, otherUserId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(
      conversations,
      eq(conversations.id, messages.conversationId)
    )
    .innerJoin(connections, eq(connections.id, conversations.connectionId))
    .where(
      and(
        ne(messages.senderUserId, userId),
        or(
          and(
            eq(connections.userAId, userId),
            eq(connections.userBId, otherUserId)
          ),
          and(
            eq(connections.userBId, userId),
            eq(connections.userAId, otherUserId)
          )
        )
      )
    );
  return Number(row?.count ?? 0);
}
