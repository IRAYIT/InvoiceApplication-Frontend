import axios from "axios";

// Change this (or set VITE_API_URL in a .env file) when the backend is not on localhost.
const API_URL = import.meta.env.VITE_API_URL || "https://invoice-app-iray.azurewebsites.net";

// The short-lived access token lives only in memory, never in localStorage.
// After a page reload it is restored from the HttpOnly refresh cookie.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Instances that talk to the login endpoints. They send the refresh cookie.
export const authApi = axios.create({
  baseURL: `${API_URL}/api/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const accountApi = axios.create({
  baseURL: `${API_URL}/api/account`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

async function requestRefresh() {
  const res = await authApi.post("/refresh");
  accessToken = res.data.token;
  return res.data;
}

/**
 * Gets a new access token using the refresh cookie.
 * Only one refresh runs at a time: inside this tab (shared promise) and across
 * browser tabs (Web Locks), because the refresh token changes on every use.
 */
export function refreshSession() {
  if (!refreshPromise) {
    const run = navigator.locks
      ? navigator.locks.request("invoice-auth-refresh", requestRefresh)
      : requestRefresh();
    refreshPromise = Promise.resolve(run).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Adds "Authorization: Bearer <token>" to every request of an axios instance and,
 * when the server answers 401, refreshes the session once and repeats the request.
 */
export function attachAuth(instance) {
  instance.interceptors.request.use((config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && original && !original._retried) {
        original._retried = true;
        try {
          await refreshSession();
          original.headers.Authorization = `Bearer ${accessToken}`;
          return instance(original);
        } catch {
          accessToken = null;
          window.dispatchEvent(new Event("auth:logout"));
        }
      }
      return Promise.reject(error);
    }
  );
}

/** Same as fetch(), but with the login token (for the few places that do not use axios). */
export async function authFetch(url, options = {}) {
  const send = () =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await send();
  if (res.status === 401) {
    try {
      await refreshSession();
      res = await send();
    } catch {
      accessToken = null;
      window.dispatchEvent(new Event("auth:logout"));
    }
  }
  return res;
}

// Every normal request in the app (axios.get, axios.post, ...) now carries the token.
attachAuth(axios);
attachAuth(accountApi);

// ------------------------------------------------------------------ API calls

export const AuthApi = {
  register: (payload) => authApi.post("/register", payload),
  verifyEmail: (email, code) => authApi.post("/verify-email", { email, code }),
  resendVerification: (email) => authApi.post("/resend-verification", { email }),
  forgotPassword: (email) => authApi.post("/forgot-password", { email }),
  resetPassword: (payload) => authApi.post("/reset-password", payload),

  async login(email, password) {
    const { data } = await authApi.post("/login", { email, password });
    accessToken = data.token;
    return data;
  },

  async logout() {
    try {
      await authApi.post("/logout");
    } finally {
      accessToken = null;
    }
  },
};

export const AccountApi = {
  async changePassword(payload) {
    const { data } = await accountApi.post("/change-password", payload);
    accessToken = data.token; // every other device was logged out; this one gets a fresh session
    return data;
  },

  async logoutAll() {
    try {
      await accountApi.post("/logout-all");
    } finally {
      accessToken = null;
    }
  },
};

// ------------------------------------------------------------------ errors

const KNOWN_CODES = new Set([
  "INVALID_CREDENTIALS",
  "EMAIL_NOT_VERIFIED",
  "WEAK_PASSWORD",
  "INVALID_CODE",
  "PASSWORD_MISMATCH",
  "WRONG_CURRENT_PASSWORD",
  "SAME_PASSWORD",
  "ACCOUNT_LOCKED",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
]);

/** Turns any failed request into one of our error codes. */
export function errorCode(error) {
  if (!error?.response) return "NETWORK";
  const code = error.response.data?.code;
  if (KNOWN_CODES.has(code)) return code;
  if (error.response.status === 429) return "RATE_LIMITED";
  return "UNKNOWN";
}

/** The translation key of the message to show for a failed request. */
export const errorKey = (error) => `auth.errors.${errorCode(error)}`;