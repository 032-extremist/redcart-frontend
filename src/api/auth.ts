import { api } from "./client";
import { AuthUser } from "../types";

interface AuthPayload {
  token: string;
  csrfToken: string;
  user: AuthUser;
}

interface AuthMeResponse extends AuthUser {
  phone?: string;
  createdAt: string;
  csrfToken: string;
}

export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post<AuthPayload>("/auth/register", payload).then((res) => res.data),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthPayload>("/auth/login", payload).then((res) => res.data),

  me: () => api.get<AuthMeResponse>("/auth/me").then((res) => res.data),

  logout: () => api.post("/auth/logout").then((res) => res.data),

  requestPasswordReset: (email: string) =>
    api.post("/auth/password-reset/request", { email }).then((res) => res.data),

  confirmPasswordReset: (payload: { email: string; newPassword: string }) =>
    api.post("/auth/password-reset/confirm", payload).then((res) => res.data),
};
