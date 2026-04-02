import React from "react";
import { InvoiceType } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { INVOICE_TYPES } from "./constants";

interface InvoiceTypeSelectorProps {
  invoiceType: InvoiceType;
  onChange: (type: InvoiceType) => void;
}

export const InvoiceTypeSelector: React.FC<InvoiceTypeSelectorProps> = ({ invoiceType, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="invoice-type" className="text-sm font-semibold">Invoice Type</Label>
      <Select value={invoiceType} onValueChange={(val) => onChange(val as InvoiceType)}>
        <SelectTrigger id="invoice-type" className="rounded-lg">
          <SelectValue placeholder="Select Invoice Type" />
        </SelectTrigger>
        <SelectContent>
          {INVOICE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
