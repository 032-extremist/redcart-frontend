import { FormEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export function Navbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-red-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap">
        <Link to="/" className="font-display text-2xl font-bold text-brand-red">
          RedCart
        </Link>

        <form onSubmit={handleSearch} className="flex-1">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, categories, descriptions"
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm outline-none transition focus:border-brand-red"
          />
        </form>

        <nav className="flex items-center gap-3 text-sm font-medium text-zinc-700">
          <NavLink to="/shop" className="hover:text-brand-red">
            Shop
          </NavLink>
          <NavLink to="/assistant" className="hover:text-brand-red">
            AI Assistant
          </NavLink>
          <NavLink to="/orders" className="hover:text-brand-red">
            Orders
          </NavLink>
          <NavLink to="/cart" className="relative rounded-lg border border-zinc-200 p-2 hover:border-brand-red">
            <ShoppingCart size={18} />
            <span className="absolute -right-1 -top-1 rounded-full bg-brand-red px-1.5 text-[10px] font-semibold text-white">
              {cart?.items.length ?? 0}
            </span>
          </NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === "ADMIN" && (
                <NavLink to="/admin" className="rounded-lg border border-zinc-200 p-2 hover:border-brand-red">
                  <LayoutDashboard size={18} />
                </NavLink>
              )}
              <NavLink to="/profile" className="rounded-lg border border-zinc-200 p-2 hover:border-brand-red">
                <User size={18} />
              </NavLink>
              <NavLink to="/wishlist" className="hover:text-brand-red">
                Wishlist
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-xs hover:border-brand-red hover:text-brand-red"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-brand-red px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-deep"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
