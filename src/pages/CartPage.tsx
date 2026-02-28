import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { EmptyState } from "../components/ui/EmptyState";

export function CartPage() {
  const { cart, loading, updateItemQty, removeItem } = useCart();

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyState title="Your cart is empty" description="Add products from the shop to begin checkout." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <section className="space-y-4">
        {cart.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
            <div className="flex items-start gap-4">
              <img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900">{item.product.name}</h3>
                <p className="text-sm text-zinc-500">${item.product.price.toFixed(2)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateItemQty(item.id, Math.max(1, item.quantity - 1))}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateItemQty(item.id, item.quantity + 1)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold text-zinc-800">${item.subtotal.toFixed(2)}</p>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm text-zinc-700">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </p>
          <p className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </p>
        </div>

        <Link
          to="/checkout"
          className="mt-5 block rounded-xl bg-brand-red px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}
