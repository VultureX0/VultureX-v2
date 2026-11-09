/** Maps competition failures onto the same HTTP response shape as the rest of
 * the platform (see features/connections/errors.ts). */
export class CompetitionError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "CompetitionError";
    this.status = status;
    this.code = code;
  }
}

export function competitionErrorPayload(error: unknown) {
  if (error instanceof CompetitionError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }

  console.error("[competitions]", error);
  return {
    status: 500,
    body: {
      error: "Something went wrong. Please try again.",
      code: "INTERNAL",
    },
  };
}
