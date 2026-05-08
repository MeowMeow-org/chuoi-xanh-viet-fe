import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_MAX_AGE,
  AUTH_ROLE_COOKIE,
} from "./constants";

type SaveAuthCookiesPayload = {
  accessToken: string;
  role?: string | null;
};

const isBrowser = () => typeof window !== "undefined";

export function saveAuthCookies({ accessToken, role }: SaveAuthCookiesPayload) {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=${accessToken}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;

  if (role) {
    document.cookie = `${AUTH_ROLE_COOKIE}=${role}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
