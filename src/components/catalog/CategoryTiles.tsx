import { Link } from "react-router-dom";
import { Category } from "../../types";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section>
      <h2 className="font-display text-3xl font-semibold text-brand-ink">Shop by Category</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-red"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100 transition group-hover:scale-110" />
            <h3 className="font-display text-xl font-semibold text-zinc-900">{category.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">{category.subcategories.length} subcategories</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-red">Explore</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
