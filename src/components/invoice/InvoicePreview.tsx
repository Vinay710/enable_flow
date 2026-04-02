import React, { useMemo, useEffect, useState } from "react";
import { InvoiceData } from "./types";
import { formatCurrency, numberToWords } from "./utils";
import QRCode from "qrcode";
import { CURRENCIES } from "./constants";

/**
 * Props for the InvoicePreview component.
 */
interface InvoicePreviewProps {
  /** The invoice data to be displayed */
  data: InvoiceData;
}

/**
 * InvoicePreview component provides a high-fidelity, professional-looking invoice preview.
 * It handles tax calculations (GST for India, VAT/Tax for International) and generates 
 * a UPI QR code for Indian invoices if bank details are provided.
 * 
 * @component
 * @param {InvoicePreviewProps} props - Component props
 * @param {React.Ref<HTMLDivElement>} ref - Reference to the preview container for PDF generation
 */
export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    
    // Determine the region and locale for formatting
    const isIndia = data.details.region === "IN";
    const isIntl = data.details.region === "INTL";
    const locale = isIndia ? 'en-IN' : 'en-US';

    /**
     * Get the currency symbol based on the selected currency code.
     */
    const currencySymbol = useMemo(() => {
      const curr = CURRENCIES.find(c => c.code === data.details.currency);
      return curr?.symbol || "$";
    }, [data.details.currency]);

    /**
     * Determine if the invoice is inter-state (for Indian GST calculation).
     * If seller state and place of supply state are different, it's IGST.
     */
    const isInterState = useMemo(() => {
      if (!isIndia) return false;
      const sellerState = (data.seller.state || "").toLowerCase().trim();
      const placeOfSupply = (data.buyer.placeOfSupply || "").toLowerCase().trim();
      return sellerState !== placeOfSupply && sellerState && placeOfSupply;
    }, [data.seller.state, data.buyer.placeOfSupply, isIndia]);

    /**
     * Perform all invoice calculations:
     * - Subtotal (sum of taxable values)
     * - Tax (GST split for India, single tax for International)
     * - Grand Total (with optional rounding)
     * - HSN/Tax summaries
     */
    const calculations = useMemo(() => {
      let subtotal = 0;
      let totalTax = 0;
      
      let hsnSummary: Record<string, { taxableValue: number; cgst: number; sgst: number; igst: number; rate: number; totalTax?: number; }> = {};

      const itemsWithTax = data.items.map((item) => {
        const itemTotal = item.quantity * item.rate;
        const discountAmount = (itemTotal * (item.discount || 0)) / 100;
        const taxableValue = itemTotal - discountAmount;
        
        const taxRate = isIndia ? (item.gstRate || 0) : (item.taxRate || 0);
        const taxAmount = (taxableValue * taxRate) / 100;

        subtotal += taxableValue;
        totalTax += taxAmount;

        if (isIndia) {
          let cgst = 0, sgst = 0, igst = 0;
          if (isInterState) {
            igst = taxAmount;
          } else {
            cgst = taxAmount / 2;
            sgst = taxAmount / 2;
          }

          const hsn = item.hsn || "N/A";
          if (!hsnSummary[hsn]) {
            hsnSummary[hsn] = { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, rate: taxRate };
          }
          hsnSummary[hsn].taxableValue += taxableValue;
          hsnSummary[hsn].cgst += cgst;
          hsnSummary[hsn].sgst += sgst;
          hsnSummary[hsn].igst += igst;

          return { ...item, taxableValue, taxAmount, cgst, sgst, igst, total: taxableValue + taxAmount };
        } else {
          // International
          return { ...item, taxableValue, taxAmount, tax: taxAmount, total: taxableValue + taxAmount };
        }
      });

      const rawGrandTotal = subtotal + totalTax;
      const grandTotal = data.details.roundOff ? Math.round(rawGrandTotal) : rawGrandTotal;
      const roundOffAmount = grandTotal - rawGrandTotal;

      return {
        subtotal,
        totalTax,
        grandTotal,
        itemsWithTax,
        hsnSummary,
        roundOffAmount
      };
    }, [data.items, isInterState, data.details.roundOff, isIndia]);

    /**
     * Generate a UPI QR code if the invoice is for India and UPI ID is provided.
     */
    useEffect(() => {
      if (isIndia && data.seller.bankDetails.upiId) {
        const upiString = `upi://pay?pa=${data.seller.bankDetails.upiId}&pn=${encodeURIComponent(
          data.seller.name
        )}&am=${calculations.grandTotal}&cu=INR`;
        
        QRCode.toDataURL(upiString, { width: 128, margin: 1 }, (err, url) => {
          if (!err) setQrCodeUrl(url);
        });
      } else {
        setQrCodeUrl("");
      }
    }, [data.seller.bankDetails.upiId, data.seller.name, calculations.grandTotal, isIndia]);

    // Format address strings
    const sellerLocation = isIndia
      ? `${data.seller.city}, ${data.seller.state} - ${data.seller.pincode}`
      : `${data.seller.city}, ${data.seller.country} ${data.seller.postalCode || ""}`;

    const buyerLocation = isIndia
      ? `${data.buyer.city}, ${data.buyer.pincode}`
      : `${data.buyer.city}, ${data.buyer.country} ${data.buyer.postalCode || ""}`;

    return (
      <div 
        ref={ref} 
        className="bg-white w-full md:w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col relative p-6 md:p-[15mm] shadow-lg print:shadow-none" 
        id="invoice-preview"
        style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontSize: '12px' }}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Header Section */}
        <div className="flex justify-between items-start mb-10">
          <div className="max-w-[60%]">
            {data.seller.logo ? (
              <img src={data.seller.logo} alt="Logo" className="h-14 w-auto object-contain object-left mb-4" />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg mb-4">
                {data.seller.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight uppercase tracking-tight mb-1">
              {data.seller.name}
            </h1>
            <p className="text-[11px] text-slate-500 max-w-[320px] leading-relaxed">
              {data.seller.address}<br />
              {sellerLocation}<br />
              {data.seller.email} • {data.seller.phone}
            </p>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-black text-primary/20 uppercase tracking-tighter mb-4">
              {data.details.invoiceType}
            </h2>
            <div className="inline-grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Invoice #</span>
              <span className="font-bold text-slate-900">{data.details.invoiceNumber}</span>
              
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date</span>
              <span className="font-bold text-slate-900">
                {new Date(data.details.invoiceDate).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              
              {isIndia && (
                <>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">GSTIN</span>
                  <span className="font-bold text-slate-900">{data.seller.gstin || "N/A"}</span>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">PAN</span>
                  <span className="font-bold text-slate-900">{data.seller.pan || "N/A"}</span>
                </>
              )}
              
              {isIntl && (
                <>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">VAT No</span>
                  <span className="font-bold text-slate-900">{data.seller.vatNumber || "N/A"}</span>
                  {data.seller.companyRegistration && (
                    <>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reg No</span>
                      <span className="font-bold text-slate-900">{data.seller.companyRegistration}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 border-b border-primary/10 pb-1 inline-block">
              Bill To
            </h3>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">{data.buyer.companyName || data.buyer.name}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {data.buyer.address}<br />
                {buyerLocation}
              </p>
              <div className="pt-2 grid grid-cols-[60px_1fr] text-[10px] gap-x-2 gap-y-0.5">
                {isIndia && (
                  <>
                    <span className="text-slate-400 font-bold uppercase">GSTIN</span>
                    <span className="font-bold text-slate-700">{data.buyer.gstin || "N/A"}</span>
                    <span className="text-slate-400 font-bold uppercase">State</span>
                    <span className="font-bold text-slate-700">{data.buyer.placeOfSupply}</span>
                  </>
                )}
                {isIntl && (
                  <>
                    {data.buyer.vatNumber && (
                      <>
                        <span className="text-slate-400 font-bold uppercase">VAT</span>
                        <span className="font-bold text-slate-700">{data.buyer.vatNumber}</span>
                      </>
                    )}
                    <span className="text-slate-400 font-bold uppercase">Country</span>
                    <span className="font-bold text-slate-700">{data.buyer.country}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-200 pb-1 inline-block">
              Payment Terms
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Due Date</span>
                <span className="font-bold text-slate-900">
                  {new Date(data.details.dueDate).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {data.details.poNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">PO Number</span>
                  <span className="font-bold text-slate-900">{data.details.poNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Currency</span>
                <span className="font-bold text-slate-900">{data.details.currency}</span>
              </div>
              {isIndia && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Place of Supply</span>
                  <span className="font-bold text-slate-900">{data.buyer.placeOfSupply}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-left rounded-l-lg w-10">#</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-left">Description</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-center w-24">{isIndia ? "HSN" : "SKU"}</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-center w-16">Qty</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right w-28">Rate</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-center w-16">{isIndia ? "GST" : "Tax"}</th>
                <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right rounded-r-lg w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.itemsWithTax.map((item, index) => (
                <tr key={item.id} className="group">
                  <td className="py-4 px-3 text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-4 px-3">
                    <p className="font-bold text-slate-900 mb-0.5">{item.description}</p>
                    {item.discount > 0 && (
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                        {item.discount}% OFF
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-slate-600 text-center font-medium">{isIndia ? item.hsn : item.sku}</td>
                  <td className="py-4 px-3 text-slate-600 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 px-3 text-slate-600 text-right font-medium">
                    {currencySymbol}{item.rate.toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-3 text-slate-600 text-center font-medium">
                    {isIndia ? item.gstRate : item.taxRate}%
                  </td>
                  <td className="py-4 px-3 font-bold text-slate-900 text-right">
                    {currencySymbol}{item.total.toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations Section */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-12 pt-6 border-t border-slate-200">
          <div>
            {/* GST Breakdown (India Only) */}
            {isIndia && Object.keys(calculations.hsnSummary).length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  GST Summary Breakdown
                </h4>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-2 text-left text-slate-400 font-bold">HSN/SAC</th>
                      <th className="pb-2 text-right text-slate-400 font-bold">Taxable</th>
                      {!isInterState ? (
                        <>
                          <th className="pb-2 text-right text-slate-400 font-bold">CGST</th>
                          <th className="pb-2 text-right text-slate-400 font-bold">SGST</th>
                        </>
                      ) : (
                        <th className="pb-2 text-right text-slate-400 font-bold">IGST</th>
                      )}
                      <th className="pb-2 text-right text-slate-400 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(calculations.hsnSummary).map(([hsn, sum]) => (
                      <tr key={hsn}>
                        <td className="py-2 font-bold text-slate-700">{hsn}</td>
                        <td className="py-2 text-right text-slate-600">
                          {formatCurrency(sum.taxableValue, data.details.currency)}
                        </td>
                        {!isInterState ? (
                          <>
                            <td className="py-2 text-right text-slate-600">
                              {formatCurrency(sum.cgst, data.details.currency)} <span className="text-[8px] opacity-50">({sum.rate/2}%)</span>
                            </td>
                            <td className="py-2 text-right text-slate-600">
                              {formatCurrency(sum.sgst, data.details.currency)} <span className="text-[8px] opacity-50">({sum.rate/2}%)</span>
                            </td>
                          </>
                        ) : (
                          <td className="py-2 text-right text-slate-600">
                            {formatCurrency(sum.igst, data.details.currency)} <span className="text-[8px] opacity-50">({sum.rate}%)</span>
                          </td>
                        )}
                        <td className="py-2 text-right font-bold text-slate-900">
                          {formatCurrency(sum.cgst + sum.sgst + sum.igst, data.details.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total in Words */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Amount in words</p>
              <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">
                {numberToWords(calculations.grandTotal, data.details.currency)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium uppercase tracking-wider">Subtotal</span>
              <span className="font-bold text-slate-900">
                {currencySymbol}{calculations.subtotal.toLocaleString(locale, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium uppercase tracking-wider">Total Tax</span>
              <span className="font-bold text-slate-900">
                {currencySymbol}{calculations.totalTax.toLocaleString(locale, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {data.details.roundOff && calculations.roundOffAmount !== 0 && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium uppercase tracking-wider">Round Off</span>
                <span className="font-bold text-slate-900">
                  {calculations.roundOffAmount > 0 ? '+' : ''}
                  {currencySymbol}{Math.abs(calculations.roundOffAmount).toLocaleString(locale, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="pt-4 border-t-2 border-slate-900 mt-2">
              <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl p-4">
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Grand Total</span>
                <span className="text-xl font-black">
                  {currencySymbol}{calculations.grandTotal.toLocaleString(locale, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {isIndia && data.details.reverseCharge && (
              <p className="text-right text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">
                Reverse Charge: Yes
              </p>
            )}
          </div>
        </div>

        {/* Payment & Signatory Section */}
        <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t-2 border-slate-100 items-end">
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                Payment Information
              </h4>
              <div className="text-[10px] text-slate-600 space-y-1.5">
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="font-bold text-slate-400 uppercase text-[8px]">Bank Name</span>
                  <span className="font-bold text-slate-900">{data.seller.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="font-bold text-slate-400 uppercase text-[8px]">Account No</span>
                  <span className="font-bold text-slate-900">{data.seller.bankDetails.accountNumber}</span>
                </div>
                {isIndia && (
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="font-bold text-slate-400 uppercase text-[8px]">IFSC Code</span>
                    <span className="font-bold text-slate-900">{data.seller.bankDetails.ifscCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[8px]">Account Name</span>
                  <span className="font-bold text-slate-900">{data.seller.bankDetails.accountName}</span>
                </div>
              </div>
            </div>
            
            {qrCodeUrl && (
              <div className="text-center shrink-0">
                <div className="bg-white p-2 border-2 border-slate-50 rounded-2xl shadow-sm mb-2">
                  <img src={qrCodeUrl} alt="UPI QR" className="h-16 w-16 grayscale opacity-80" />
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scan to Pay</p>
              </div>
            )}
          </div>
          
          <div className="text-right flex flex-col items-end">
            {data.seller.signature && (
              <div className="mb-2">
                <img src={data.seller.signature} alt="Signature" className="h-12 w-auto object-contain grayscale mix-blend-multiply" />
              </div>
            )}
            <div className="w-48 h-px bg-slate-200 mb-2" />
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Authorized Signatory</p>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{data.seller.name}</p>
          </div>
        </div>
        
        {/* Footer Notes */}
        <div className="mt-auto pt-12">
          <div className="grid grid-cols-2 gap-8 text-[9px] text-slate-500 mb-8">
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-[8px]">Notes:</h4>
              <p className="whitespace-pre-wrap leading-relaxed italic border-l-2 border-slate-100 pl-3">
                {data.details.notes || "Thank you for your business!"}
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-[8px]">Terms & Conditions:</h4>
              <p className="whitespace-pre-wrap leading-relaxed italic border-l-2 border-slate-100 pl-3">
                {data.details.termsAndConditions}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
