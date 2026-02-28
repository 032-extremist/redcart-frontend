import { api } from "./client";
import { WishlistItem } from "../types";

export const wishlistApi = {
  list: () => api.get<WishlistItem[]>("/wishlist").then((res) => res.data),
  add: (productId: string) => api.post("/wishlist", { productId }).then((res) => res.data),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`).then((res) => res.data),
};
