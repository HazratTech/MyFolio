import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  expenseDate: string;
  vendor: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  amountINR: number;
  paymentMethod?: string;
  receiptReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseDate: { type: String, required: true },
    vendor: { type: String, required: true },
    category: {
      type: String,
      required: true,
      default: "Software/SaaS",
    },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    amountINR: { type: Number, required: true },
    paymentMethod: { type: String, default: "Credit Card / Crypto" },
    receiptReference: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
