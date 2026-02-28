import { Link, useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { wishlistApi } from "../../api/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await addToCart(product.id, 1);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await wishlistApi.add(product.id);
  };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-3 shadow-soft transition hover:-translate-y-1 hover:border-red-200 hover:shadow-card">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-44 w-full rounded-xl object-cover"
        loading="lazy"
      />

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="font-display text-lg font-semibold text-zinc-900">{product.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
          {product.category.name}
          {product.subcategory ? ` / ${product.subcategory.name}` : ""}
        </p>

        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {product.rating.toFixed(1)} ({product.reviewCount})
        </div>

        <div className="mt-2 text-sm">
          <span className="font-semibold text-brand-red">${product.price.toFixed(2)}</span>
          <span className={`ml-2 ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="rounded-xl bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            Add to Cart
          </button>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Link
              to={`/products/${product.slug}`}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-center text-sm font-semibold text-zinc-700 transition hover:border-brand-red hover:text-brand-red"
            >
              View Details
            </Link>
            <button
              type="button"
              onClick={handleWishlist}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-zinc-700 transition hover:border-brand-red hover:text-brand-red"
              aria-label="Add to wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
