import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { Category, Product } from "../types";
import { ProductCard } from "../components/catalog/ProductCard";
import { CategoryTiles } from "../components/catalog/CategoryTiles";
import { ProductSkeletonCard } from "../components/ui/ProductSkeletonCard";

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      catalogApi.products({ featured: true, limit: 8, sort: "rating" }),
      catalogApi.categories(),
    ])
      .then(([productsResponse, categoriesResponse]) => {
        setFeatured(productsResponse.data);
        setCategories(categoriesResponse);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-r from-brand-red to-red-700 px-6 py-14 text-white md:px-12">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-red-400/30 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Enterprise E-Commerce
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
            Smart shopping across electronics, clothing, utensils, and furniture.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-red-100 md:text-base">
            RedCart delivers secure checkout, persistent carts, M-Pesa billing, intelligent product recommendations, and
            enterprise-grade reliability.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-red transition hover:bg-red-100"
            >
              Shop Now
            </Link>
            <Link
              to="/category/electronics"
              className="rounded-xl border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Electronics
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Promotional Banner</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-brand-ink">Weekend Offer: up to 30% off selected products</h2>
        <p className="mt-2 text-sm text-zinc-600">Checkout with M-Pesa at payment step and track every order from your dashboard.</p>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold text-brand-ink">Featured Products</h2>
          <Link to="/shop" className="text-sm font-semibold text-brand-red hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => <ProductSkeletonCard key={idx} />)
            : featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <CategoryTiles categories={categories} />

      <section>
        <h2 className="font-display text-3xl font-semibold text-brand-ink">Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "RedCart helped us scale online sales with secure checkout and inventory control.",
            "The AI assistant answers customer questions instantly and improves conversion.",
            "Persistent carts and smooth M-Pesa checkout significantly reduced drop-offs.",
          ].map((quote, index) => (
            <article key={quote} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
              <p className="text-sm text-zinc-700">"{quote}"</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-red">Client {index + 1}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
