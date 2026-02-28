import { api } from "./client";
import { Cart } from "../types";

export const cartApi = {
  getCart: () => api.get<Cart>("/cart").then((res) => res.data),

  addItem: (payload: { productId: string; quantity: number }) =>
    api.post<Cart>("/cart/items", payload).then((res) => res.data),

  updateItem: (itemId: string, payload: { quantity: number }) =>
    api.patch<Cart>(`/cart/items/${itemId}`, payload).then((res) => res.data),

  removeItem: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`).then((res) => res.data),
};
