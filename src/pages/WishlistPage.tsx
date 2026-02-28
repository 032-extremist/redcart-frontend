import { useEffect, useState } from "react";
import { wishlistApi } from "../api/wishlist";
import { WishlistItem } from "../types";
import { EmptyState } from "../components/ui/EmptyState";
import { Link } from "react-router-dom";

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    wishlistApi
      .list()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId: string) => {
    await wishlistApi.remove(productId);
    load();
  };

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading wishlist...</p>;
  }

  if (items.length === 0) {
    return <EmptyState title="Wishlist is empty" description="Save products to revisit them later." />;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">Wishlist</h1>

      {items.map((item) => (
        <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
          <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
          <div className="flex-1">
            <Link to={`/products/${item.product.slug}`} className="font-semibold text-zinc-900 hover:text-brand-red">
              {item.product.name}
            </Link>
            <p className="text-sm text-zinc-500">${item.product.price.toFixed(2)}</p>
          </div>
          <button type="button" onClick={() => remove(item.product.id)} className="text-sm font-semibold text-red-600">
            Remove
          </button>
        </article>
      ))}
    </div>
  );
}
