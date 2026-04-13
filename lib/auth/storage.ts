import type { AuthSession } from "@/lib/auth/types";
import {
    AUTH_ACCESS_TOKEN_COOKIE,
    AUTH_COOKIE_MAX_AGE,
    AUTH_ROLE_COOKIE,
    AUTH_SESSION_EVENT,
    AUTH_STORAGE_KEY,
} from "@/lib/auth/constants";

const isBrowser = () => typeof window !== "undefined";
let cachedRawSession: string | null | undefined;
let cachedSession: AuthSession | null = null;

function notifyAuthSessionChanged() {
    if (!isBrowser()) return;
    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

function saveAuthRoleCookie(role: AuthSession["user"]["role"]) {
    document.cookie = `${AUTH_ROLE_COOKIE}=${role}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function saveAccessTokenCookie(accessToken: string) {
    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=${accessToken}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearAuthRoleCookie() {
    document.cookie = `${AUTH_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function clearAccessTokenCookie() {
    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function saveAuthSession(session: AuthSession) {
    if (!isBrowser()) return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    saveAuthRoleCookie(session.user.role);
    saveAccessTokenCookie(session.accessToken);
    notifyAuthSessionChanged();
}

export function getAuthSession(): AuthSession | null {
    if (!isBrowser()) return null;

    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return null;

    try {
        return JSON.parse(rawSession) as AuthSession;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        clearAuthRoleCookie();
        clearAccessTokenCookie();
        notifyAuthSessionChanged();
        return null;
    }
}

export function clearAuthSession() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    clearAuthRoleCookie();
    clearAccessTokenCookie();
    notifyAuthSessionChanged();
}

export function getAccessToken() {
    return getAuthSession()?.accessToken ?? null;
}

export function subscribeAuthSession(listener: () => void) {
    if (!isBrowser()) {
        return () => { };
    }

    const handleChange = () => listener();
    window.addEventListener(AUTH_SESSION_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
        window.removeEventListener(AUTH_SESSION_EVENT, handleChange);
        window.removeEventListener("storage", handleChange);
    };
}

export function getAuthSessionSnapshot(): AuthSession | null {
    if (!isBrowser()) return null;

    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (rawSession === cachedRawSession) {
        return cachedSession;
    }

    cachedRawSession = rawSession;

    if (!rawSession) {
        cachedSession = null;
        return cachedSession;
    }

    try {
        cachedSession = JSON.parse(rawSession) as AuthSession;
        return cachedSession;
    } catch {
        cachedSession = null;
        return cachedSession;
    }
}