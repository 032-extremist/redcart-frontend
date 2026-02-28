import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { catalogApi } from "../api/catalog";
import { Category, Product } from "../types";
import { ProductCard } from "../components/catalog/ProductCard";
import { EmptyState } from "../components/ui/EmptyState";

export function CategoryPage() {
  const { categorySlug = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi.categories().then((all) => {
      const found = all.find((item) => item.slug === categorySlug) ?? null;
      setCategory(found);
    });
  }, [categorySlug]);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .products({
        category: categorySlug,
        subcategory: subcategory || undefined,
        limit: 16,
      })
      .then((response) => setProducts(response.data))
      .finally(() => setLoading(false));
  }, [categorySlug, subcategory]);

  if (!category && !loading) {
    return <EmptyState title="Category not found" description="Please choose a valid category from the shop menu." />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">{category?.name ?? "Category"}</h1>
        <p className="text-sm text-zinc-600">Browse subcategories, filter products, and add to cart.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Subcategory Filter</label>
        <select
          value={subcategory}
          onChange={(event) => setSubcategory(event.target.value)}
          className="w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All subcategories</option>
          {category?.subcategories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-600">Loading products...</p>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in this category"
          description="Try another subcategory or return to the full shop listing."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
