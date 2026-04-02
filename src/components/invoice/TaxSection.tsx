import React from "react";
import { Region, TaxType } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TAX_TYPES } from "./constants";
import { Input } from "@/components/ui/input";

interface TaxSectionProps {
  region: Region;
  taxType?: TaxType;
  onTaxTypeChange?: (type: TaxType) => void;
  vatNumber?: string;
  onVatNumberChange?: (value: string) => void;
  showVatNumber?: boolean;
}

const isTaxType = (val: string): val is TaxType => {
  return TAX_TYPES.includes(val as TaxType);
};

export const TaxSection: React.FC<TaxSectionProps> = ({
  region,
  taxType = "GST",
  onTaxTypeChange,
  vatNumber = "",
  onVatNumberChange,
  showVatNumber = true,
}) => {
  return (
    <div className="space-y-4">
      {region === "INTL" && (
        <>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tax Type</Label>
            <Select value={taxType} onValueChange={(val) => {
              if (isTaxType(val)) {
                onTaxTypeChange?.(val);
              }
            }}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select Tax Type" />
              </SelectTrigger>
              <SelectContent>
                {TAX_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showVatNumber && taxType !== "No Tax" && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{taxType} Number</Label>
              <Input
                value={vatNumber}
                onChange={(e) => onVatNumberChange?.(e.target.value)}
                placeholder={`Enter ${taxType} number`}
              />
            </div>
          )}
        </>
      )}

      {region === "IN" && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-900 font-medium">
            GST Tax Settings
          </p>
          <p className="text-xs text-blue-800 mt-1">
            GSTrate and tax calculation (CGST/SGST/IGST) are configured per item based on HSN/SAC codes and place of supply.
          </p>
        </div>
      )}
    </div>
  );
};
