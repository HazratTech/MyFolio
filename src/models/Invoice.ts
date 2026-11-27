import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sacHsnCode?: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  clientCountry: string;
  isExport: boolean;
  exportClauseApplied: boolean;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  terms?: string;
  status: "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  reconciliationStatus: "UNPAID" | "UNRECONCILED" | "RECONCILED";
  pdfHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: "Service" },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  sacHsnCode: { type: String, default: "" },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    currency: { type: String, required: true, default: "USD" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    clientName: { type: String, required: true },
    clientCountry: { type: String, required: true },
    isExport: { type: Boolean, default: true },
    exportClauseApplied: { type: Boolean, default: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    terms: { type: String, default: "Payment due upon receipt or as specified." },
    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "CANCELLED"],
      default: "ISSUED",
    },
    reconciliationStatus: {
      type: String,
      enum: ["UNPAID", "UNRECONCILED", "RECONCILED"],
      default: "UNPAID",
    },
    pdfHash: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
