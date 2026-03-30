export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number; // in percentage
  gstRate: number; // in percentage
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
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
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
  state: string;
  pincode: string;
  gstin: string;
  placeOfSupply: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  poNumber?: string;
  poDate?: Date;
  termsAndConditions: string;
  notes: string;
  reverseCharge?: boolean;
  roundOff?: boolean;
}

export interface TaxBreakdown {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface InvoiceData {
  seller: SellerDetails;
  buyer: BuyerDetails;
  details: InvoiceDetails;
  items: InvoiceItem[];
}
