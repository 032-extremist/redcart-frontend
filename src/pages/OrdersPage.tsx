import { useEffect, useState } from "react";
import { ordersApi } from "../api/orders";
import { paymentsApi } from "../api/payments";
import { receiptsApi } from "../api/receipts";
import { EmptyState } from "../components/ui/EmptyState";
import { Order } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const initialOrders = await ordersApi.list();
        setOrders(initialOrders);

        const pendingMpesaOrders = initialOrders.filter(
          (order) => order.payment?.provider === "MPESA" && order.payment?.status === "PENDING",
        );

        if (pendingMpesaOrders.length === 0) {
          return;
        }

        const statusResults = await Promise.all(
          pendingMpesaOrders.map(async (order) => {
            if (!order.payment) {
              return null;
            }

            try {
              const status = await paymentsApi.getMpesaStatus(order.payment.id);
              return {
                orderId: order.id,
                orderStatus: status.order?.status as Order["status"] | undefined,
                paymentStatus: status.status as NonNullable<Order["payment"]>["status"],
                transactionRef:
                  typeof status.transactionRef === "string" ? status.transactionRef : order.payment.transactionRef,
              };
            } catch {
              return null;
            }
          }),
        );

        const updatesByOrderId = new Map(
          statusResults
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .map((item) => [item.orderId, item]),
        );

        if (updatesByOrderId.size > 0) {
          setOrders((prev) =>
            prev.map((order) => {
              const next = updatesByOrderId.get(order.id);
              if (!next || !order.payment) {
                return order;
              }

              return {
                ...order,
                status: next.orderStatus ?? order.status,
                payment: {
                  ...order.payment,
                  status: next.paymentStatus,
                  transactionRef: next.transactionRef ?? order.payment.transactionRef ?? null,
                },
              };
            }),
          );
        }
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load orders."));
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Complete checkout to create your first order." />;
  }

  const handleDownloadReceipt = async (orderId: string) => {
    setDownloadingOrderId(orderId);
    setError("");

    try {
      const receipt = await receiptsApi.byOrder(orderId);
      const downloadResult = await receiptsApi.downloadPdfByReceiptId(receipt.id, receipt.receiptNumber);

      if (downloadResult.emailStatus && downloadResult.emailStatus !== "sent") {
        const reasonSuffix = downloadResult.emailReason ? ` (${downloadResult.emailReason})` : "";
        setError(`Receipt downloaded, but email copy was not sent${reasonSuffix}.`);
      }
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, "Unable to download receipt for this order."));
    } finally {
      setDownloadingOrderId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">Order History</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-zinc-900">Order #{order.id}</p>
            <div className="text-sm text-zinc-600">
              <span className="mr-3">Status: {order.status}</span>
              <span>Payment: {order.payment?.status ?? "N/A"}</span>
            </div>
          </div>

          <p className="mt-1 text-xs text-zinc-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>

          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-right text-sm font-semibold text-zinc-900">Total: ${order.total.toFixed(2)}</p>
          {order.payment?.status === "SUCCESS" && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => handleDownloadReceipt(order.id)}
                disabled={downloadingOrderId === order.id}
                className="rounded-lg border border-zinc-400 px-3 py-2 text-xs font-semibold text-zinc-800"
              >
                {downloadingOrderId === order.id ? "Preparing Receipt..." : "Download Receipt"}
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
