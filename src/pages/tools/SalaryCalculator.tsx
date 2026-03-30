import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, IndianRupee, Copy, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { useCurrencyInput, formatIndianCurrency, handleCurrencyInput } from "@/hooks/useCurrencyInput"; // Import the new hook

const currency = (n: number) => `₹${(isNaN(n) ? 0 : n).toLocaleString()}`;

const SalaryCalculator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  useEffect(() => {
    const title = "Salary In-Hand Calculator | EnableFlow";
    const description = "Calculate monthly take-home salary from annual CTC with PF, tax, professional tax, and custom components. Free online salary calculator for India.";
    setMetaDescription(description);
    const keywords = "salary calculator,in-hand salary,CTC calculator,PF,tax,professional tax,India,take home pay";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/salary-calculator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Salary Calculator", "item": canonicalHref }
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
          "name": "What is the difference between CTC and in-hand salary?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CTC includes your total annual cost to the company, while in-hand salary is what you receive each month after PF, tax, and other deductions."
          }
        },
        {
          "@type": "Question",
          "name": "Does this calculator include PF and taxes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. It estimates PF and tax percentages. You can adjust professional tax and add custom additions or deductions for better accuracy."
          }
        },
        {
          "@type": "Question",
          "name": "Is it accurate for all Indian states?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Professional tax varies by state. Update the professional tax field to match your state for more accurate results."
          }
        },
        {
          "@type": "Question",
          "name": "Do you store my salary details?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All calculations run in your browser and are not sent to any server."
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
  const annualCTC = useCurrencyInput("");
  const annualBonus = useCurrencyInput("");
  const [pfPercent, setPfPercent] = useState<string>("12");
  const [taxPercent, setTaxPercent] = useState<string>("10");
  const professionalTax = useCurrencyInput("200");
  const otherDeductions = useCurrencyInput("");
  const [adjustments, setAdjustments] = useState<
    { id: string; name: string; kind: "addition" | "deduction"; mode: "fixed" | "percent_monthly" | "percent_ctc"; value: string }[]
  >([]);

  const calc = useMemo(() => {
    const ctc = parseFloat(annualCTC.rawValue) || 0;
    const bonus = parseFloat(annualBonus.rawValue) || 0;
    const pf = parseFloat(pfPercent) || 0;
    const tax = parseFloat(taxPercent) || 0;
    const profTax = parseFloat(professionalTax.rawValue) || 0;
    const otherDeduct = parseFloat(otherDeductions.rawValue) || 0;

    const monthlyCTC = ctc / 12;
    const monthlyBonus = bonus / 12;
    const pfAmount = monthlyCTC * (pf / 100);
    const taxAmount = monthlyCTC * (tax / 100);
    const adjAmounts = adjustments.map(a => {
      const v = parseFloat(a.value) || 0;
      const amount =
        a.mode === "percent_monthly" ? monthlyCTC * (v / 100) :
        a.mode === "percent_ctc" ? (ctc * (v / 100)) / 12 :
        v;
      return { id: a.id, name: a.name || "Custom", kind: a.kind, amount };
    });
    const additionsTotal = adjAmounts.filter(a => a.kind === "addition").reduce((sum, a) => sum + a.amount, 0);
    const deductionsTotal = adjAmounts.filter(a => a.kind === "deduction").reduce((sum, a) => sum + a.amount, 0);
    const inHand =
      monthlyCTC +
      monthlyBonus -
      pfAmount -
      taxAmount -
      profTax -
      otherDeduct +
      additionsTotal -
      deductionsTotal;

    return {
      monthlyCTC,
      monthlyBonus,
      pfAmount,
      taxAmount,
      professionalTax: profTax,
      otherDeductions: otherDeduct,
      adjAmounts,
      additionsTotal,
      deductionsTotal,
      inHand,
    };
  }, [annualCTC, annualBonus, pfPercent, taxPercent, professionalTax, otherDeductions, adjustments]);

  const reset = () => {
    annualCTC.setRawValue("");
    annualBonus.setRawValue("");
    setPfPercent("12");
    setTaxPercent("10");
    professionalTax.setRawValue("200");
    otherDeductions.setRawValue("");
    setAdjustments([]);
  };

  const copyBreakdown = async () => {
    try {
      const breakdown = `SALARY BREAKDOWN
═══════════════════════════════

Monthly CTC: ${currency(Math.round(calc.monthlyCTC))}
Bonus (monthly): ${currency(Math.round(calc.monthlyBonus))}

DEDUCTIONS:
─────────────────────────────────
PF deduction: -${currency(Math.round(calc.pfAmount))}
Tax deduction: -${currency(Math.round(calc.taxAmount))}
Professional Tax: -${currency(Math.round(calc.professionalTax))}
Other Deductions: -${currency(Math.round(calc.otherDeductions))}
${calc.deductionsTotal > 0 ? `Custom Deductions: -${currency(Math.round(calc.deductionsTotal))}\n` : ''}

ADDITIONS:
─────────────────────────────────
${calc.additionsTotal > 0 ? `Custom Additions: +${currency(Math.round(calc.additionsTotal))}\n` : ''}

═══════════════════════════════
IN-HAND SALARY: ${currency(Math.round(calc.inHand))}
═══════════════════════════════`;

      await navigator.clipboard.writeText(breakdown);
      toast({
        title: "✓ Copied!",
        description: "Salary breakdown copied to clipboard",
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Salary In-Hand Calculator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Calculate your monthly take-home salary from your annual CTC. Estimate PF, tax, professional tax, and custom components.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Form Section */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Salary Details
                  </h2>
                  <p className="text-sm text-muted-foreground">Enter your annual CTC and deductions</p>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Primary Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="annualCTC" className="text-sm font-semibold text-foreground">
                        Annual CTC <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <input
                          ref={annualCTC.inputRef}
                          id="annualCTC"
                          type="text"
                          value={annualCTC.formattedValue}
                          onChange={annualCTC.onChange}
                          placeholder="12,00,000"
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="annualBonus" className="text-sm font-semibold text-foreground">
                        Annual Bonus <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <input
                          ref={annualBonus.inputRef}
                          id="annualBonus"
                          type="text"
                          value={annualBonus.formattedValue}
                          onChange={annualBonus.onChange}
                          placeholder="1,00,000"
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="pfPercent" className="text-sm font-semibold text-foreground">
                        PF Percentage
                      </label>
                      <div className="relative">
                        <input
                          id="pfPercent"
                          type="number"
                          value={pfPercent}
                          onChange={(e) => setPfPercent(e.target.value)}
                          placeholder="12"
                          className="w-full pl-4 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="taxPercent" className="text-sm font-semibold text-foreground">
                        Tax Percentage
                      </label>
                      <div className="relative">
                        <input
                          id="taxPercent"
                          type="number"
                          value={taxPercent}
                          onChange={(e) => setTaxPercent(e.target.value)}
                          placeholder="10"
                          className="w-full pl-4 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="professionalTax" className="text-sm font-semibold text-foreground">
                        Professional Tax <span className="text-muted-foreground text-xs font-normal">(monthly)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <input
                          ref={professionalTax.inputRef}
                          id="professionalTax"
                          type="text"
                          value={professionalTax.formattedValue}
                          onChange={professionalTax.onChange}
                          placeholder="200"
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="otherDeductions" className="text-sm font-semibold text-foreground">
                        Other Deductions <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <input
                          ref={otherDeductions.inputRef}
                          id="otherDeductions"
                          type="text"
                          value={otherDeductions.formattedValue}
                          onChange={otherDeductions.onChange}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Components Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Custom Components</h3>
                        <p className="text-sm text-muted-foreground">Add allowances (HRA, LTA) or deductions (Insurance, NPS)</p>
                      </div>
                      <button
                        onClick={() => setAdjustments(prev => [...prev, { id: crypto.randomUUID(), name: "", kind: "addition", mode: "percent_monthly", value: "" }])}
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Component
                      </button>
                    </div>

                    {adjustments.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-sm text-muted-foreground">No custom components added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {adjustments.map((a) => (
                          <div key={a.id} className="group relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/30 transition-all">
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Name</label>
                              <input
                                type="text"
                                value={a.name}
                                onChange={(e) => setAdjustments(prev => prev.map(x => x.id === a.id ? { ...x, name: e.target.value } : x))}
                                placeholder="e.g. HRA"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Type</label>
                              <select
                                value={a.kind}
                                onChange={(e) => setAdjustments(prev => prev.map(x => x.id === a.id ? { ...x, kind: e.target.value as any } : x))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                              >
                                <option value="addition">Add (+)</option>
                                <option value="deduction">Ded (-)</option>
                              </select>
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Value</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">
                                  {a.mode === "fixed" ? "₹" : "%"}
                                </span>
                                <input
                                  type="text"
                                  value={a.mode === "fixed" ? formatIndianCurrency(a.value) : a.value}
                                  onChange={(e) => {
                                    const v = a.mode === "fixed" ? handleCurrencyInput(e.target.value) : e.target.value.replace(/\D/g, '');
                                    setAdjustments(prev => prev.map(x => x.id === a.id ? { ...x, value: v } : x));
                                  }}
                                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Mode</label>
                              <div className="flex gap-2">
                                <select
                                  value={a.mode}
                                  onChange={(e) => setAdjustments(prev => prev.map(x => x.id === a.id ? { ...x, mode: e.target.value as any } : x))}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                >
                                  <option value="fixed">Fixed</option>
                                  <option value="percent_monthly">% Monthly</option>
                                  <option value="percent_ctc">% CTC</option>
                                </select>
                                <button
                                  onClick={() => setAdjustments(prev => prev.filter(x => x.id !== a.id))}
                                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Summary Section */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
                  <p className="text-slate-400 text-sm">Estimated take-home salary</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Monthly CTC</span>
                    <span className="font-medium">{currency(Math.round(calc.monthlyCTC))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Monthly Bonus</span>
                    <span className="font-medium">{currency(Math.round(calc.monthlyBonus))}</span>
                  </div>
                  
                  {calc.additionsTotal > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-400">
                      <span>Custom Additions</span>
                      <span>+{currency(Math.round(calc.additionsTotal))}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-800 my-2" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">PF Deduction</span>
                      <span className="text-red-400">-{currency(Math.round(calc.pfAmount))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Tax Deduction</span>
                      <span className="text-red-400">-{currency(Math.round(calc.taxAmount))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Professional Tax</span>
                      <span className="text-red-400">-{currency(Math.round(calc.professionalTax))}</span>
                    </div>
                    {calc.otherDeductions > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Other Deductions</span>
                        <span className="text-red-400">-{currency(Math.round(calc.otherDeductions))}</span>
                      </div>
                    )}
                    {calc.deductionsTotal > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Custom Deductions</span>
                        <span className="text-red-400">-{currency(Math.round(calc.deductionsTotal))}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800 my-4" />

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Net In-Hand Salary</p>
                      <p className="text-3xl font-bold text-white">{currency(Math.round(calc.inHand))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">per month</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 flex gap-3">
                  <button 
                    onClick={copyBreakdown}
                    className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Breakdown
                  </button>
                  <button 
                    onClick={reset}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Pro Tip</h4>
                  <p className="text-blue-800 text-xs leading-relaxed mt-1">
                    Add custom components like HRA or LTA to get a more accurate in-hand figure. You can set them as fixed amounts or percentages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools Section */}
          <section className="py-16 mt-10">
            <h3 className="text-2xl font-bold mb-8">Related Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "GST Calculator", path: "/tools/gst-calculator", description: "Calculate GST for products and services", icon: IndianRupee },
                { title: "Invoice Generator", path: "/tools/invoice-generator", description: "Create professional GST invoices", icon: Copy },
                { title: "Working Days Calculator", path: "/tools/working-days", description: "Calculate working days between dates", icon: Plus },
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
                Calculate your monthly take-home salary from your annual CTC with our free Salary In-Hand Calculator.
                Estimate PF, tax, professional tax, and custom components to see a clear net income.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Monthly breakdown of CTC, deductions, additions</li>
                    <li>• Custom components (allowances/deductions)</li>
                    <li>• Live calculation, reset, and copy summary</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">What is the difference between CTC and in-hand salary?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    CTC is total annual cost to company. In-hand is monthly pay after PF, tax, and other deductions.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Does this include PF and taxes?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. PF and tax are estimated, and you can tweak professional tax and custom components.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Is it valid for all states?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Professional tax differs by state. Update that field for accuracy.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SalaryCalculator;
