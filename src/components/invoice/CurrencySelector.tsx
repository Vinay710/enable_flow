import React from "react";
import { Currency } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "./constants";

interface CurrencySelectorProps {
  currency: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currency, onChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Currency</Label>
      <Select value={currency} onValueChange={(val) => onChange(val as Currency)} disabled={disabled}>
        <SelectTrigger className="rounded-lg" disabled={disabled}>
          <SelectValue placeholder="Select Currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code} - {curr.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
