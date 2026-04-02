export type Region = "IN" | "INTL";
export type InvoiceType = "Tax Invoice" | "Proforma Invoice" | "Quotation" | "Credit Note" | "Debit Note";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED" | "AUD" | "CAD";
export type TaxType = "VAT" | "Sales Tax" | "GST" | "No Tax" | "Custom";

export interface InvoiceItem {
  id: string;
  description: string;
  hsn?: string; // Optional for international
  sku?: string; // For international invoices
  quantity: number;
  unit: string;
  rate: number;
  discount: number; // in percentage
  taxRate?: number; // in percentage
  gstRate?: number; // Kept for backward compatibility with India
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;
}

export interface SellerDetails {
  name: string;
  address: string;
  city: string;
  state?: string; // Optional for international
  pincode?: string; // Optional for international
  postalCode?: string; // For international
  country?: string; // For international
  gstin?: string; // Optional for international
  pan?: string; // Optional for international
  vatNumber?: string; // For international
  companyRegistration?: string; // For international
  email: string;
  phone: string;
  logo?: string;
  signature?: string;
  bankDetails: BankDetails;
}

export interface BuyerDetails {
  name: string;
  companyName: string;
  address: string;
  city: string;
  state?: string; // Optional for international
  pincode?: string; // Optional for international
  postalCode?: string; // For international
  country?: string; // For international
  gstin?: string; // Optional for international
  placeOfSupply?: string; // Optional for international
  vatNumber?: string; // For international
  companyRegistration?: string; // For international
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  invoiceDate: Date;
  dueDate: Date;
  poNumber?: string;
  poDate?: Date;
  termsAndConditions: string;
  notes: string;
  reverseCharge?: boolean;
  roundOff?: boolean;
  region: Region;
  currency: Currency;
  taxType?: TaxType;
}

export interface TaxBreakdown {
  taxableAmount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tax?: number; // For international
  totalTax: number;
}

export interface InvoiceData {
  seller: SellerDetails;
  buyer: BuyerDetails;
  details: InvoiceDetails;
  items: InvoiceItem[];
}
