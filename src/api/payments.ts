import { api } from "./client";

export const paymentsApi = {
  initiateMpesaStkPush: (payload: { paymentId: string; phoneNumber: string }) =>
    api.post("/payments/mpesa/stk-push", payload).then((res) => res.data),
  getMpesaStatus: (paymentId: string) => api.get(`/payments/mpesa/${paymentId}/status`).then((res) => res.data),
};
