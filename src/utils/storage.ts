const TOKEN_KEY = "redcart_token";
const CSRF_KEY = "redcart_csrf";
const USER_KEY = "redcart_user";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getCsrfToken: () => localStorage.getItem(CSRF_KEY),
  setCsrfToken: (token: string) => localStorage.setItem(CSRF_KEY, token),
  clearCsrfToken: () => localStorage.removeItem(CSRF_KEY),

  getUser: <T>() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CSRF_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
