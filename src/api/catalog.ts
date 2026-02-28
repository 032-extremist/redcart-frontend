import { api } from "./client";
import { Category, Product, ProductListResponse } from "../types";

export const catalogApi = {
  categories: () => api.get<Category[]>("/catalog/categories").then((res) => res.data),

  products: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ProductListResponse>("/catalog/products", { params }).then((res) => res.data),

  productByIdOrSlug: (value: string) =>
    api.get<Product>(`/catalog/products/${value}`).then((res) => res.data),
};
