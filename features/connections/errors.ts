/**
 * A failure that maps cleanly onto an HTTP response. Service functions throw
 * these instead of returning sentinel values so every route reports the same
 * status/code for the same situation.
 */
export class ConnectionError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ConnectionError";
    this.status = status;
    this.code = code;
  }
}

export function errorPayload(error: unknown) {
  if (error instanceof ConnectionError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }

  console.error("[connections]", error);
  return {
    status: 500,
    body: { error: "Something went wrong. Please try again.", code: "INTERNAL" },
  };
}
