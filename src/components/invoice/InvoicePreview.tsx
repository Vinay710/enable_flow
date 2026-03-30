import React, { useMemo, useEffect, useState } from "react";
import { InvoiceData } from "./types";
import { formatCurrency, numberToWords } from "./utils";
import QRCode from "qrcode";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    const isInterState = useMemo(() => {
      const sellerState = data.seller.state.toLowerCase().trim();
      const placeOfSupply = data.buyer.placeOfSupply.toLowerCase().trim();
      return sellerState !== placeOfSupply;
    }, [data.seller.state, data.buyer.placeOfSupply]);

    const calculations = useMemo(() => {
      let subtotal = 0;
      let totalTax = 0;
      
      // HSN-wise tax aggregation
      const hsnSummary: Record<string, { taxableValue: number; cgst: number; sgst: number; igst: number; rate: number }> = {};

      const itemsWithTax = data.items.map((item) => {
        const itemTotal = item.quantity * item.rate;
        const discountAmount = (itemTotal * (item.discount || 0)) / 100;
        const taxableValue = itemTotal - discountAmount;
        const taxAmount = (taxableValue * item.gstRate) / 100;

        subtotal += taxableValue;
        totalTax += taxAmount;

        let cgst = 0, sgst = 0, igst = 0;
        if (isInterState) {
          igst = taxAmount;
        } else {
          cgst = taxAmount / 2;
          sgst = taxAmount / 2;
        }

        // Aggregate by HSN
        const hsn = item.hsn || "N/A";
        if (!hsnSummary[hsn]) {
          hsnSummary[hsn] = { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, rate: item.gstRate };
        }
        hsnSummary[hsn].taxableValue += taxableValue;
        hsnSummary[hsn].cgst += cgst;
        hsnSummary[hsn].sgst += sgst;
        hsnSummary[hsn].igst += igst;

        return { ...item, taxableValue, taxAmount, cgst, sgst, igst, total: taxableValue + taxAmount };
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
    }, [data.items, isInterState, data.details.roundOff]);

    useEffect(() => {
      if (data.seller.bankDetails.upiId) {
        const upiString = `upi://pay?pa=${data.seller.bankDetails.upiId}&pn=${encodeURIComponent(
          data.seller.name
        )}&am=${calculations.grandTotal}&cu=INR`;
        
        QRCode.toDataURL(upiString, { width: 128, margin: 1 }, (err, url) => {
          if (!err) setQrCodeUrl(url);
        });
      } else {
        setQrCodeUrl("");
      }
    }, [data.seller.bankDetails.upiId, data.seller.name, calculations.grandTotal]);

    return (
      <div 
        ref={ref} 
        className="bg-white p-[15mm] w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col relative" 
        id="invoice-preview"
        style={{ fontFamily: "'Inter', sans-serif" }}
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
              <p className="text-[11px] text-slate-500 mt-1 max-w-[300px] leading-relaxed">
                {data.seller.address}, {data.seller.city}, {data.seller.state} - {data.seller.pincode}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-4">Tax Invoice</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <span className="text-slate-400 uppercase font-bold">Invoice No</span>
              <span className="font-bold text-slate-900">#{data.details.invoiceNumber}</span>
              <span className="text-slate-400 uppercase font-bold">Date</span>
              <span className="font-bold text-slate-900">{new Date(data.details.invoiceDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-400 uppercase font-bold">GSTIN</span>
              <span className="font-bold text-slate-900">{data.seller.gstin || "N/A"}</span>
              <span className="text-slate-400 uppercase font-bold">PAN</span>
              <span className="font-bold text-slate-900">{data.seller.pan || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          {/* Bill To */}
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Bill To</h3>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm">{data.buyer.companyName || data.buyer.name}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {data.buyer.address}<br />
                {data.buyer.city}, {data.buyer.pincode}
              </p>
              <div className="pt-2 grid grid-cols-[60px_1fr] text-[11px] gap-1">
                <span className="text-slate-400 font-bold uppercase">GSTIN</span>
                <span className="font-bold text-slate-900">{data.buyer.gstin || "N/A"}</span>
                <span className="text-slate-400 font-bold uppercase">State</span>
                <span className="font-bold text-slate-900">{data.buyer.placeOfSupply}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="text-right">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Shipment Details</h3>
            <div className="space-y-1 text-[11px]">
              <p><span className="text-slate-400 font-bold uppercase mr-2">Due Date</span> <span className="font-bold text-slate-900">{new Date(data.details.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
              {data.details.poNumber && <p><span className="text-slate-400 font-bold uppercase mr-2">PO No</span> <span className="font-bold text-slate-900">{data.details.poNumber}</span></p>}
              <p><span className="text-slate-400 font-bold uppercase mr-2">Supply Type</span> <span className="font-bold text-slate-900">Regular</span></p>
              <p><span className="text-slate-400 font-bold uppercase mr-2">Place of Supply</span> <span className="font-bold text-slate-900 uppercase">{data.buyer.placeOfSupply}</span></p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y-2 border-slate-900">
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-left w-8">#</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-left">Description</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-center">HSN/SAC</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-center">Qty</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right">Rate</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right">Taxable</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right">GST</th>
                <th className="py-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.itemsWithTax.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-3 px-2 text-[11px] text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-2 text-[11px] font-bold text-slate-900">{item.description}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 text-center">{item.hsn}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 text-center">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 text-right">{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 text-right">{item.taxableValue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 text-right">{item.gstRate}%</td>
                  <td className="py-3 px-2 text-[11px] font-bold text-slate-900 text-right">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-10 pt-6 border-t-2 border-slate-100 flex justify-between gap-10">
          <div className="flex-1">
            {/* HSN-wise GST Summary */}
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">GST Breakdown</h4>
            <table className="w-full text-[10px] border-collapse">
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
                    <td className="p-2 text-right">{sum.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    {!isInterState ? (
                      <>
                        <td className="p-2 text-right">{sum.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({sum.rate/2}%)</td>
                        <td className="p-2 text-right">{sum.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({sum.rate/2}%)</td>
                      </>
                    ) : (
                      <td className="p-2 text-right">{sum.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({sum.rate}%)</td>
                    )}
                    <td className="p-2 text-right font-bold">{(sum.cgst + sum.sgst + sum.igst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 p-3 bg-slate-50 rounded-lg">
               <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total in words</p>
               <p className="text-[11px] font-bold text-slate-900 italic">{numberToWords(calculations.grandTotal)}</p>
            </div>
          </div>

          <div className="w-[200px] space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-bold uppercase">Subtotal</span>
              <span className="font-bold text-slate-900">{formatCurrency(calculations.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-bold uppercase">Total Tax</span>
              <span className="font-bold text-slate-900">{formatCurrency(calculations.totalTax)}</span>
            </div>
            {data.details.roundOff && calculations.roundOffAmount !== 0 && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase">Round Off</span>
                <span className="font-bold text-slate-900">{calculations.roundOffAmount > 0 ? '+' : ''}{calculations.roundOffAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 px-4 bg-slate-900 text-white rounded-lg mt-4">
              <span className="text-[10px] font-black uppercase tracking-wider">Grand Total</span>
              <span className="text-lg font-black">{formatCurrency(calculations.grandTotal)}</span>
            </div>
            
            {data.details.reverseCharge && (
              <p className="text-[9px] text-center text-slate-400 uppercase font-bold pt-2 italic">Tax Payable on Reverse Charge basis: Yes</p>
            )}
          </div>
        </div>

        {/* Footer Section: Bank & Signature */}
        <div className="grid grid-cols-2 gap-10 mt-10 pt-8 border-t-2 border-slate-900 items-end">
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">Payment Info</h4>
              <div className="text-[10px] text-slate-600 space-y-1">
                <p><span className="font-bold text-slate-400 uppercase mr-1">Bank</span> {data.seller.bankDetails.bankName}</p>
                <p><span className="font-bold text-slate-400 uppercase mr-1">A/C No</span> {data.seller.bankDetails.accountNumber}</p>
                <p><span className="font-bold text-slate-400 uppercase mr-1">IFSC</span> {data.seller.bankDetails.ifscCode}</p>
              </div>
            </div>
            {qrCodeUrl && (
              <div className="flex items-center gap-3">
                <img src={qrCodeUrl} alt="UPI QR" className="h-16 w-16 border rounded p-1 bg-white shadow-sm" />
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Scan to Pay via UPI</p>
                  <p className="text-[10px] text-slate-400 font-medium">{data.seller.bankDetails.upiId}</p>
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
              <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Authorized Signatory</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{data.seller.name}</p>
            </div>
          </div>
        </div>
        
        {/* Fine Print */}
        <div className="mt-10 grid grid-cols-2 gap-10">
          <div className="text-[9px] text-slate-400 leading-relaxed italic">
            <h4 className="font-black text-slate-500 uppercase mb-1 not-italic">Notes:</h4>
            <p className="whitespace-pre-wrap">{data.details.notes || "Thank you for your business!"}</p>
          </div>
          <div className="text-[9px] text-slate-400 leading-relaxed italic">
            <h4 className="font-black text-slate-500 uppercase mb-1 not-italic">Terms & Conditions:</h4>
            <p className="whitespace-pre-wrap">{data.details.termsAndConditions}</p>
          </div>
        </div>

        <div className="mt-auto pt-8 text-center text-[8px] text-slate-300 uppercase tracking-widest font-bold">
          Generated via EnableFlow.com • GST Compliant Digital Invoice
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
