import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversion extends Document {
  paymentId?: mongoose.Types.ObjectId;
  paymentIds?: mongoose.Types.ObjectId[];
  invoiceId?: mongoose.Types.ObjectId;
  invoiceIds?: mongoose.Types.ObjectId[];
  invoiceNumber: string;
  disposedAsset: string;
  disposedAmount: number;
  acquiredDate: string;
  disposedDate: string;
  receivedINR: number;
  conversionMode?: "BANK_TRANSFER" | "CASH" | "OTHER";
  platform: string;
  orderId?: string;
  buyerSellerReference?: string;
  bankAccount: string;
  bankUTR: string;
  bankCreditDate: string;
  exchangeFeeINR?: number;
  status: "RECONCILED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversionSchema = new Schema<IConversion>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    paymentIds: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    invoiceIds: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
    invoiceNumber: { type: String, required: true },
    disposedAsset: { type: String, required: true, default: "USDT" },
    disposedAmount: { type: Number, required: true },
    acquiredDate: { type: String, required: true },
    disposedDate: { type: String, required: true },
    receivedINR: { type: Number, required: true },
    conversionMode: { type: String, enum: ["BANK_TRANSFER", "CASH", "OTHER"], default: "BANK_TRANSFER" },
    platform: { type: String, required: true, default: "Binance P2P" },
    orderId: { type: String, default: "" },
    buyerSellerReference: { type: String, default: "" },
    bankAccount: { type: String, required: true, default: "Primary Bank Account" },
    bankUTR: { type: String, required: true },
    bankCreditDate: { type: String, required: true },
    exchangeFeeINR: { type: Number, default: 0 },
    status: { type: String, default: "RECONCILED" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Conversion) {
  delete mongoose.models.Conversion;
}

const Conversion: Model<IConversion> =
  mongoose.models.Conversion || mongoose.model<IConversion>("Conversion", ConversionSchema);

export default Conversion;
