import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/admin";
import { catalogApi } from "../api/catalog";
import { AdminOrder, Category } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

type SalesAnalytics = {
  ordersCount: number;
  totalRevenue: number;
  pendingPayments: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
};

type OrdersFilter = "ALL" | "PENDING" | "SUCCESS";

const paymentStatusBadge: Record<NonNullable<AdminOrder["paymentStatus"]>, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const orderStatusLabel: Record<AdminOrder["orderStatus"], string> = {
  PENDING_PAYMENT: "Pending Payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersFilter, setOrdersFilter] = useState<OrdersFilter>("ALL");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [orderActionId, setOrderActionId] = useState<string | null>(null);

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

  const loadOrders = async (filter: OrdersFilter) => {
    setOrdersLoading(true);

    try {
      const response = await adminApi.listOrders({
        paymentStatus: filter === "ALL" ? undefined : filter,
        page: 1,
        limit: 100,
      });
      setOrders(response.data);
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to load admin order records."));
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [sales, fetchedCategories] = await Promise.all([adminApi.salesAnalytics(), catalogApi.categories()]);
        setAnalytics(sales as SalesAnalytics);
        setCategories(fetchedCategories);
      } catch (error) {
        setStatus(getApiErrorMessage(error, "Unable to load admin dashboard details."));
      }
    };

    void bootstrap();
    void loadOrders(ordersFilter);
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

      setProductForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        categoryId: 0,
        subcategoryId: 0,
        isFeatured: false,
      });
      setSelectedCategoryId("");
      setProductImageFile(null);
      setStatus("Product created successfully.");
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to create product."));
    }
  };

  const updateStock = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      await adminApi.updateStock(stockForm.productId, { delta: Number(stockForm.delta), reason: stockForm.reason });
      setStatus("Stock updated successfully.");
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update stock."));
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
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to process product action."));
    }
  };

  const refreshOrdersWithFilter = async (nextFilter: OrdersFilter) => {
    setOrdersFilter(nextFilter);
    setStatus("");
    await loadOrders(nextFilter);
  };

  const toggleDelivered = async (order: AdminOrder) => {
    setOrderActionId(order.id);
    setStatus("");

    try {
      const updated = await adminApi.setOrderDelivered(order.id, !order.delivered);
      setOrders((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to update delivery status."));
    } finally {
      setOrderActionId(null);
    }
  };

  const deleteOrder = async (order: AdminOrder) => {
    if (!order.delivered) {
      setStatus("Mark order as delivered before deleting the record.");
      return;
    }

    setOrderActionId(order.id);
    setStatus("");

    try {
      await adminApi.deleteOrder(order.id);
      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      setStatus("Order deleted successfully.");
    } catch (error) {
      setStatus(getApiErrorMessage(error, "Unable to delete order."));
    } finally {
      setOrderActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-zinc-600">Manage products, inventory, and order records.</p>
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
              min={0.01}
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
              Upload an image file (JPG, PNG, WEBP, GIF) or provide an image URL above.
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
                  {analytics.topProducts.map((item) => (
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
          <button type="submit" className="rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white md:col-span-2">
            Apply Action
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Order Records</h2>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => void refreshOrdersWithFilter("ALL")}
              className={`rounded-lg border px-3 py-1.5 ${
                ordersFilter === "ALL" ? "border-brand-red bg-red-50 text-brand-red" : "border-zinc-300 text-zinc-700"
              }`}
            >
              Pending + Successful
            </button>
            <button
              type="button"
              onClick={() => void refreshOrdersWithFilter("PENDING")}
              className={`rounded-lg border px-3 py-1.5 ${
                ordersFilter === "PENDING"
                  ? "border-brand-red bg-red-50 text-brand-red"
                  : "border-zinc-300 text-zinc-700"
              }`}
            >
              Pending Only
            </button>
            <button
              type="button"
              onClick={() => void refreshOrdersWithFilter("SUCCESS")}
              className={`rounded-lg border px-3 py-1.5 ${
                ordersFilter === "SUCCESS"
                  ? "border-brand-red bg-red-50 text-brand-red"
                  : "border-zinc-300 text-zinc-700"
              }`}
            >
              Successful Only
            </button>
          </div>
        </div>

        {ordersLoading ? (
          <p className="mt-4 text-sm text-zinc-600">Loading order records...</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No matching orders found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[1120px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Transaction Code</th>
                  <th className="px-3 py-2">Order Status</th>
                  <th className="px-3 py-2">Delivered</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-100 align-top">
                    <td className="px-3 py-2 text-xs text-zinc-700">{order.id}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-zinc-900">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-zinc-500">{order.shipping.email}</p>
                    </td>
                    <td className="px-3 py-2">
                      {order.paymentStatus ? (
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${paymentStatusBadge[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-700">{order.transactionCode ?? "N/A"}</td>
                    <td className="px-3 py-2 text-xs text-zinc-700">{orderStatusLabel[order.orderStatus]}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void toggleDelivered(order)}
                        disabled={orderActionId === order.id}
                        className={`rounded-lg border px-3 py-1 text-xs ${
                          order.delivered
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-300 bg-white text-zinc-700"
                        }`}
                      >
                        {orderActionId === order.id ? "Updating..." : order.delivered ? "Delivered" : "Not Delivered"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-zinc-900">${order.total.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void deleteOrder(order)}
                        disabled={!order.delivered || orderActionId === order.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {status && <p className="text-sm text-zinc-700">{status}</p>}
    </div>
  );
}
