export type BillingTab =
  | "dashboard"
  | "invoices"
  | "new-invoice"
  | "crypto-payments"
  | "reconciliation"
  | "expenses"
  | "clients"
  | "audit-log"
  | "reports"
  | "settings";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sacHsnCode?: string;
}

export interface InvoiceRecord {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  clientId: string;
  clientName: string;
  clientCountry: string;
  isExport: boolean;
  exportClauseApplied?: boolean;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number;
  notes?: string;
  terms?: string;
  status: "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  reconciliationStatus: "UNPAID" | "UNRECONCILED" | "RECONCILED";
  pdfHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientRecord {
  _id: string;
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
  createdAt?: string;
}

export interface PaymentRecord {
  _id: string;
  invoiceId: string;
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
  createdAt?: string;
}

export interface ConversionRecord {
  _id: string;
  paymentId?: string;
  paymentIds?: string[];
  invoiceId?: string;
  invoiceIds?: string[];
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
  createdAt?: string;
}

export interface ExpenseRecord {
  _id: string;
  expenseDate: string;
  vendor: string;
  category: string;
  description?: string;
  amount: number;
  currency: string;
  amountINR: number;
  paymentMethod?: string;
  receiptReference?: string;
  createdAt?: string;
}

export interface BankAccount {
  _id?: string;
  accountName: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface BusinessProfileRecord {
  _id?: string;
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
  bankAccounts: BankAccount[];
  defaultCurrency: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export interface AuditLogRecord {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  details?: Record<string, any>;
  timestamp?: string;
  createdAt?: string;
}

export interface BillingReportsData {
  summary: {
    totalInvoicedUSD: number;
    totalInvoicedINR: number;
    totalCryptoPaymentsCount: number;
    totalBankCreditedINR: number;
    totalExpensesINR: number;
    netProfitINR: number;
    totalUnreconciledPayments: number;
    totalReconciledPayments: number;
    totalInvoicesCount: number;
  };
  cryptoLedger: Record<
    string,
    { received: number; disposed: number; balance: number }
  >;
}
