import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";
import { SERVER_UNREACHABLE_MESSAGE } from "./errors";

// Typed tRPC client. `AppRouter` is a TYPE-ONLY import from the server, so the
// whole API is end-to-end typed without shipping server code to the browser.
export const trpc = createTRPCReact<AppRouter>();

/**
 * A fetch that refuses to hand a non-JSON body to the tRPC parser.
 *
 * tRPC assumes every response is JSON. When the API is unreachable — a crashed
 * serverless function, a proxy 502, a host error page — the body is HTML or
 * plain text, and `.json()` throws
 * `Unexpected token 'A', "A server e"... is not valid JSON`, which the UI then
 * showed to shoppers verbatim.
 *
 * Checking `content-type` here means the failure is caught at the boundary and
 * reported as a sentence a person can act on. The real body is logged to the
 * console so the actual cause is still available to whoever is debugging.
 */
async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (err) {
    // Network-level failure: offline, DNS, CORS, connection reset.
    console.error("[api] request failed before a response was received", err);
    throw new Error(SERVER_UNREACHABLE_MESSAGE);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await res.text().catch(() => "");
    console.error(
      `[api] non-JSON response (status ${res.status}, content-type "${contentType}") — ` +
        `the API was not reached. Body starts: ${body.slice(0, 300)}`,
    );
    throw new Error(SERVER_UNREACHABLE_MESSAGE);
  }

  return res;
}

export function makeTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/trpc",
        transformer: superjson,
        fetch: resilientFetch,
      }),
    ],
  });
}
