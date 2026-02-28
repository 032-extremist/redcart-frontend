import { api } from "./client";
import { Order } from "../types";

interface CheckoutPayload {
  paymentMethod: "MPESA" | "CARD";
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingStreet: string;
  shippingCity: string;
  shippingCountry: string;
  mpesaPayerName?: string;
}

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    api.post<{
      orderId: string;
      status: string;
      payment: {
        id: string;
        provider: "MPESA" | "CARD";
        status: string;
        amount: number;
        transactionRef?: string;
      };
      total: number;
      nextAction: string;
    }>("/orders/checkout", payload)
      .then((res) => res.data),

  list: () => api.get<Order[]>("/orders").then((res) => res.data),

  status: (orderId: string) => api.get(`/orders/${orderId}/status`).then((res) => res.data),
};
