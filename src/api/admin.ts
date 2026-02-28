import { api } from "./client";

export const adminApi = {
  salesAnalytics: () => api.get("/admin/analytics/sales").then((res) => res.data),

  uploadProductImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post("/admin/products/image", form).then((res) => res.data as { imageUrl: string; fileName: string; size: number; mimeType: string });
  },

  createProduct: (payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: number;
    subcategoryId?: number;
    isFeatured?: boolean;
  }) => api.post("/admin/products", payload).then((res) => res.data),

  updateStock: (productId: string, payload: { delta: number; reason: string }) =>
    api.post(`/admin/products/${productId}/stock`, payload).then((res) => res.data),

  updateProduct: (
    productId: string,
    payload: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      imageUrl: string;
      categoryId: number;
      subcategoryId: number | null;
      isFeatured: boolean;
    }>,
  ) => api.patch(`/admin/products/${productId}`, payload).then((res) => res.data),

  deleteProduct: (productId: string) => api.delete(`/admin/products/${productId}`).then((res) => res.data),
};
