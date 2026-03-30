import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowLeft, Percent, Copy, RotateCcw, Download, Printer, IndianRupee, CalendarDays, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { useCurrencyInput, formatIndianCurrency, handleCurrencyInput } from "@/hooks/useCurrencyInput";
import html2pdf from "html2pdf.js";

const currency = (n: number) => `₹${(isNaN(n) ? 0 : n).toLocaleString('en-IN')}`;

const EMICalculator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const summaryRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const title = "EMI Calculator | EnableFlow";
    const description = "Calculate monthly loan EMI with total interest and payment. Compare scenarios for home, car, personal, and education loans. Free online EMI calculator.";
    setMetaDescription(description);
    const keywords = "EMI calculator,loan calculator,monthly payment,interest rate,tenure,home loan,car loan,personal loan";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/emi-calculator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "EMI Calculator", "item": canonicalHref }
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
          "name": "What is EMI and how is it calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EMI (Equated Monthly Installment) is a fixed payment made every month. It is calculated using the loan amount, annual interest rate, and tenure using the standard amortization formula."
          }
        },
        {
          "@type": "Question",
          "name": "Which loans can I use this EMI calculator for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use it for home, car, personal, education and other fixed-rate loans where monthly repayment is required."
          }
        },
        {
          "@type": "Question",
          "name": "Does the calculator include prepayments or part-payments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "This version does not include prepayment schedules. You can approximate by reducing principal and recalculating."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data stored?",
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
  const principal = useCurrencyInput("");
  const [rate, setRate] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");
  const [tenureType, setTenureType] = useState<"months" | "years">("years");

  const calculation = useMemo(() => {
    const p = parseFloat(principal.rawValue) || 0;
    const r = parseFloat(rate) || 0;
    let months = 0;

    if (tenureType === "years") {
      months = parseFloat(tenure) ? parseFloat(tenure) * 12 : 0;
    } else {
      months = parseFloat(tenure) || 0;
    }

    if (p <= 0 || r <= 0 || months <= 0) {
      return null;
    }

    const monthlyRate = r / 12 / 100;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - p;

    // Generate amortization schedule
    const schedule = [];
    let remainingBalance = p;
    for (let i = 1; i <= months; i++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      remainingBalance -= principalForMonth;
      schedule.push({
        month: i,
        emi: Math.round(emi),
        principal: Math.round(principalForMonth),
        interest: Math.round(interestForMonth),
        balance: Math.max(0, Math.round(remainingBalance))
      });
    }

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      months: Math.round(months),
      schedule
    };
  }, [principal.rawValue, rate, tenure, tenureType]);

  const reset = () => {
    principal.setRawValue("");
    setRate("");
    setTenure("");
    setTenureType("years");
  };

  const handleDownloadPdf = () => {
    if (!summaryRef.current || !calculation) return;
    
    const element = summaryRef.current;
    const opt = {
      margin: [10, 10] as [number, number],
      filename: `EMI_Summary_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const copySummary = async () => {
    if (!calculation) return;
    
    try {
      const summaryText = `LOAN EMI SUMMARY
═══════════════════════════════

Loan Amount: ${currency(parseFloat(principal.rawValue))}
Interest Rate: ${rate}% per annum
Loan Tenure: ${tenure} ${tenureType === "years" ? "year(s)" : "month(s)"} (${calculation.months} months)

═══════════════════════════════
Monthly EMI: ${currency(calculation.emi)}
═══════════════════════════════

Total Interest: ${currency(calculation.totalInterest)}
Total Payment: ${currency(calculation.totalPayment)}

═══════════════════════════════`;

      await navigator.clipboard.writeText(summaryText);
      toast({
        title: "✓ Copied!",
        description: "Loan summary copied to clipboard",
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">EMI Calculator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Calculate your monthly loan EMI instantly with interest breakdown and repayment schedule.
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
                    <Percent className="h-5 w-5 text-primary" />
                    Loan Details
                  </h2>
                  <p className="text-sm text-muted-foreground">Enter loan information to see results</p>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Loan Amount */}
                  <div className="space-y-4">
                    <label htmlFor="principal" className="text-sm font-semibold text-foreground">
                      Loan Amount <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <input
                        id="principal"
                        ref={principal.inputRef}
                        type="text"
                        value={principal.formattedValue}
                        onChange={principal.onChange}
                        placeholder="5,00,000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="50000"
                      value={principal.rawValue || 0}
                      onChange={(e) => principal.setRawValue(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>₹1 Lakh</span>
                      <span>₹1 Crore</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-4">
                    <label htmlFor="rate" className="text-sm font-semibold text-foreground">
                      Interest Rate (% per annum) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="6.5"
                        step="0.1"
                        className="w-full pl-4 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={rate || 0}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>1%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="tenure" className="text-sm font-semibold text-foreground">
                        Loan Tenure <span className="text-destructive">*</span>
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                          onClick={() => setTenureType("years")}
                          className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
                            tenureType === "years" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Years
                        </button>
                        <button
                          onClick={() => setTenureType("months")}
                          className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
                            tenureType === "months" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Months
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        id="tenure"
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(e.target.value)}
                        placeholder={tenureType === "years" ? "5" : "60"}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <input
                      type="range"
                      min={tenureType === "years" ? 1 : 12}
                      max={tenureType === "years" ? 30 : 360}
                      step={tenureType === "years" ? 1 : 12}
                      value={tenure || 0}
                      onChange={(e) => setTenure(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>{tenureType === "years" ? "1 Yr" : "12 Mo"}</span>
                      <span>30 Yrs</span>
                    </div>
                  </div>

                  {/* Reset */}
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
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Pro Tip</h4>
                  <p className="text-blue-800 text-xs leading-relaxed mt-1">
                    Try different interest rates and tenures to see how they impact your total interest. Even a 0.5% difference can save you lakhs in the long run!
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Results and Schedule */}
            <div className="lg:col-span-7 space-y-8">
              {calculation ? (
                <div className="space-y-8">
                  {/* Summary Card */}
                  <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden" id="emi-summary-print">
                    <div className="p-6 border-b border-slate-800">
                      <h3 className="text-lg font-semibold">Loan Summary</h3>
                      <p className="text-slate-400 text-sm">Monthly repayment breakdown</p>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Monthly EMI</p>
                          <p className="text-4xl font-bold text-white tracking-tight">{currency(calculation.emi)}</p>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 uppercase font-bold text-[10px]">Loan Amount</span>
                            <span className="font-medium">{currency(parseFloat(principal.rawValue))}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 uppercase font-bold text-[10px]">Total Interest</span>
                            <span className="font-medium text-green-400">{currency(calculation.totalInterest)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 uppercase font-bold text-[10px]">Total Payment</span>
                            <span className="font-medium">{currency(calculation.totalPayment)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                        <div className="text-center pb-2 border-b border-slate-700">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Quick Actions</p>
                        </div>
                        <button 
                          onClick={copySummary}
                          className="w-full py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Summary
                        </button>
                        <button 
                          onClick={handleDownloadPdf}
                          className="w-full py-2.5 rounded-lg bg-slate-700 text-white font-medium text-sm hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" ref={summaryRef}>
                    <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">Amortization Schedule</h3>
                        <p className="text-sm text-muted-foreground">Month-wise repayment breakdown</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Tenure</p>
                        <p className="text-sm font-bold text-slate-900">{calculation.months} Months</p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr className="border-b border-slate-200">
                            <th className="py-4 px-6 text-[10px] uppercase font-black text-slate-500 tracking-wider">Month</th>
                            <th className="py-4 px-6 text-[10px] uppercase font-black text-slate-500 tracking-wider text-right">EMI</th>
                            <th className="py-4 px-6 text-[10px] uppercase font-black text-slate-500 tracking-wider text-right">Principal</th>
                            <th className="py-4 px-6 text-[10px] uppercase font-black text-slate-500 tracking-wider text-right">Interest</th>
                            <th className="py-4 px-6 text-[10px] uppercase font-black text-slate-500 tracking-wider text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {calculation.schedule.map((row) => (
                            <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6 text-sm font-medium text-slate-500">#{row.month}</td>
                              <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right">{row.emi.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-6 text-sm text-slate-600 text-right">{row.principal.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-6 text-sm text-slate-600 text-right">{row.interest.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-6 text-sm font-bold text-primary text-right">{row.balance.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Percent className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Calculate Your EMI</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">
                    Enter your loan amount, interest rate, and tenure to see your monthly repayment and amortization schedule.
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
                { title: "GST Calculator", path: "/tools/gst-calculator", description: "Calculate GST for products and services", icon: Percent },
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
                Calculate your monthly loan EMI with a clear breakdown of interest and total payment.
                Ideal for planning home, car, personal, and education loans.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Monthly EMI, total interest, and total payment</li>
                    <li>• Detailed Amortization Schedule (Month-wise)</li>
                    <li>• PDF Export and Print options</li>
                    <li>• Tenure in years or months with sliders</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">What is EMI and how is it calculated?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    EMI is a fixed monthly payment, computed from the loan amount, annual interest rate, and tenure using the standard amortization formula.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Which loans can I use this for?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Use it for home, car, personal, education and other fixed-rate loans.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">What is an Amortization Schedule?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    It is a table that shows how your EMI is split between principal and interest each month, and the remaining balance after each payment.
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
          #emi-summary-print, #emi-summary-print * {
            visibility: visible;
          }
          #emi-summary-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            background: black;
            color: white;
          }
        }
      `}</style>
    </div>
  );
};

export default EMICalculator;
