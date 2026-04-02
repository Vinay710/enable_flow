import React from "react";
import { Region } from "./types";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";

interface RegionSelectorProps {
  region: Region;
  onChange: (region: Region) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ region, onChange }) => {
  return (
    <div className="space-y-3">
      <label id="invoice-region-label" className="text-sm font-semibold">Invoice Region</label>
      <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="invoice-region-label">
        <Button
          type="button"
          variant={region === "IN" ? "default" : "outline"}
          onClick={() => onChange("IN")}
          aria-pressed={region === "IN"}
          className="h-20 flex flex-col gap-2 justify-center items-center"
        >
          <MapPin className="h-5 w-5" />
          <div className="text-center">
            <div className="font-semibold text-sm">India</div>
            <div className="text-xs opacity-70">GST Compliant</div>
          </div>
        </Button>
        <Button
          type="button"
          variant={region === "INTL" ? "default" : "outline"}
          onClick={() => onChange("INTL")}
          aria-pressed={region === "INTL"}
          className="h-20 flex flex-col gap-2 justify-center items-center"
        >
          <Globe className="h-5 w-5" />
          <div className="text-center">
            <div className="font-semibold text-sm">International</div>
            <div className="text-xs opacity-70">Multi-Currency</div>
          </div>
        </Button>
      </div>
    </div>
  );
};
