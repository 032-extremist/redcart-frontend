import { api } from "./client";
import { AiResponse } from "../types";

export const aiApi = {
  chat: (message: string) => api.post<AiResponse>("/ai/chat", { message }).then((res) => res.data),
};
