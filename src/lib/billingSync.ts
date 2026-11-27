import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Conversion from "@/models/Conversion";

const USD_STABLE_ASSETS = new Set(["USDT", "USDC", "USD", "BUSD", "DAI", "FDUSD"]);
const FALLBACK_USD_INR = 87.5;

export function getEffectiveAppliedAmount(
  payment: {
    appliedAmount?: number | null;
    amountCrypto?: number;
    fiatValueINRAtReceipt?: number;
    asset?: string;
    paymentMethod?: string;
  },
  invoiceCurrency = "USD"
): number {
  if (
    payment.appliedAmount !== undefined &&
    payment.appliedAmount !== null &&
    !Number.isNaN(Number(payment.appliedAmount))
  ) {
    return Number(payment.appliedAmount);
  }

  const curr = (invoiceCurrency || "USD").toUpperCase();
  const asset = (payment.asset || "USDT").toUpperCase();
  const amtCrypto = Number(payment.amountCrypto || 0);
  const inrVal = Number(payment.fiatValueINRAtReceipt || 0);

  if (curr === "INR") {
    return inrVal > 0 ? inrVal : amtCrypto * FALLBACK_USD_INR;
  }

  if (curr === "USD" && (USD_STABLE_ASSETS.has(asset) || payment.paymentMethod !== "crypto")) {
    return amtCrypto;
  }

  if (inrVal > 0) {
    return Number((inrVal / FALLBACK_USD_INR).toFixed(2));
  }

  return amtCrypto;
}

export async function recalculateInvoicePaymentState(invoiceId: any) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return null;

  const payments = await Payment.find({ invoiceId: invoice._id });
  const totalApplied = payments.reduce(
    (sum, p) => sum + getEffectiveAppliedAmount(p, invoice.currency),
    0
  );
  const paidAmount = Number(totalApplied.toFixed(2));
  invoice.paidAmount = paidAmount;

  if (invoice.status !== "CANCELLED") {
    if (payments.length === 0 || paidAmount <= 0.001) {
      invoice.status = "ISSUED";
    } else if (paidAmount >= invoice.totalAmount - 0.01) {
      invoice.status = "PAID";
    } else {
      invoice.status = "PARTIALLY_PAID";
    }
  }

  if (payments.length === 0) {
    invoice.reconciliationStatus = "UNPAID";
  } else {
    const paymentIds = payments.map((p) => p._id);
    const conversions = await Conversion.find({
      $or: [
        { paymentId: { $in: paymentIds } },
        { paymentIds: { $in: paymentIds } },
      ],
    });

    const convertedIds = new Set<string>();
    conversions.forEach((c) => {
      if (c.paymentId) convertedIds.add(c.paymentId.toString());
      if (c.paymentIds) {
        c.paymentIds.forEach((pid: any) => convertedIds.add(pid.toString()));
      }
    });

    const allReconciled = payments.every((p) =>
      convertedIds.has(p._id.toString())
    );
    invoice.reconciliationStatus = allReconciled
      ? "RECONCILED"
      : "UNRECONCILED";
  }

  await invoice.save();
  return invoice;
}
