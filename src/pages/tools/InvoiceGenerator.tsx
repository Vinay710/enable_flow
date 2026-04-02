import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Percent, IndianRupee, CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { InvoiceData, Region } from "@/components/invoice/types";
import { generateInvoiceNumber, saveInvoiceData, loadInvoiceData } from "@/components/invoice/utils";
import html2pdf from "html2pdf.js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppContext } from "@/hooks/useAppContext";

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

const InvoiceGenerator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializingRef = useRef(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(INDIA_DEFAULT);
  const [showRegionAlert, setShowRegionAlert] = useState(false);
  const [formMaxWidth, setFormMaxWidth] = useState('calc(50vw - 40px)');

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

  // Handle form container responsive max-width
  useEffect(() => {
    const handleResize = () => {
      setFormMaxWidth(window.innerWidth < 1024 ? 'calc(100vw - 32px)' : 'calc(50vw - 40px)');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitializingRef.current) return;
    saveInvoiceData(invoiceData, invoiceData.details.region);
  }, [invoiceData]);

  // SEO setup
  useEffect(() => {
    const isIndia = invoiceData.details.region === "IN";
    const title = isIndia 
      ? "Invoice Generator | EnableFlow" 
      : "International Invoice Generator | EnableFlow";
    const description = isIndia
      ? "Create professional GST-compliant invoices with HSN/SAC, place of supply, auto tax split, and export to PDF. Fast, free invoice generator for India."
      : "Create professional international invoices with multi-currency support, VAT/Tax handling, and PDF export. Fast invoice generator worldwide.";
    
    setMetaDescription(description);
    const keywords = isIndia
      ? "invoice generator,GST invoice,HSN,SAC,place of supply,CGST,SGST,IGST,PDF,India"
      : "international invoice,multi-currency invoice,VAT invoice,global invoicing";
    setMetaKeywords(keywords);
    
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/invoice-generator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Invoice Generator", "item": canonicalHref }
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
    
    return () => {
      s1.remove();
      s2.remove();
    };
  }, [invoiceData.details.region, setMetaDescription, setMetaKeywords, setCanonicalUrl]);

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

    // Load saved data for the new region or use default
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

  const handleDownloadPdf = () => {
    const element = previewRef.current;
    if (!element) return;

    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: `Invoice_${invoiceData.details.invoiceNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(element).save();
  };



  const isIndia = invoiceData.details.region === "IN";

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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Invoice Generator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Create professional invoices for {isIndia ? "India (GST-compliant)" : "International markets"} with HSN/SAC, auto tax calculation, and PDF export.
              </p>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Button 
                onClick={handleDownloadPdf} 
                className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Region Alert */}
          {showRegionAlert && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Switched to {isIndia ? "India" : "International"} mode. Your previous data for this region has been restored.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Form Section */}
            <div 
              className="lg:col-span-5 space-y-6"
              style={{
                resize: 'both',
                overflow: 'auto',
                minHeight: '600px',
                minWidth: '300px',
                maxWidth: formMaxWidth,
                border: '2px solid rgb(203, 213, 225)',
                borderRadius: '1rem',
                padding: '0',
                backgroundColor: 'transparent',
                position: 'relative'
              }}
            >
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b bg-slate-50/50 flex-shrink-0">
                  <h2 className="text-xl font-semibold">Invoice Details</h2>
                  <p className="text-sm text-muted-foreground">Configure your invoice by selecting region and filling in details</p>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <InvoiceForm 
                    data={{
                      ...invoiceData,
                      details: {
                        ...invoiceData.details,
                        region: invoiceData.details.region,
                      }
                    }} 
                    onChange={(newData) => {
                      // Handle region change
                      if (newData.details.region !== invoiceData.details.region) {
                        handleRegionChange(newData.details.region);
                      } else {
                        setInvoiceData(newData);
                      }
                    }} 
                  />
                </div>
              </div>
              {/* Resize Handle Indicator */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '20px',
                height: '20px',
                cursor: 'nwse-resize',
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, transparent 50%, rgb(100, 116, 139) 50%)',
                borderRadius: '0 0 1rem 0'
              }} />
            </div>
            
            {/* RIGHT: Preview Section */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-200 rounded-2xl border p-2 sm:p-4 md:p-10 flex justify-center items-start min-h-[400px] sm:min-h-[600px] overflow-auto shadow-inner w-full">
                <div className="scale-[0.6] sm:scale-[0.75] md:scale-[0.9] lg:scale-[0.85] xl:scale-[1] origin-top transform-gpu shadow-2xl bg-white">
                  <InvoicePreview data={invoiceData} ref={previewRef} />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Pro Tip</h4>
                  <p className="text-blue-800 text-xs leading-relaxed mt-1">
                    {isIndia 
                      ? "Verify the Place of Supply carefully. It determines whether CGST + SGST or IGST is applied."
                      : "Select the correct Country for your buyer to ensure proper tax compliance."}
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
                { title: "GST Calculator", path: "/tools/gst-calculator", description: "Calculate GST for products and services", icon: Percent },
                { title: "Salary Calculator", path: "/tools/salary-calculator", description: "Calculate monthly take-home salary", icon: IndianRupee },
                { title: "Working Days Calculator", path: "/tools/working-days", description: "Calculate working days between dates", icon: CalendarDays },
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Key Features</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    India (GST)
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• GST-compliant invoicing with GSTIN fields</li>
                    <li>• HSN/SAC codes with multiple tax rates</li>
                    <li>• Auto CGST/SGST/IGST calculation</li>
                    <li>• Place of supply-based tax split</li>
                    <li>• UPI QR code generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    International
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Multi-currency support (USD, EUR, GBP, etc.)</li>
                    <li>• VAT/Sales Tax/GST handling</li>
                    <li>• International invoice types</li>
                    <li>• Country-based billing addresses</li>
                    <li>• Amount in words for any currency</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-foreground">How do I switch between regions?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Use the Region Selector at the top of the form. Your data for each region is automatically saved and restored when you switch.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Can I customize invoice numbers?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. The invoice number auto-increments, but you can edit it manually. Each region maintains its own numbering sequence.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Is my data stored server-side?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    No. All data is stored locally in your browser. We never send or store your billing information on any server.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">What invoice types are supported?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Tax Invoice, Proforma Invoice, Quotation, Credit Note, and Debit Note.
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
