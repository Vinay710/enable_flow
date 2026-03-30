import React, { useMemo, useState, useEffect, useRef } from "react";
import { ArrowLeft, Calculator, Copy, RotateCcw, IndianRupee, Percent, Plus, Minus, Landmark, Download, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { useCurrencyInput, formatIndianCurrency, handleCurrencyInput } from "@/hooks/useCurrencyInput";
import html2pdf from "html2pdf.js";

const currency = (n: number) => `₹${(isNaN(n) ? 0 : n).toLocaleString('en-IN')}`;

const GSTCalculator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const summaryRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const title = "GST Calculator | EnableFlow";
    const description = "Add or remove GST from base or total amounts with preset and custom rates. Get base, GST amount, and total values instantly.";
    setMetaDescription(description);
    const keywords = "GST calculator,add GST,remove GST,goods and services tax,India,tax calculator,18% GST,12% GST";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/gst-calculator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "GST Calculator", "item": canonicalHref }
      ]
    };
    const webPageJson = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": canonicalHref
    };
    const addJsonLd = (json: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.setAttribute("type", "application/ld+json");
      s.textContent = JSON.stringify(json);
      head.appendChild(s);
      return s;
    };
    const s1 = addJsonLd(breadcrumbJson);
    const s2 = addJsonLd(webPageJson);
    const faqJson = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I add vs remove GST?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use Add to compute GST on a base amount. Use Remove to split GST from a total amount. Use Included when the total already has GST and you want the base."
          }
        },
        {
          "@type": "Question",
          "name": "Which GST rates are supported?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Common rates of 5%, 12%, 18%, and 28% are provided, plus a custom option for any other rate."
          }
        },
        {
          "@type": "Question",
          "name": "Is this suitable for IGST/CGST/SGST splits?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "This calculator provides total GST math. For detailed invoice-level splits, use the Invoice Generator."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data stored?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, all calculations happen in your browser and are not saved."
          }
        }
      ]
    };
    const s3 = addJsonLd(faqJson);
    return () => {
      s1.remove();
      s2.remove();
      s3.remove();
    };
  }, []);

  const { toast } = useToast();
  const amountInput = useCurrencyInput("");
  const [gstRate, setGstRate] = useState<"5" | "12" | "18" | "28" | "custom">("18");
  const [customRate, setCustomRate] = useState<string>("");
  const [mode, setMode] = useState<"add" | "remove" | "included">("add");
  const [isInterState, setIsInterState] = useState(false);

  const calculation = useMemo(() => {
    const amt = parseFloat(amountInput.rawValue) || 0;
    const rate = gstRate === "custom" ? parseFloat(customRate) : parseFloat(gstRate);

    if (amt <= 0 || isNaN(rate) || rate < 0) {
      return null;
    }

    let baseAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (mode === "add") {
      baseAmount = amt;
      gstAmount = amt * (rate / 100);
      totalAmount = amt + gstAmount;
    } else {
      // Remove or Included
      totalAmount = amt;
      baseAmount = amt / (1 + rate / 100);
      gstAmount = amt - baseAmount;
    }

    const cgst = isInterState ? 0 : gstAmount / 2;
    const sgst = isInterState ? 0 : gstAmount / 2;
    const igst = isInterState ? gstAmount : 0;

    return {
      baseAmount: Math.round(baseAmount),
      gstAmount: Math.round(gstAmount),
      totalAmount: Math.round(totalAmount),
      cgst: Math.round(cgst),
      sgst: Math.round(sgst),
      igst: Math.round(igst),
      gstRate: rate,
      mode,
    };
  }, [amountInput.rawValue, gstRate, customRate, mode, isInterState]);

  const reset = () => {
    amountInput.setRawValue("");
    setGstRate("18");
    setCustomRate("");
    setMode("add");
    setIsInterState(false);
  };

  const handleDownloadPdf = () => {
    if (!summaryRef.current || !calculation) return;
    
    const element = summaryRef.current;
    const opt = {
      margin: [10, 10] as [number, number],
      filename: `GST_Summary_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const copySummary = async () => {
    if (!calculation) return;

    try {
      const summaryText = `GST CALCULATION SUMMARY
═══════════════════════════════

Mode: ${mode === "add" ? "Add GST" : "Remove GST"}
GST Rate: ${calculation.gstRate}%
Transaction: ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}

Base Amount: ${currency(calculation.baseAmount)}
GST Amount: ${currency(calculation.gstAmount)}
${!isInterState ? `CGST (50%): ${currency(calculation.cgst)}\nSGST (50%): ${currency(calculation.sgst)}` : `IGST (100%): ${currency(calculation.igst)}`}
Total Amount: ${currency(calculation.totalAmount)}

═══════════════════════════════`;

      await navigator.clipboard.writeText(summaryText);
      toast({
        title: "✓ Copied!",
        description: "GST summary copied to clipboard",
        duration: 2000,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">GST Calculator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Add or remove Goods and Services Tax instantly. Calculate CGST, SGST, and IGST splits based on transaction type.
              </p>
            </div>
            
            {calculation && (
              <div className="flex gap-3 shrink-0">
                <button 
                  onClick={() => window.print()} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-md"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Input Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    GST Details
                  </h2>
                  <p className="text-sm text-muted-foreground">Update values to see live tax breakdown</p>
                </div>

                <div className="p-6 space-y-8">
                  {/* Mode Toggle */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Calculation Mode</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setMode("add")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-lg transition-all ${
                          mode === "add" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        Add GST
                      </button>
                      <button
                        onClick={() => setMode("remove")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-lg transition-all ${
                          mode === "remove" || mode === "included" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Minus className="h-3 w-3" />
                        Remove GST
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-4">
                    <label htmlFor="amount" className="text-sm font-semibold text-foreground">
                      {mode === "add" ? "Base Amount" : "Total Amount (with GST)"} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <input
                        id="amount"
                        ref={amountInput.inputRef}
                        type="text"
                        value={amountInput.formattedValue}
                        onChange={amountInput.onChange}
                        placeholder="10,000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="10000000"
                      step="1000"
                      value={amountInput.rawValue || 0}
                      onChange={(e) => amountInput.setRawValue(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>₹100</span>
                      <span>₹1 Crore</span>
                    </div>
                  </div>

                  {/* GST Rate Selection */}
                  <div className="space-y-4">
                    <label htmlFor="gstRate" className="text-sm font-semibold text-foreground">
                      GST Rate (%) <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {["5", "12", "18", "28", "custom"].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setGstRate(rate as any)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            gstRate === rate 
                              ? "bg-primary border-primary text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-primary/30"
                          }`}
                        >
                          {rate === "custom" ? "Custom" : `${rate}%`}
                        </button>
                      ))}
                    </div>

                    {gstRate === "custom" && (
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                        <input
                          type="number"
                          value={customRate}
                          onChange={(e) => setCustomRate(e.target.value)}
                          placeholder="Enter custom rate"
                          step="0.1"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                      </div>
                    )}
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-foreground">Transaction Type</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          checked={!isInterState}
                          onChange={() => setIsInterState(false)}
                          className="w-4 h-4 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-foreground">Intra-State (CGST + SGST)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          checked={isInterState}
                          onChange={() => setIsInterState(true)}
                          className="w-4 h-4 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-foreground">Inter-State (IGST)</span>
                      </label>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={reset}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All Fields
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">GST Compliance</h4>
                  <p className="text-blue-800 text-xs leading-relaxed mt-1">
                    GST is divided into CGST & SGST for local sales, and IGST for sales to other states. Most standard services fall under the 18% bracket.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Results Card */}
            <div className="lg:col-span-7 space-y-6">
              {calculation ? (
                <div className="space-y-8">
                  {/* Main Summary Card */}
                  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" ref={summaryRef} id="gst-summary-print">
                    <div className="p-6 border-b bg-slate-900 text-white">
                      <h3 className="text-lg font-semibold">Calculation Summary</h3>
                      <p className="text-slate-400 text-sm">Detailed tax breakdown</p>
                    </div>

                    <div className="p-8 space-y-8">
                      {/* Primary Highlight */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Base Amount</p>
                          <p className="text-3xl font-bold text-slate-900">{currency(calculation.baseAmount)}</p>
                        </div>
                        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                          <p className="text-[10px] uppercase font-bold text-orange-400 tracking-widest mb-1">Total GST ({calculation.gstRate}%)</p>
                          <p className="text-3xl font-bold text-orange-700">{currency(calculation.gstAmount)}</p>
                        </div>
                      </div>

                      {/* Tax Split */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tax Component Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {!isInterState ? (
                            <>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">CGST ({calculation.gstRate/2}%)</span>
                                <span className="text-lg font-bold text-slate-900">{currency(calculation.cgst)}</span>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">SGST ({calculation.gstRate/2}%)</span>
                                <span className="text-lg font-bold text-slate-900">{currency(calculation.sgst)}</span>
                              </div>
                              <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center text-center opacity-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">IGST (0%)</span>
                                <span className="text-lg font-bold text-slate-900">₹0</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center text-center opacity-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">CGST (0%)</span>
                                <span className="text-lg font-bold text-slate-900">₹0</span>
                              </div>
                              <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center text-center opacity-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">SGST (0%)</span>
                                <span className="text-lg font-bold text-slate-900">₹0</span>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">IGST ({calculation.gstRate}%)</span>
                                <span className="text-lg font-bold text-slate-900">{currency(calculation.igst)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Grand Total */}
                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Grand Total Amount</p>
                            <p className="text-4xl font-black text-primary tracking-tight">{currency(calculation.totalAmount)}</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={copySummary}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                              <Copy className="h-4 w-4" />
                              Copy Summary
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Insight Card */}
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Transaction Summary</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Transaction Type</span>
                        <span className="font-semibold text-slate-900">{isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Effective GST Rate</span>
                        <span className="font-semibold text-slate-900">{calculation.gstRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Tax Payable</span>
                        <span className="font-semibold text-orange-600">{currency(calculation.gstAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Percent className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">GST Calculation Result</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">
                    Enter the amount and select a GST rate to see the detailed tax breakdown and final totals.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Tools Section */}
          <section className="py-16 mt-10">
            <h3 className="text-2xl font-bold mb-8">Related Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Salary Calculator", path: "/tools/salary-calculator", description: "Calculate monthly take-home salary", icon: IndianRupee },
                { title: "EMI Calculator", path: "/tools/emi-calculator", description: "Calculate monthly loan EMI breakdown", icon: Calculator },
                { title: "Invoice Generator", path: "/tools/invoice-generator", description: "Create professional GST invoices", icon: Copy },
              ].map((t) => (
                <Link key={t.title} to={t.path} className="group tool-card hover:border-primary/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                      <t.icon className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-lg group-hover:text-primary transition-colors">{t.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                      <div className="text-xs font-semibold text-primary mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open tool <ArrowLeft className="h-3 w-3 rotate-180" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* About/FAQ Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">About this tool</h2>
              <p className="text-muted-foreground leading-relaxed">
                Add or remove Goods and Services Tax from base or total amounts with preset and custom rates.
                Ideal for invoicing, pricing, and compliance tasks where quick, accurate GST math is needed.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Add/Remove GST modes</li>
                    <li>• CGST, SGST, and IGST split calculation</li>
                    <li>• Preset rates (5%, 12%, 18%, 28%) + Custom</li>
                    <li>• Live calculation and Copy Summary feature</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">How do I add vs remove GST?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Use 'Add GST' when you have the base price and want to calculate the tax on top. Use 'Remove GST' when you have the total price and want to find the original base price.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">What are CGST, SGST, and IGST?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    CGST and SGST are applied for intra-state (same state) transactions. IGST is applied for inter-state (between different states) transactions.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Which GST rates are supported?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    We provide presets for common Indian GST slabs: 5%, 12%, 18%, and 28%. You can also enter any custom percentage.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #gst-summary-print, #gst-summary-print * {
            visibility: visible;
          }
          #gst-summary-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: 1px solid #e2e8f0;
          }
        }
      `}</style>
    </div>
  );
};

export default GSTCalculator;

