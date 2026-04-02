import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Percent, IndianRupee, CalendarDays, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { InvoiceData, Region } from "@/components/invoice/types";
import { generateInvoiceNumber, saveInvoiceData, loadInvoiceData } from "@/components/invoice/utils";
import html2pdf from "html2pdf.js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppContext } from "@/hooks/useAppContext";

/**
 * Default invoice data for the India region (GST-compliant).
 */
const INDIA_DEFAULT: InvoiceData = {
  seller: {
    name: "Your Company Name",
    address: "123 Business Park, Main Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    gstin: "27AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    email: "billing@company.com",
    phone: "+91 9876543210",
    bankDetails: {
      bankName: "HDFC Bank",
      accountName: "Your Company Name",
      accountNumber: "1234567890",
      ifscCode: "HDFC0001234",
      branch: "Mumbai Main Branch",
      upiId: "company@upi",
    },
  },
  buyer: {
    name: "Client Name",
    companyName: "Client Company Ltd",
    address: "456 Client Street",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    gstin: "27BBBBB0000B1Z5",
    placeOfSupply: "Maharashtra",
  },
  details: {
    invoiceNumber: "INV-0001",
    invoiceType: "Tax Invoice",
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    region: "IN",
    currency: "INR",
    termsAndConditions:
      "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within the due date.\n3. Subject to local jurisdiction.",
    notes: "Thank you for your business!",
    reverseCharge: false,
    roundOff: true,
  },
  items: [
    {
      id: "1",
      description: "Web Development Services",
      hsn: "998314",
      quantity: 1,
      unit: "",
      rate: 50000,
      discount: 0,
      gstRate: 18,
    },
  ],
};

/**
 * Default invoice data for International regions.
 */
const INTERNATIONAL_DEFAULT: InvoiceData = {
  seller: {
    name: "Your Company Name",
    address: "123 Business Park, Main Street",
    city: "New York",
    country: "United States",
    postalCode: "10001",
    vatNumber: "VAT-XXXXXXXXXX",
    companyRegistration: "COMP-REG-NUMBER",
    email: "billing@company.com",
    phone: "+1 234 567 8900",
    bankDetails: {
      bankName: "Chase Bank",
      accountName: "Your Company Name",
      accountNumber: "4111111111111111",
      ifscCode: "CHUSUS33",
      branch: "New York Branch",
    },
  },
  buyer: {
    name: "Client Name",
    companyName: "International Client Ltd",
    address: "456 Business Avenue",
    city: "London",
    country: "United Kingdom",
    postalCode: "SW1A 1AA",
    vatNumber: "GB-XXXXXXXXXX",
    companyRegistration: "INTL-REG-NUMBER",
  },
  details: {
    invoiceNumber: "INV-0001",
    invoiceType: "Tax Invoice",
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    region: "INTL",
    currency: "USD",
    taxType: "VAT",
    termsAndConditions:
      "1. Payment terms: Net 30 days from invoice date.\n2. Bank charges are borne by the buyer.\n3. All disputes subject to jurisdiction of New York.",
    notes: "Thank you for your business!",
    reverseCharge: false,
    roundOff: true,
  },
  items: [
    {
      id: "1",
      description: "Consulting Services",
      sku: "CONS-001",
      quantity: 10,
      unit: "",
      rate: 150,
      discount: 0,
      taxRate: 20,
    },
  ],
};

/**
 * InvoiceGenerator component is the main tool for creating and exporting professional invoices.
 * It features a split layout with a real-time form and a live preview.
 * Data is automatically saved to the browser's localStorage for persistence.
 * 
 * @component
 */
