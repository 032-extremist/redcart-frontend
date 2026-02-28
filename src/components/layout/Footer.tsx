import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-brand-red">RedCart</h3>
          <p className="mt-3 text-sm text-zinc-600">
            Enterprise-grade multi-category e-commerce platform with secure checkout and intelligent shopping assistance.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">About</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <Link to="/shop" className="hover:text-brand-red">
                Company
              </Link>
            </li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>support@redcart.com</li>
            <li>+254 700 000 000</li>
            <li>Nairobi, Kenya</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Policies</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Return Policy</li>
            <li className="pt-2">Social: LinkedIn, X, Instagram</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
