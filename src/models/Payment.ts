import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  paymentMethod: "crypto" | "bank_wire" | "other";
  asset: string;
  network?: string;
  amountCrypto: number;
  transactionDate: string;
  txHash?: string;
  blockchainExplorerUrl?: string;
  rateINRAtReceipt: number;
  fiatValueINRAtReceipt: number;
  appliedAmount?: number;
  rateSource?: string;
  payerWallet?: string;
  recipientWallet?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    invoiceNumber: { type: String, required: true },
    paymentMethod: { type: String, enum: ["crypto", "bank_wire", "other"], default: "crypto" },
    asset: { type: String, required: true, default: "USDT" },
    network: { type: String, default: "TRC20" },
    amountCrypto: { type: Number, required: true },
    transactionDate: { type: String, required: true },
    txHash: { type: String, default: "" },
    blockchainExplorerUrl: { type: String, default: "" },
    rateINRAtReceipt: { type: Number, required: true, default: 0 },
    fiatValueINRAtReceipt: { type: Number, required: true, default: 0 },
    appliedAmount: { type: Number },
    rateSource: { type: String, default: "Binance Spot / Market Rate" },
    payerWallet: { type: String, default: "" },
    recipientWallet: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
