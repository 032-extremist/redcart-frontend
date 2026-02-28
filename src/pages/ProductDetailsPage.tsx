import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { reviewsApi } from "../api/reviews";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/ui/EmptyState";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface ProductWithReviews extends Product {
  reviews: Review[];
}

export function ProductDetailsPage() {
  const { productSlug = "" } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");

  const loadProduct = () => {
    setLoading(true);
    catalogApi
      .productByIdOrSlug(productSlug)
      .then((data) => setProduct(data as ProductWithReviews))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [productSlug]);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      setError("Login required to submit a review.");
      return;
    }

    try {
      await reviewsApi.submit({
        productId: product.id,
        rating: review.rating,
        comment: review.comment,
      });
      setReview({ rating: 5, comment: "" });
      loadProduct();
    } catch {
      setError("Unable to submit review right now.");
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await addToCart(product.id, 1);
  };

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading product...</p>;
  }

  if (!product) {
    return <EmptyState title="Product not found" description="The requested product could not be located." />;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft md:grid-cols-2">
        <img src={product.imageUrl} alt={product.name} className="h-[360px] w-full rounded-2xl object-cover" />

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {product.category.name}
            {product.subcategory ? ` / ${product.subcategory.name}` : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-zinc-900">{product.name}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-700">{product.description}</p>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-2xl font-bold text-brand-red">${product.price.toFixed(2)}</p>
            <p className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="mt-6 rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            Add to Cart
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Customer Reviews</h2>
          <div className="mt-4 space-y-4">
            {product.reviews.length === 0 && <p className="text-sm text-zinc-500">No reviews yet.</p>}
            {product.reviews.map((item) => (
              <article key={item.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-sm font-semibold text-zinc-800">
                  {item.user.firstName} {item.user.lastName}
                </p>
                <p className="text-xs text-zinc-500">Rating: {item.rating}/5</p>
                <p className="mt-2 text-sm text-zinc-700">{item.comment}</p>
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={submitReview} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Write a Review</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-700">
              Rating
              <select
                value={review.rating}
                onChange={(event) => setReview((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-zinc-700">
              Comment
              <textarea
                value={review.comment}
                onChange={(event) => setReview((prev) => ({ ...prev, comment: event.target.value }))}
                className="mt-1 h-24 w-full rounded-lg border border-zinc-300 px-3 py-2"
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white">
              Submit Review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
