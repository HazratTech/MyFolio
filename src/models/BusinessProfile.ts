import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankAccount {
  _id?: string;
  accountName: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface IBusinessProfile extends Document {
  legalName: string;
  tradeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  pan: string;
  gstin?: string;
  email: string;
  phone: string;
  website?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  bankAccounts: IBankAccount[];
  defaultCurrency: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>({
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
});

const BusinessProfileSchema = new Schema<IBusinessProfile>(
  {
    legalName: { type: String, required: true, default: "RelayWorks Tech" },
    tradeName: { type: String, required: true, default: "RelayWorks" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    zipCode: { type: String, default: "" },
    pan: { type: String, default: "" },
    gstin: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branch: { type: String, default: "" },
    },
    bankAccounts: {
      type: [BankAccountSchema],
      default: [
        { accountName: "HDFC Primary", bankName: "HDFC Bank" },
        { accountName: "SBI Account", bankName: "State Bank of India" },
      ],
    },
    defaultCurrency: { type: String, default: "USD" },
    invoicePrefix: { type: String, default: "RW-2026-" },
    nextInvoiceNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

if (mongoose.models.BusinessProfile) {
  delete mongoose.models.BusinessProfile;
}

const BusinessProfile: Model<IBusinessProfile> =
  mongoose.models.BusinessProfile ||
  mongoose.model<IBusinessProfile>("BusinessProfile", BusinessProfileSchema);

export default BusinessProfile;
