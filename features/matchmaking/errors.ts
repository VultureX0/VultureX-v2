export class MatchError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "MATCH_ERROR") {
    super(message);
    this.name = "MatchError";
    this.status = status;
    this.code = code;
  }
}

export function matchErrorPayload(error: unknown) {
  if (error instanceof MatchError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }
  console.error("Matchmaking error:", error);
  return {
    status: 500,
    body: { error: "Something went wrong. Please try again.", code: "INTERNAL" },
  };
}
