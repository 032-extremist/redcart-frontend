import { api } from "./client";

export interface Receipt {
  id: string;
  receiptNumber: string;
  orderId: string;
  paymentId: string;
  payerPhone?: string | null;
  payerName?: string | null;
  payerNameSource: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  currency: string;
  issuedAt: string;
  itemsSnapshot: unknown;
}

export interface ReceiptDownloadResult {
  emailStatus?: "sent" | "skipped" | "failed";
  emailReason?: string;
  emailMessageId?: string;
}

export const receiptsApi = {
  byOrder: (orderId: string) => api.get<Receipt>(`/receipts/order/${orderId}`).then((res) => res.data),

  downloadPdfByReceiptId: async (receiptId: string, receiptNumber: string): Promise<ReceiptDownloadResult> => {
    const response = await api.get<Blob>(`/receipts/${receiptId}/download`, {
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `${receiptNumber}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);

    const emailStatus = response.headers["x-receipt-email-status"] as ReceiptDownloadResult["emailStatus"] | undefined;
    const emailReason = response.headers["x-receipt-email-reason"] as string | undefined;
    const emailMessageId = response.headers["x-receipt-email-message-id"] as string | undefined;

    return {
      emailStatus,
      emailReason,
      emailMessageId,
    };
  },
};
