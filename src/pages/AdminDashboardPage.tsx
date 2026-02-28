import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/admin";
import { catalogApi } from "../api/catalog";
import { Category } from "../types";

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    categoryId: 0,
    subcategoryId: 0,
    isFeatured: false,
  });

  const [stockForm, setStockForm] = useState({
    productId: "",
    delta: 1,
    reason: "Manual adjustment",
  });
  const [manageForm, setManageForm] = useState({
    productId: "",
    name: "",
    price: "",
    action: "update" as "update" | "delete",
  });

  useEffect(() => {
    Promise.all([adminApi.salesAnalytics(), catalogApi.categories()]).then(([a, c]) => {
      setAnalytics(a);
      setCategories(c);
    });
  }, []);

  const subcategories = useMemo(() => {
    if (!selectedCategoryId) {
      return [];
    }
    return categories.find((item) => item.id === selectedCategoryId)?.subcategories ?? [];
  }, [categories, selectedCategoryId]);

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      let imageUrl = productForm.imageUrl.trim();

      if (productImageFile) {
        setStatus("Uploading product image...");
        const upload = await adminApi.uploadProductImage(productImageFile);
        imageUrl = upload.imageUrl;
      }

      if (!imageUrl) {
        setStatus("Provide an image URL or upload an image file.");
        return;
      }

      await adminApi.createProduct({
        ...productForm,
        imageUrl,
        categoryId: Number(productForm.categoryId),
        subcategoryId: Number(productForm.subcategoryId) || undefined,
      });
      setStatus("Product created successfully.");
      setProductImageFile(null);
    } catch {
      setStatus("Unable to create product.");
    }
  };

  const updateStock = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      await adminApi.updateStock(stockForm.productId, { delta: Number(stockForm.delta), reason: stockForm.reason });
      setStatus("Stock updated successfully.");
    } catch {
      setStatus("Unable to update stock.");
    }
  };

  const manageProduct = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      if (manageForm.action === "delete") {
        await adminApi.deleteProduct(manageForm.productId);
        setStatus("Product deleted successfully.");
        return;
      }

      const payload: { name?: string; price?: number } = {};
      if (manageForm.name.trim()) {
        payload.name = manageForm.name.trim();
      }
      if (manageForm.price !== "") {
        payload.price = Number(manageForm.price);
      }

      await adminApi.updateProduct(manageForm.productId, payload);
      setStatus("Product updated successfully.");
    } catch {
      setStatus("Unable to process product action.");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-zinc-600">Manage products, inventory, and sales analytics.</p>
      </header>

      {analytics && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Orders</p>
            <p className="mt-2 font-display text-3xl font-semibold">{analytics.ordersCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Revenue</p>
            <p className="mt-2 font-display text-3xl font-semibold">${analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Pending Payments</p>
            <p className="mt-2 font-display text-3xl font-semibold">{analytics.pendingPayments}</p>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createProduct} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Add Product</h2>
          <div className="mt-4 space-y-3 text-sm">
            <input
              required
              placeholder="Product Name"
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <textarea
              required
              placeholder="Description"
              value={productForm.description}
              onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
              className="h-24 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              required
              type="number"
              min={0}
              step="0.01"
              placeholder="Price"
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              required
              type="number"
              min={0}
              placeholder="Stock"
              value={productForm.stock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              type="url"
              placeholder="Image URL"
              value={productForm.imageUrl}
              onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => setProductImageFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <p className="text-xs text-zinc-500">
              Upload a product image file (JPG, PNG, WEBP, GIF) or provide an image URL above.
            </p>

            <select
              required
              value={selectedCategoryId}
              onChange={(event) => {
                const nextId = Number(event.target.value);
                setSelectedCategoryId(nextId);
                setProductForm((prev) => ({ ...prev, categoryId: nextId, subcategoryId: 0 }));
              }}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={productForm.subcategoryId}
              onChange={(event) =>
                setProductForm((prev) => ({ ...prev, subcategoryId: Number(event.target.value) }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value={0}>No subcategory</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={productForm.isFeatured}
                onChange={(event) => setProductForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
              />
              Featured product
            </label>

            <button type="submit" className="rounded-xl bg-brand-red px-5 py-2 font-semibold text-white">
              Create Product
            </button>
          </div>
        </form>

        <form onSubmit={updateStock} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Inventory Tracking</h2>
          <div className="mt-4 space-y-3 text-sm">
            <input
              required
              placeholder="Product ID"
              value={stockForm.productId}
              onChange={(event) => setStockForm((prev) => ({ ...prev, productId: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              required
              type="number"
              placeholder="Delta (+/-)"
              value={stockForm.delta}
              onChange={(event) => setStockForm((prev) => ({ ...prev, delta: Number(event.target.value) }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              required
              placeholder="Reason"
              value={stockForm.reason}
              onChange={(event) => setStockForm((prev) => ({ ...prev, reason: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />

            <button type="submit" className="rounded-xl bg-zinc-900 px-5 py-2 font-semibold text-white">
              Update Stock
            </button>

            {analytics?.topProducts?.length > 0 && (
              <div className="mt-4 rounded-xl border border-zinc-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Top Products</p>
                <ul className="mt-2 space-y-1">
                  {analytics.topProducts.map((item: any) => (
                    <li key={item.productId} className="text-sm text-zinc-700">
                      {item.productName}: {item.quantitySold} sold (${item.revenue.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-semibold">Edit or Delete Product</h2>
        <form onSubmit={manageProduct} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Product ID"
            value={manageForm.productId}
            onChange={(event) => setManageForm((prev) => ({ ...prev, productId: event.target.value }))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            value={manageForm.action}
            onChange={(event) =>
              setManageForm((prev) => ({ ...prev, action: event.target.value as "update" | "delete" }))
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <input
            placeholder="New Name (for update)"
            value={manageForm.name}
            onChange={(event) => setManageForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="New Price (for update)"
            value={manageForm.price}
            onChange={(event) => setManageForm((prev) => ({ ...prev, price: event.target.value }))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="md:col-span-2 rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white">
            Apply Action
          </button>
        </form>
      </section>

      {status && <p className="text-sm text-zinc-700">{status}</p>}
    </div>
  );
}
