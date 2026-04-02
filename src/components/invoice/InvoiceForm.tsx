import React, { useEffect } from "react";
import { InvoiceData, InvoiceItem, SellerDetails, BuyerDetails, InvoiceDetails, Region } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, User, Building, FileText, Landmark, ShoppingBag, Settings2, Globe } from "lucide-react";
import { INDIAN_STATES, GST_RATES, COUNTRIES, INTERNATIONAL_TAX_RATES } from "./constants";
import { RegionSelector } from "./RegionSelector";
import { CurrencySelector } from "./CurrencySelector";
import { InvoiceTypeSelector } from "./InvoiceTypeSelector";
import { TaxSection } from "./TaxSection";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange }) => {
  const updateSeller = (field: string, value: string | boolean) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      onChange({
        ...data,
        seller: {
          ...data.seller,
          [parent]: {
            ...(data.seller as Record<string, any>)[parent],
            [child]: value,
          },
        },
      });
    } else {
      onChange({
        ...data,
        seller: { ...data.seller, [field]: value },
      });
    }
  };

  const updateBuyer = (field: keyof BuyerDetails, value: string) => {
    onChange({
      ...data,
      buyer: { ...data.buyer, [field]: value },
    });
  };

  const updateDetails = (field: keyof InvoiceDetails, value: string | boolean | Date) => {
    onChange({
      ...data,
      details: { ...data.details, [field]: value },
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: "New Item",
      hsn: data.details.region === "IN" ? "" : undefined,
      sku: data.details.region === "INTL" ? "" : undefined,
      quantity: 1,
      unit: "nos",
      rate: 0,
      discount: 0,
      taxRate: data.details.region === "INTL" ? 0 : undefined,
      gstRate: data.details.region === "IN" ? 18 : undefined,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSeller("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSeller("signature", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const region = data.details.region;
  const isIndia = region === "IN";
  const isIntl = region === "INTL";

  return (
    <div className="space-y-6">
      {/* Region Selector - Top Priority */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <RegionSelector region={region} onChange={(newRegion) => updateDetails("region", newRegion)} />
      </div>

      {/* Settings Row for Currency, Invoice Type, Tax */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isIntl && (
          <div>
            <CurrencySelector 
              currency={data.details.currency} 
              onChange={(currency) => updateDetails("currency", currency)}
            />
          </div>
        )}
        <div className={isIntl ? "md:col-span-2" : ""}>
          <InvoiceTypeSelector 
            invoiceType={data.details.invoiceType} 
            onChange={(type) => updateDetails("invoiceType", type)}
          />
        </div>
      </div>

      {/* Tax Section */}
      {isIntl && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <TaxSection
            region={region}
            taxType={data.details.taxType}
            onTaxTypeChange={(type) => updateDetails("taxType", type)}
            vatNumber={data.seller.vatNumber}
            onVatNumberChange={(value) => updateSeller("vatNumber", value)}
            showVatNumber={true}
          />
        </div>
      )}

      <Tabs defaultValue="seller" className="w-full">
        <TabsList className={`grid ${isIndia ? "grid-cols-5" : "grid-cols-5"} w-full bg-slate-100 p-1 h-auto mb-6`}>
          <TabsTrigger value="seller" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white">
            <Building className="h-4 w-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Seller</span>
          </TabsTrigger>
          <TabsTrigger value="buyer" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white">
            <User className="h-4 w-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Buyer</span>
          </TabsTrigger>
          <TabsTrigger value="items" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Items</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white">
            <FileText className="h-4 w-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Details</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex flex-col gap-1 py-2 data-[state=active]:bg-white">
            <Landmark className="h-4 w-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Bank</span>
          </TabsTrigger>
        </TabsList>

        {/* Seller Tab */}
        <TabsContent value="seller" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold mb-2 block">Business Logo</Label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                {data.seller.logo ? (
                  <div className="relative group">
                    <img src={data.seller.logo} alt="Logo" className="h-16 w-16 object-contain bg-white border rounded-lg p-1" />
                    <button 
                      onClick={() => updateSeller("logo", "")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center text-slate-400">
                    <Building className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Max size 2MB • PNG/JPG</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Business Name</Label>
              <Input value={data.seller.name} onChange={(e) => updateSeller("name", e.target.value)} placeholder="EnableFlow Solutions" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Email</Label>
              <Input value={data.seller.email} onChange={(e) => updateSeller("email", e.target.value)} placeholder="billing@company.com" />
            </div>

            {isIndia && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">GSTIN</Label>
                  <Input value={data.seller.gstin || ""} onChange={(e) => updateSeller("gstin", e.target.value)} placeholder="27AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">PAN</Label>
                  <Input value={data.seller.pan || ""} onChange={(e) => updateSeller("pan", e.target.value)} placeholder="AAAAA0000A" />
                </div>
              </>
            )}

            {isIntl && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">VAT / Tax Number</Label>
                  <Input value={data.seller.vatNumber || ""} onChange={(e) => updateSeller("vatNumber", e.target.value)} placeholder="VAT-XXXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Registration Number</Label>
                  <Input value={data.seller.companyRegistration || ""} onChange={(e) => updateSeller("companyRegistration", e.target.value)} placeholder="Company Reg. Number" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Phone</Label>
              <Input value={data.seller.phone} onChange={(e) => updateSeller("phone", e.target.value)} placeholder="+91 9876543210" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">Address</Label>
              <Textarea value={data.seller.address} onChange={(e) => updateSeller("address", e.target.value)} placeholder="123, Tech Tower, BKC, Mumbai" />
            </div>

            {isIndia && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">State</Label>
                  <Select value={data.seller.state || ""} onValueChange={(val) => updateSeller("state", val)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pincode</Label>
                  <Input value={data.seller.pincode || ""} onChange={(e) => updateSeller("pincode", e.target.value)} placeholder="400051" />
                </div>
              </>
            )}

            {isIntl && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Country</Label>
                  <Select value={data.seller.country || ""} onValueChange={(val) => updateSeller("country", val)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Postal Code</Label>
                  <Input value={data.seller.postalCode || ""} onChange={(e) => updateSeller("postalCode", e.target.value)} placeholder="10001" />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Buyer Tab */}
        <TabsContent value="buyer" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Client Name</Label>
              <Input value={data.buyer.name} onChange={(e) => updateBuyer("name", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Company Name</Label>
              <Input value={data.buyer.companyName} onChange={(e) => updateBuyer("companyName", e.target.value)} placeholder="Client Co. Ltd" />
            </div>

            {isIndia && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">GSTIN</Label>
                  <Input value={data.buyer.gstin || ""} onChange={(e) => updateBuyer("gstin", e.target.value)} placeholder="27BBBBB0000B1Z5" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Place of Supply</Label>
                  <Select value={data.buyer.placeOfSupply || ""} onValueChange={(val) => updateBuyer("placeOfSupply", val)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {isIntl && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">VAT / Tax Number</Label>
                  <Input value={data.buyer.vatNumber || ""} onChange={(e) => updateBuyer("vatNumber", e.target.value)} placeholder="VAT-XXXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Registration Number</Label>
                  <Input value={data.buyer.companyRegistration || ""} onChange={(e) => updateBuyer("companyRegistration", e.target.value)} placeholder="Company Reg. Number" />
                </div>
              </>
            )}

            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">Address</Label>
              <Textarea value={data.buyer.address} onChange={(e) => updateBuyer("address", e.target.value)} placeholder="456, Client Street" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">City</Label>
              <Input value={data.buyer.city} onChange={(e) => updateBuyer("city", e.target.value)} placeholder="City Name" />
            </div>

            {isIndia && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">State</Label>
                  <Select value={data.buyer.state || ""} onValueChange={(val) => updateBuyer("state", val)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pincode</Label>
                  <Input value={data.buyer.pincode || ""} onChange={(e) => updateBuyer("pincode", e.target.value)} placeholder="411001" />
                </div>
              </>
            )}

            {isIntl && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Country</Label>
                  <Select value={data.buyer.country || ""} onValueChange={(val) => updateBuyer("country", val)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Postal Code</Label>
                  <Input value={data.buyer.postalCode || ""} onChange={(e) => updateBuyer("postalCode", e.target.value)} placeholder="10001" />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="space-y-3">
            {data.items.map((item, index) => (
              <div key={item.id} className="relative group bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all">
                {/* Item Number Badge and Delete Button */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <span className="inline-flex items-center justify-center h-7 w-7 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                  <button 
                    onClick={() => removeItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Description - Full Width */}
                <div className="mb-4 space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Description</Label>
                  <Input 
                    value={item.description} 
                    onChange={(e) => updateItem(index, "description", e.target.value)} 
                    placeholder="e.g., Web Development Services"
                    className="bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary/20" 
                  />
                </div>

                {/* First Row: HSN/SAC, Tax %, Qty */}
                <div className="grid grid-cols-12 gap-3 mb-3">
                  {/* HSN/SAC for India, SKU for International */}
                  <div className="col-span-6 md:col-span-4 space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {isIndia ? "HSN/SAC" : "SKU"}
                    </Label>
                    <Input 
                      value={isIndia ? (item.hsn || "") : (item.sku || "")} 
                      onChange={(e) => updateItem(index, isIndia ? "hsn" : "sku", e.target.value)} 
                      placeholder={isIndia ? "998314" : "SKU-001"}
                      className="bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm" 
                    />
                  </div>

                  {/* Tax Rate */}
                  <div className="col-span-6 md:col-span-4 space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {isIndia ? "GST %" : "Tax %"}
                    </Label>
                    <Select 
                      value={(isIndia ? (item.gstRate ?? 0) : (item.taxRate ?? 0)).toString()} 
                      onValueChange={(val) => {
                        if (isIndia) {
                          updateItem(index, "gstRate", parseFloat(val));
                        } else {
                          updateItem(index, "taxRate", parseFloat(val));
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-300 focus:ring-2 focus:ring-primary/20 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(isIndia ? GST_RATES : INTERNATIONAL_TAX_RATES).map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 md:col-span-4 space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Qty</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        updateItem(index, "quantity", e.target.value === "" || isNaN(parsed) ? 0 : parsed);
                      }}
                      placeholder="1"
                      min="0"
                      className="bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm" 
                    />
                  </div>
                </div>

                {/* Second Row: Rate, Total */}
                <div className="grid grid-cols-12 gap-3">
                  {/* Rate - Takes more space for large numbers */}
                  <div className="col-span-6 md:col-span-8 space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Rate</Label>
                    <Input 
                      type="number" 
                      value={item.rate} 
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        updateItem(index, "rate", e.target.value === "" || isNaN(parsed) ? 0 : parsed);
                      }}
                      placeholder="0"
                      min="0"
                      className="bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm font-semibold w-full" 
                    />
                  </div>

                  {/* Total - Takes more space for large numbers */}
                  <div className="col-span-6 md:col-span-4 space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total</Label>
                    <div className="h-10 px-3 flex items-center bg-primary/5 border border-primary/20 rounded-lg text-sm font-bold text-primary w-full">
                      <span className="truncate">{(item.quantity * item.rate).toLocaleString(data.details.region === 'IN' ? 'en-IN' : 'en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Item Button */}
            <Button 
              onClick={addItem} 
              variant="outline" 
              className="w-full border-dashed border-2 border-primary/40 py-6 rounded-xl text-primary hover:text-primary hover:bg-primary/5 hover:border-primary/60 transition-all font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" /> Add New Item
            </Button>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Invoice Number</Label>
              <Input value={data.details.invoiceNumber} onChange={(e) => updateDetails("invoiceNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Invoice Date</Label>
              <Input 
                type="date" 
                value={data.details.invoiceDate instanceof Date ? data.details.invoiceDate.toISOString().split('T')[0] : data.details.invoiceDate} 
                onChange={(e) => updateDetails("invoiceDate", new Date(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Due Date</Label>
              <Input 
                type="date" 
                value={data.details.dueDate instanceof Date ? data.details.dueDate.toISOString().split('T')[0] : data.details.dueDate} 
                onChange={(e) => updateDetails("dueDate", new Date(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">PO Number</Label>
              <Input value={data.details.poNumber || ""} onChange={(e) => updateDetails("poNumber", e.target.value)} placeholder="PO-2024-001" />
            </div>
            
            {isIndia && (
              <div className="md:col-span-2 space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Reverse Charge</Label>
                    <p className="text-xs text-muted-foreground">Tax is payable on reverse charge basis</p>
                  </div>
                  <Switch 
                    checked={data.details.reverseCharge} 
                    onCheckedChange={(val) => updateDetails("reverseCharge", val)} 
                  />
                </div>
              </div>
            )}

            <div className={`${isIndia ? "md:col-span-2" : "md:col-span-2"} space-y-4 pt-4 border-t`}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Auto Round Off</Label>
                  <p className="text-xs text-muted-foreground">Round the grand total</p>
                </div>
                <Switch 
                  checked={data.details.roundOff} 
                  onCheckedChange={(val) => updateDetails("roundOff", val)} 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 pt-4 border-t">
              <Label className="text-sm font-semibold">Terms & Conditions</Label>
              <Textarea 
                value={data.details.termsAndConditions} 
                onChange={(e) => updateDetails("termsAndConditions", e.target.value)} 
                className="min-h-[100px] rounded-xl"
                placeholder="Enter terms and conditions..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">Notes</Label>
              <Textarea 
                value={data.details.notes} 
                onChange={(e) => updateDetails("notes", e.target.value)} 
                className="rounded-xl"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Bank Tab */}
        <TabsContent value="bank" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Bank Name</Label>
              <Input value={data.seller.bankDetails.bankName} onChange={(e) => updateSeller("bankDetails.bankName", e.target.value)} placeholder="HDFC Bank" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Account Holder Name</Label>
              <Input value={data.seller.bankDetails.accountName} onChange={(e) => updateSeller("bankDetails.accountName", e.target.value)} placeholder="Your Company Name" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Account Number</Label>
              <Input value={data.seller.bankDetails.accountNumber} onChange={(e) => updateSeller("bankDetails.accountNumber", e.target.value)} placeholder="1234567890" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">IFSC Code</Label>
              <Input value={data.seller.bankDetails.ifscCode} onChange={(e) => updateSeller("bankDetails.ifscCode", e.target.value)} placeholder="HDFC0001234" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Branch</Label>
              <Input value={data.seller.bankDetails.branch} onChange={(e) => updateSeller("bankDetails.branch", e.target.value)} placeholder="Mumbai Main Branch" />
            </div>
            {isIndia && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">UPI ID</Label>
                <Input value={data.seller.bankDetails.upiId || ""} onChange={(e) => updateSeller("bankDetails.upiId", e.target.value)} placeholder="company@upi" />
              </div>
            )}
            
            <div className="md:col-span-2 pt-6 border-t">
              <Label className="text-sm font-semibold mb-2 block">Authorized Signature</Label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                {data.seller.signature ? (
                  <div className="relative group">
                    <img src={data.seller.signature} alt="Signature" className="h-12 w-auto object-contain bg-white border rounded p-1" />
                    <button 
                      onClick={() => updateSeller("signature", "")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-24 rounded-lg bg-white border flex items-center justify-center text-slate-400">
                    <Settings2 className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleSignatureUpload} className="cursor-pointer" />
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Transparent PNG recommended</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
