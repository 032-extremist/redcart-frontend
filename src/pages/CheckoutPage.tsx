import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { paymentsApi } from "../api/payments";
import { useCart } from "../context/CartContext";
import { EmptyState } from "../components/ui/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

const initialForm = {
  shippingName: "",
  shippingPhone: "",
  shippingEmail: "",
  shippingStreet: "",
  shippingCity: "",
  shippingCountry: "Kenya",
  mpesaPayerName: "",
  paymentMethod: "MPESA" as "MPESA" | "CARD",
};

export function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    orderId: string;
    status: string;
    paymentStatus: string;
    transactionRef?: string;
  } | null>(null);
  const [pendingMpesa, setPendingMpesa] = useState<{
    orderId: string;
    paymentId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="No items for checkout"
        description="Add products to your cart before initiating payment."
      />
    );
  }

  const handleCheckout = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");
    setPendingMpesa(null);

    try {
      const checkoutPayload =
        form.paymentMethod === "MPESA"
          ? {
              ...form,
              mpesaPayerName: form.mpesaPayerName.trim(),
            }
          : {
              ...form,
              mpesaPayerName: undefined,
            };

      const checkout = await ordersApi.checkout(checkoutPayload);

      if (form.paymentMethod === "MPESA") {
        try {
          const mpesa = await paymentsApi.initiateMpesaStkPush({
            paymentId: checkout.payment.id,
            phoneNumber: form.shippingPhone,
          });

          setPendingMpesa({
            orderId: checkout.orderId,
            paymentId: checkout.payment.id,
          });
          setResult({
            orderId: checkout.orderId,
            status: mpesa.order?.status ?? checkout.status,
            paymentStatus: mpesa.payment?.status ?? checkout.payment.status,
          });
          setInfo("STK push sent. Complete the prompt on your phone, then check payment status.");
        } catch (paymentError) {
          setPendingMpesa({
            orderId: checkout.orderId,
            paymentId: checkout.payment.id,
          });
          setResult({
            orderId: checkout.orderId,
            status: checkout.status,
            paymentStatus: checkout.payment.status,
          });
          setError(
            `Order created, but M-Pesa confirmation failed: ${getApiErrorMessage(
              paymentError,
              "retry the payment below.",
            )}`,
          );
        }
      } else {
        setResult({
          orderId: checkout.orderId,
          status: checkout.status,
          paymentStatus: checkout.payment.status,
          transactionRef: checkout.payment.transactionRef,
        });
      }

      await refreshCart();
    } catch (checkoutError) {
      setError(getApiErrorMessage(checkoutError, "Checkout failed. Verify details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryMpesa = async () => {
    if (!pendingMpesa) {
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      const mpesa = await paymentsApi.initiateMpesaStkPush({
        paymentId: pendingMpesa.paymentId,
        phoneNumber: form.shippingPhone,
      });

      setResult({
        orderId: pendingMpesa.orderId,
        status: mpesa.order?.status ?? "PENDING_PAYMENT",
        paymentStatus: mpesa.payment?.status ?? "PENDING",
      });
      setInfo("STK push re-sent. Complete payment on your phone.");
    } catch (paymentError) {
      setError(getApiErrorMessage(paymentError, "M-Pesa retry failed. Confirm phone number and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckMpesaStatus = async () => {
    if (!pendingMpesa) {
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      const status = await paymentsApi.getMpesaStatus(pendingMpesa.paymentId);
      setResult({
        orderId: pendingMpesa.orderId,
        status: status.order?.status ?? "PENDING_PAYMENT",
        paymentStatus: status.status,
        transactionRef: status.transactionRef ?? undefined,
      });

      if (status.status === "SUCCESS") {
        setPendingMpesa(null);
        setInfo("Payment confirmed successfully.");
      } else if (status.status === "FAILED") {
        setInfo("Payment failed. Retry STK push to attempt payment again.");
      } else {
        setInfo("Payment is still pending. Complete STK prompt, then check again.");
      }
    } catch (statusError) {
      setError(getApiErrorMessage(statusError, "Unable to fetch payment status."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <form onSubmit={handleCheckout} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>
        <p className="mt-1 text-sm text-zinc-600">Payment is required only at checkout.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["shippingName", "Full Name"],
            ["shippingPhone", "Phone Number"],
            ["shippingEmail", "Email"],
            ["shippingStreet", "Street Address"],
            ["shippingCity", "City"],
            ["shippingCountry", "Country"],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm text-zinc-700">
              {label}
              <input
                value={form[key as keyof typeof form] as string}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-zinc-700">Payment Method</legend>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
              <input
                type="radio"
                checked={form.paymentMethod === "MPESA"}
                onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "MPESA" }))}
              />
              M-Pesa (Real STK Push)
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
              <input
                type="radio"
                checked={form.paymentMethod === "CARD"}
                onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "CARD" }))}
              />
              Card Payment
            </label>
          </div>
        </fieldset>

        {form.paymentMethod === "MPESA" && (
          <label className="mt-4 block text-sm text-zinc-700">
            M-Pesa Registered Name
            <input
              value={form.mpesaPayerName}
              onChange={(event) => setForm((prev) => ({ ...prev, mpesaPayerName: event.target.value }))}
              required
              placeholder="Name registered on the paying phone number"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {info && <p className="mt-4 text-sm text-emerald-700">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Processing..." : "Pay and Place Order"}
        </button>
      </form>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </p>
        </section>

        {result && (
          <section
            className={`rounded-2xl p-5 text-sm ${
              pendingMpesa
                ? "border border-amber-200 bg-amber-50 text-amber-900"
                : "border border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <h3 className="font-semibold">{pendingMpesa ? "Order Created - Payment Pending" : "Order Confirmed"}</h3>
            <p className="mt-1">Order ID: {result.orderId}</p>
            <p>Status: {result.status}</p>
            <p>Payment: {result.paymentStatus}</p>
            {result.transactionRef && <p>Transaction Ref: {result.transactionRef}</p>}
            {pendingMpesa && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRetryMpesa}
                  disabled={submitting}
                  className="rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white"
                >
                  Retry M-Pesa STK Push
                </button>
                <button
                  type="button"
                  onClick={handleCheckMpesaStatus}
                  disabled={submitting}
                  className="rounded-lg border border-zinc-400 px-4 py-2 text-xs font-semibold text-zinc-800"
                >
                  Check Payment Status
                </button>
              </div>
            )}
            <Link to="/orders" className="mt-3 inline-block font-semibold underline">
              View Order History
            </Link>
          </section>
        )}
      </aside>
    </div>
  );
}
