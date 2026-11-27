import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  legalName: string;
  clientType: "Company" | "Individual";
  email: string;
  country: string;
  address: string;
  stateProvince?: string;
  zipCode?: string;
  taxId?: string;
  discordHandle?: string;
  notes?: string;
  agreementReference?: string;
  isForeign: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    legalName: { type: String, required: true },
    clientType: { type: String, enum: ["Company", "Individual"], default: "Company" },
    email: { type: String, default: "" },
    country: { type: String, required: true },
    address: { type: String, default: "" },
    stateProvince: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    taxId: { type: String, default: "" },
    discordHandle: { type: String, default: "" },
    notes: { type: String, default: "" },
    agreementReference: { type: String, default: "" },
    isForeign: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.Client) {
  delete mongoose.models.Client;
}

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
