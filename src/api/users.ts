import { api } from "./client";
import { AuthUser } from "../types";

export const usersApi = {
  profile: () => api.get<AuthUser & { phone?: string; createdAt: string }>("/users/profile").then((res) => res.data),
  updateProfile: (payload: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch("/users/profile", payload).then((res) => res.data),
};
