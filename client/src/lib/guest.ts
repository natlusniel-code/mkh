// Guest cart identity. A guest gets a stable random token in localStorage so
// their cart survives a refresh; on login the server merges it into their cart.
const KEY = "markethub_guest_token";

export function guestToken(): string {
  if (typeof window === "undefined") return "";
  let t = window.localStorage.getItem(KEY);
  if (!t) {
    t = crypto.randomUUID();
    window.localStorage.setItem(KEY, t);
  }
  return t;
}

export function clearGuestToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
