import { api } from "./client";

export const reviewsApi = {
  byProduct: (productId: string) => api.get(`/reviews/product/${productId}`).then((res) => res.data),
  submit: (payload: { productId: string; rating: number; comment: string }) =>
    api.post("/reviews", payload).then((res) => res.data),
};
