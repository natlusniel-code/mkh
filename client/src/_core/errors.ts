/**
 * Turning raw transport failures into something a shopper can read.
 *
 * The outage this exists for: the serverless function died on every request, so
 * the API answered with a plain-text host error page. The client called
 * `.json()` on it and the storefront printed
 *
 *     Unexpected token 'A', "A server e"... is not valid JSON
 *
 * to customers. That string is the browser complaining about Vercel's error
 * page — it says nothing about what went wrong and nothing about what to do.
 * Every path that can surface a transport error now goes through here.
 */

/** Shown whenever we could not reach the API at all. */
export const SERVER_UNREACHABLE_MESSAGE =
  "We can't reach the server right now — please try again shortly.";

/**
 * Patterns that mean "we never reached the API", not "the API said no".
 * A JSON parse failure, a host error page, or a crashed function all land here.
 */
const TRANSPORT_FAILURE =
  /is not valid JSON|Unexpected token|Unexpected end of JSON|FUNCTION_INVOCATION_FAILED|A server error has occurred|Failed to fetch|NetworkError|Load failed/i;

/**
 * A user-facing message for any thrown value.
 *
 * Deliberately conservative: a message the server wrote for the user (a tRPC
 * CONFLICT/BAD_REQUEST, e.g. "That email is already registered") is passed
 * through untouched, because it is the useful part. Only transport noise is
 * replaced.
 */
export function friendlyError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  if (!raw.trim()) return "Something went wrong. Please try again.";
  if (TRANSPORT_FAILURE.test(raw)) return SERVER_UNREACHABLE_MESSAGE;
  return raw;
}

/** True when the failure was transport-level rather than a real API answer. */
export function isTransportFailure(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return TRANSPORT_FAILURE.test(raw);
}
