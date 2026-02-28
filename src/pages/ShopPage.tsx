import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { Category, Product, ProductListResponse } from "../types";
import { ProductCard } from "../components/catalog/ProductCard";
import { ProductSkeletonCard } from "../components/ui/ProductSkeletonCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
  { label: "Rating", value: "rating" },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [response, setResponse] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") ?? "";
  const subcategory = searchParams.get("subcategory") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    catalogApi.categories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .products({
        category: category || undefined,
        subcategory: subcategory || undefined,
        sort,
        page,
        limit: 12,
        search: debouncedSearch || undefined,
      })
      .then((data) => setResponse(data))
      .finally(() => setLoading(false));
  }, [category, subcategory, sort, page, debouncedSearch]);

  const categoryOptions = useMemo(() => categories, [categories]);
  const selectedCategory = categoryOptions.find((item) => item.slug === category);

  const updateFilter = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    setSearchParams(params);
  };

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const products: Product[] = response?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Shop</h1>
        <p className="text-sm text-zinc-600">Filter by category, subcategory, search term, and sort order.</p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Category</label>
          <select
            value={category}
            onChange={(event) => updateFilter({ category: event.target.value, subcategory: "" })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Subcategory</label>
          <select
            value={subcategory}
            onChange={(event) => updateFilter({ subcategory: event.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All subcategories</option>
            {(selectedCategory?.subcategories ?? []).map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Sort</label>
          <select
            value={sort}
            onChange={(event) => updateFilter({ sort: event.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Search</label>
          <input
            value={search}
            onChange={(event) => updateFilter({ search: event.target.value })}
            placeholder="Find product"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section>
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductSkeletonCard key={idx} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <EmptyState
            title="No products found"
            description={response?.message ?? `No match found for '${search || "your query"}'`}
          />
        )}

        {!loading && products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {!loading && response && response.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600">
            Page {page} of {response.meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(response.meta.totalPages, page + 1))}
            disabled={page >= response.meta.totalPages}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