const InvoiceGenerator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializingRef = useRef(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(INDIA_DEFAULT);
  const [showRegionAlert, setShowRegionAlert] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    isInitializingRef.current = true;
    try {
      const savedData = loadInvoiceData("IN");
      if (savedData) {
        try {
          setInvoiceData({
            ...savedData,
            details: {
              ...savedData.details,
              invoiceDate: new Date(savedData.details.invoiceDate),
              dueDate: new Date(savedData.details.dueDate),
            },
          });
        } catch (error) {
          console.error("Failed to load saved invoice data:", error);
        }
      }
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitializingRef.current) return;
    saveInvoiceData(invoiceData, invoiceData.details.region);
  }, [invoiceData]);

  // SEO and Page Metadata setup
  useEffect(() => {
    const isIndia = invoiceData.details.region === "IN";
    const title = isIndia 
      ? "Free GST Invoice Generator | EnableFlow" 
      : "International Invoice Generator | Multi-Currency | EnableFlow";
    const description = isIndia
      ? "Create professional GST-compliant invoices with HSN/SAC, auto tax split, and export to PDF. Fast, free, and secure invoice generator for Indian businesses."
      : "Create professional international invoices with multi-currency support, VAT/Tax handling, and high-quality PDF export. Fast global invoice generator.";
    
    setMetaDescription(description);
    const keywords = isIndia
      ? "invoice generator,GST invoice,HSN,SAC,place of supply,CGST,SGST,IGST,PDF,India,business tools"
      : "international invoice,multi-currency invoice,VAT invoice,global invoicing,PDF export,freelance tools";
    setMetaKeywords(keywords);
    
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/invoice-generator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    
    // JSON-LD Schema for SEO
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Tools", "item": `${origin}/tools` },
        { "@type": "ListItem", "position": 3, "name": "Invoice Generator", "item": canonicalHref }
      ]
    };
    
    const addJsonLd = (json: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.setAttribute("type", "application/ld+json");
      s.textContent = JSON.stringify(json);
      head.appendChild(s);
      return s;
    };
    
    const s1 = addJsonLd(breadcrumbJson);
    
    return () => {
      s1.remove();
    };
  }, [invoiceData.details.region, setMetaDescription, setMetaKeywords, setCanonicalUrl]);

  /**
   * Handles region switching between India and International.
   * Loads saved data for the target region or uses defaults.
   */
  const handleRegionChange = (newRegion: Region) => {
    if (newRegion === invoiceData.details.region) return;

    setShowRegionAlert(true);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => {
      setShowRegionAlert(false);
      alertTimeoutRef.current = null;
    }, 3000);

    const savedData = loadInvoiceData(newRegion);
    const defaultData = newRegion === "IN" ? INDIA_DEFAULT : INTERNATIONAL_DEFAULT;

    if (savedData) {
      try {
        setInvoiceData({
          ...savedData,
          details: {
            ...savedData.details,
            invoiceNumber: generateInvoiceNumber(newRegion),
            invoiceDate: new Date(savedData.details.invoiceDate),
            dueDate: new Date(savedData.details.dueDate),
          },
        });
      } catch (error) {
        console.error("Failed to load region data:", error);
        setInvoiceData({
          ...defaultData,
          details: {
            ...defaultData.details,
            invoiceNumber: generateInvoiceNumber(newRegion),
          },
        });
      }
    } else {
      setInvoiceData({
        ...defaultData,
        details: {
          ...defaultData.details,
          invoiceNumber: generateInvoiceNumber(newRegion),
        },
      });
    }
  };

  /**
   * Generates and downloads the invoice as a PDF using html2pdf.js.
   * Optimizes the element for high-quality export.
   */
  const handleDownloadPdf = async () => {
    const element = previewRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);
    
    try {
      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `Invoice_${invoiceData.details.invoiceNumber}.pdf`,
        image: { type: "jpeg" as const, quality: 1.0 },
        html2canvas: { 
          scale: 3, // High scale for better resolution
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: "mm" as const, 
          format: "a4" as const, 
          orientation: "portrait" as const,
          compress: true
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const isIndia = invoiceData.details.region === "IN";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-1 py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-[1440px]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <FileText className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Invoice Generator</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {isIndia ? "GST-compliant invoices for Indian businesses" : "Professional international multi-currency invoices"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isDownloading}
                className="h-11 px-6 gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Region Change Notification */}
          {showRegionAlert && (
            <Alert className="mb-6 border-blue-100 bg-blue-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 font-medium">
                Switched to {isIndia ? "India (GST)" : "International"} mode. Settings updated successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Configuration Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b bg-slate-50/30">
                  <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Configure your document</p>
                </div>
                <div className="p-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                  <InvoiceForm 
                    data={invoiceData} 
                    onChange={(newData) => {
                      if (newData.details.region !== invoiceData.details.region) {
                        handleRegionChange(newData.details.region);
                      } else {
                        setInvoiceData(newData);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            {/* RIGHT: Live Preview */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-900/5 rounded-[2rem] border-2 border-dashed border-slate-200 p-4 md:p-8 flex justify-center items-start min-h-[600px] overflow-auto shadow-inner">
                <div className="scale-[0.5] sm:scale-[0.65] md:scale-[0.8] lg:scale-[0.75] xl:scale-[0.95] origin-top transform-gpu transition-transform duration-300 ease-out">
                  <InvoicePreview data={invoiceData} ref={previewRef} />
                </div>
              </div>
              
              {/* UI/UX Hint Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-white rounded-xl text-primary shadow-sm shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Pro Tip for better visibility</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mt-1">
                    {isIndia 
                      ? "The 'Place of Supply' automatically determines tax distribution (CGST/SGST vs IGST). Ensure it matches the buyer's state for accuracy."
                      : "International invoices support multiple currencies. Use the currency selector in 'Invoice Settings' to update all rates automatically."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Tools Section */}
          <section className="py-16 mt-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Business Essentials</h3>
                <p className="text-slate-500 text-sm mt-1">Other tools to help grow your business</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "GST Calculator", path: "/tools/gst-calculator", description: "Quickly calculate GST components for any amount", icon: Percent, color: "text-blue-500" },
                { title: "Salary Calculator", path: "/tools/salary-calculator", description: "Estimate take-home pay after tax deductions", icon: IndianRupee, color: "text-green-500" },
                { title: "Working Days", path: "/tools/working-days", description: "Calculate duration between dates excluding holidays", icon: CalendarDays, color: "text-purple-500" },
              ].map((t) => (
                <Link key={t.title} to={t.path} className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                      <t.icon className={`h-6 w-6 ${t.color} group-hover:text-primary transition-colors`} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{t.title}</div>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                      <div className="text-xs font-bold text-primary mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        Try Tool <ArrowLeft className="h-3 w-3 rotate-180" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Knowledge Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <section className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Compliance Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Indian GST
                  </h3>
                  <ul className="mt-4 space-y-3 text-slate-600 text-sm">
                    <li className="flex gap-2"><span>•</span> <span>HSN/SAC code support</span></li>
                    <li className="flex gap-2"><span>•</span> <span>Auto CGST/SGST/IGST</span></li>
                    <li className="flex gap-2"><span>•</span> <span>UPI QR code for payments</span></li>
                    <li className="flex gap-2"><span>•</span> <span>GSTIN verification fields</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Global Ready
                  </h3>
                  <ul className="mt-4 space-y-3 text-slate-600 text-sm">
                    <li className="flex gap-2"><span>•</span> <span>Multi-currency handling</span></li>
                    <li className="flex gap-2"><span>•</span> <span>VAT/Sales Tax compliance</span></li>
                    <li className="flex gap-2"><span>•</span> <span>Custom tax labels</span></li>
                    <li className="flex gap-2"><span>•</span> <span>Global date formats</span></li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Frequently Asked</h2>
              <div className="space-y-8">
                <div className="group">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Is my data secure?</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Yes. We use client-side storage only. Your billing information never leaves your browser and is never stored on our servers.
                  </p>
                </div>
                <div className="group">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">How do I change the logo?</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Simply click on the logo upload section in the 'Seller Details' tab. You can upload any PNG or JPG file.
                  </p>
                </div>
                <div className="group">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Can I use this for free?</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Absolutely. EnableFlow's Invoice Generator is completely free to use for businesses and freelancers worldwide.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-preview, #invoice-preview * {
            visibility: visible;
          }
          #invoice-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;
