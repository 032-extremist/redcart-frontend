export type UserRole = "ADMIN" | "CUSTOMER";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  category: { name: string; slug: string };
  subcategory?: { name: string; slug: string } | null;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  subtotal: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface PaymentInfo {
  id: string;
  provider: "MPESA" | "CARD";
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  transactionRef?: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED";
  paymentMethod: "MPESA" | "CARD";
  total: number;
  createdAt: string;
  items: OrderItem[];
  payment?: PaymentInfo | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface AiResponse {
  reply: string;
  suggestions: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
  }>;
}
