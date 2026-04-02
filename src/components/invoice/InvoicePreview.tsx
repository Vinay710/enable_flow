import React, { useMemo, useEffect, useState } from "react";
import { InvoiceData, Region } from "./types";
import { formatCurrency, numberToWords } from "./utils";
import QRCode from "qrcode";
import { CURRENCIES } from "./constants";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const isIndia = data.details.region === "IN";
    const isIntl = data.details.region === "INTL";
    
    const locale = isIndia ? 'en-IN' : 'en-US';

    const currencySymbol = useMemo(() => {
      const curr = CURRENCIES.find(c => c.code === data.details.currency);
      return curr?.symbol || "$";
    }, [data.details.currency]);

    const isInterState = useMemo(() => {
      if (!isIndia) return false;
      const sellerState = (data.seller.state || "").toLowerCase().trim();
      const placeOfSupply = (data.buyer.placeOfSupply || "").toLowerCase().trim();
      return sellerState !== placeOfSupply && sellerState && placeOfSupply;
    }, [data.seller.state, data.buyer.placeOfSupply, isIndia]);

    const calculations = useMemo(() => {
      let subtotal = 0;
      let totalTax = 0;
      
      let hsnSummary: Record<string, any> = {};
      let taxSummary: Record<string, any> = {};

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

    const sellerLocation = isIndia
      ? `${data.seller.city}, ${data.seller.state} - ${data.seller.pincode}`
      : `${data.seller.city}, ${data.seller.country} ${data.seller.postalCode || ""}`;

    const buyerLocation = isIndia
      ? `${data.buyer.city}, ${data.buyer.pincode}`
      : `${data.buyer.city}, ${data.buyer.country} ${data.buyer.postalCode || ""}`;

    return (
      <div 
        ref={ref} 
        className="bg-white w-full md:w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col relative p-3 sm:p-4 md:p-[15mm]" 
        id="invoice-preview"
        style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: '14px' }}
      >
        {/* Top Header: Invoice Label & Meta */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            {data.seller.logo ? (
              <img src={data.seller.logo} alt="Logo" className="h-16 w-auto object-contain object-left" />
            ) : (
              <div className="h-12 w-12 bg-slate-100 rounded flex items-center justify-center text-slate-400 font-bold">
                LOGO
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight uppercase tracking-tight">{data.seller.name}</h1>
              <p className="text-[13px] text-slate-600 mt-1 max-w-[300px] leading-relaxed font-medium">
                {data.seller.address}, {sellerLocation}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-600 uppercase tracking-tighter mb-4">{data.details.invoiceType}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <span className="text-slate-400 uppercase font-bold">Invoice No</span>
              <span className="font-bold text-slate-900">#{data.details.invoiceNumber}</span>
              <span className="text-slate-400 uppercase font-bold">Date</span>
              <span className="font-bold text-slate-900">{new Date(data.details.invoiceDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              {isIndia && (
                <>
                  <span className="text-slate-400 uppercase font-bold">GSTIN</span>
                  <span className="font-bold text-slate-900">{data.seller.gstin || "N/A"}</span>
                  <span className="text-slate-400 uppercase font-bold">PAN</span>
                  <span className="font-bold text-slate-900">{data.seller.pan || "N/A"}</span>
                </>
              )}
              {isIntl && (
                <>
                  <span className="text-slate-400 uppercase font-bold">VAT No</span>
                  <span className="font-bold text-slate-900">{data.seller.vatNumber || "N/A"}</span>
                  {data.seller.companyRegistration && (
                    <>
                      <span className="text-slate-400 uppercase font-bold">Reg No</span>
                      <span className="font-bold text-slate-900">{data.seller.companyRegistration}</span>
                    </>
                  )}
                  <span className="text-slate-400 uppercase font-bold">Currency</span>
                  <span className="font-bold text-slate-900">{data.details.currency}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          {/* Bill To */}
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-primary mb-3">Bill To</h3>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm">{data.buyer.companyName || data.buyer.name}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {data.buyer.address}<br />
                {buyerLocation}
              </p>
              <div className="pt-2 grid grid-cols-[60px_1fr] text-[12px] gap-2">
                {isIndia && (
                  <>
                    <span className="text-slate-400 font-bold uppercase">GSTIN</span>
                    <span className="font-bold text-slate-900">{data.buyer.gstin || "N/A"}</span>
                    <span className="text-slate-400 font-bold uppercase">State</span>
                    <span className="font-bold text-slate-900">{data.buyer.placeOfSupply}</span>
                  </>
                )}
                {isIntl && (
                  <>
                    {data.buyer.vatNumber && (
                      <>
                        <span className="text-slate-400 font-bold uppercase">VAT</span>
                        <span className="font-bold text-slate-900">{data.buyer.vatNumber}</span>
                      </>
                    )}
                    {data.buyer.companyRegistration && (
                      <>
                        <span className="text-slate-400 font-bold uppercase">Reg No</span>
                        <span className="font-bold text-slate-900">{data.buyer.companyRegistration}</span>
                      </>
                    )}
                    <span className="text-slate-400 font-bold uppercase">Country</span>
                    <span className="font-bold text-slate-900">{data.buyer.country}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="text-right">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-600 mb-3">Invoice Details</h3>
            <div className="space-y-2 text-[12px]">
              <p><span className="text-slate-400 font-bold uppercase mr-2">Due Date</span> <span className="font-bold text-slate-900">{new Date(data.details.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
              {data.details.poNumber && <p><span className="text-slate-400 font-bold uppercase mr-2">PO No</span> <span className="font-bold text-slate-900">{data.details.poNumber}</span></p>}
              {isIndia && (
                <>
                  
                  <p><span className="text-slate-400 font-bold uppercase mr-2">Place of Supply</span> <span className="font-bold text-slate-900 uppercase">{data.buyer.placeOfSupply}</span></p>
                </>
              )}
              {isIntl && (
                <>
                  <p><span className="text-slate-400 font-bold uppercase mr-2">Tax Type</span> <span className="font-bold text-slate-900">{data.details.taxType}</span></p>
                  <p><span className="text-slate-400 font-bold uppercase mr-2">Currency</span> <span className="font-bold text-slate-900">{data.details.currency}</span></p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="border-y-2 border-slate-900">
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-left w-6">#</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-left min-w-[120px]">Description</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-center min-w-[70px]">{isIndia ? "HSN/SAC" : "SKU"}</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-center min-w-[40px]">Qty</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right min-w-[90px]">Rate</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right min-w-[100px]">Taxable</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-center min-w-[50px]">{isIndia ? "GST" : "Tax"}</th>
                <th className="py-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right min-w-[100px]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.itemsWithTax.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2 px-1 text-[10px] text-slate-500 font-medium">{index + 1}</td>
                  <td className="py-2 px-1 text-[10px] font-bold text-slate-900">{item.description}</td>
                  <td className="py-2 px-1 text-[10px] text-slate-700 text-center font-medium">{isIndia ? item.hsn : item.sku}</td>
                  <td className="py-2 px-1 text-[10px] text-slate-700 text-center font-medium">{item.quantity} {item.unit}</td>
                  <td className="py-2 px-1 text-[9px] text-slate-700 text-right font-medium break-all">{currencySymbol}{item.rate.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-1 text-[9px] text-slate-700 text-right font-medium break-all">{currencySymbol}{item.taxableValue.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-1 text-[10px] text-slate-700 text-center font-medium">{isIndia ? item.gstRate : item.taxRate}%</td>
                  <td className="py-2 px-1 text-[9px] font-bold text-slate-900 text-right break-all">{currencySymbol}{item.total.toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-10 pt-6 border-t-2 border-slate-100 flex justify-between gap-10">
          <div className="flex-1">
            {/* Tax Breakdown */}
            {isIndia && (
              <>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-600 mb-3">GST Breakdown</h4>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-2 text-left">HSN/SAC</th>
                      <th className="p-2 text-right">Taxable</th>
                      {!isInterState ? (
                        <>
                          <th className="p-2 text-right">CGST</th>
                          <th className="p-2 text-right">SGST</th>
                        </>
                      ) : (
                        <th className="p-2 text-right">IGST</th>
                      )}
                      <th className="p-2 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(calculations.hsnSummary).map(([hsn, sum]) => (
                      <tr key={hsn}>
                        <td className="p-2 font-bold">{hsn}</td>
                        <td className="p-2 text-right">{formatCurrency(sum.taxableValue)}</td>
                        {!isInterState ? (
                          <>
                            <td className="p-2 text-right">{formatCurrency(sum.cgst)} ({sum.rate/2}%)</td>
                            <td className="p-2 text-right">{formatCurrency(sum.sgst)} ({sum.rate/2}%)</td>
                          </>
                        ) : (
                          <td className="p-2 text-right">{formatCurrency(sum.igst)} ({sum.rate}%)</td>
                        )}
                        <td className="p-2 text-right font-bold">{formatCurrency(sum.cgst + sum.sgst + sum.igst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {isIntl && (
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-600 mb-3">Tax Summary ({data.details.taxType})</h4>
                <p className="text-[12px] text-slate-700 font-medium">Total Taxable Amount: {currencySymbol}{calculations.subtotal.toLocaleString(locale, { minimumFractionDigits: 2 })}</p>
              </div>
            )}
            
            <div className="mt-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-[11px] text-slate-500 uppercase font-bold mb-2">Total in words</p>
              <p className="text-[12px] font-bold text-slate-900 italic">{numberToWords(calculations.grandTotal, data.details.currency)}</p>
            </div>
          </div>

          <div className="ml-auto space-y-2 min-w-[200px]">
            <div className="flex justify-between text-[11px] gap-3">
              <span className="text-slate-600 font-bold uppercase">Subtotal</span>
              <span className="font-bold text-slate-900 text-right break-all">{currencySymbol}{calculations.subtotal.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[11px] gap-3">
              <span className="text-slate-600 font-bold uppercase">Total Tax</span>
              <span className="font-bold text-slate-900 text-right break-all">{currencySymbol}{calculations.totalTax.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
            </div>
            {data.details.roundOff && calculations.roundOffAmount !== 0 && (
              <div className="flex justify-between text-[11px] gap-3">
                <span className="text-slate-600 font-bold uppercase">Round Off</span>
                <span className="font-bold text-slate-900 text-right break-all">{calculations.roundOffAmount > 0 ? '+' : ''}{currencySymbol}{Math.abs(calculations.roundOffAmount).toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 px-4 bg-slate-900 text-white rounded-lg mt-4 gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider shrink-0">Grand Total</span>
              <span className="text-sm font-black text-right break-all">{currencySymbol}{calculations.grandTotal.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
            </div>
            
            {isIndia && data.details.reverseCharge && (
              <p className="text-[10px] text-center text-slate-500 uppercase font-bold pt-2 italic">Tax Payable on Reverse Charge basis: Yes</p>
            )}
          </div>
        </div>

        {/* Footer Section: Bank & Signature */}
        <div className="grid grid-cols-2 gap-10 mt-10 pt-8 border-t-2 border-slate-900 items-end">
          <div className="space-y-4">
            <div>
              <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-2">Payment Info</h4>
              <div className="text-[11px] text-slate-700 space-y-1">
                <p><span className="font-bold text-slate-600 uppercase mr-2">Bank</span> {data.seller.bankDetails.bankName}</p>
                {data.seller.bankDetails.branch && (
                  <p><span className="font-bold text-slate-600 uppercase mr-2">Branch</span> {data.seller.bankDetails.branch}</p>
                )}
                <p><span className="font-bold text-slate-600 uppercase mr-2">Holder</span> {data.seller.bankDetails.accountName}</p>
                <p><span className="font-bold text-slate-600 uppercase mr-2">Account</span> {data.seller.bankDetails.accountNumber}</p>
                {isIndia && (
                  <p><span className="font-bold text-slate-600 uppercase mr-2">IFSC</span> {data.seller.bankDetails.ifscCode}</p>
                )}
              </div>
            </div>
            {qrCodeUrl && (
              <div className="flex items-center gap-3">
                <img src={qrCodeUrl} alt="UPI QR" className="h-16 w-16 border rounded p-1 bg-white shadow-sm" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Scan to Pay via UPI</p>
                  <p className="text-[11px] text-slate-600 font-medium">{data.seller.bankDetails.upiId}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right space-y-2">
            {data.seller.signature && (
              <div className="inline-block border-b border-slate-200 pb-1 mb-1">
                <img src={data.seller.signature} alt="Signature" className="h-12 w-auto object-contain mx-auto grayscale contrast-125" />
              </div>
            )}
            <div>
              <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Authorized Signatory</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{data.seller.name}</p>
            </div>
          </div>
        </div>
        
        {/* Fine Print */}
        <div className="mt-10 grid grid-cols-2 gap-10">
          <div className="text-[10px] text-slate-600 leading-relaxed italic">
            <h4 className="font-black text-slate-700 uppercase mb-2 not-italic">Notes:</h4>
            <p className="whitespace-pre-wrap">{data.details.notes || "Thank you for your business!"}</p>
          </div>
          <div className="text-[10px] text-slate-600 leading-relaxed italic">
            <h4 className="font-black text-slate-700 uppercase mb-2 not-italic">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{data.details.termsAndConditions}</p>
          </div>
        </div>

        <div className="mt-auto pt-8 text-center text-[9px] text-slate-400 uppercase tracking-widest font-bold">
          Generated via EnableFlow.com • {isIndia ? "GST Compliant" : "International"} Digital Invoice
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
