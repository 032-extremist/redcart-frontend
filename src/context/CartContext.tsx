import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { cartApi } from "../api/cart";
import { Cart } from "../types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItemQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearLocalCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const nextCart = await cartApi.getCart();
      setCart(nextCart);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity = 1) => {
    const nextCart = await cartApi.addItem({ productId, quantity });
    setCart(nextCart);
  };

  const updateItemQty = async (itemId: string, quantity: number) => {
    const nextCart = await cartApi.updateItem(itemId, { quantity });
    setCart(nextCart);
  };

  const removeItem = async (itemId: string) => {
    const nextCart = await cartApi.removeItem(itemId);
    setCart(nextCart);
  };

  const clearLocalCart = () => {
    setCart(null);
  };

  const value = useMemo(
    () => ({
      cart,
      loading,
      refreshCart,
      addToCart,
      updateItemQty,
      removeItem,
      clearLocalCart,
    }),
    [cart, loading],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
