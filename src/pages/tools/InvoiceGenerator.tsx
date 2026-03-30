import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, Percent, IndianRupee, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { InvoiceData } from "@/components/invoice/types";
import html2pdf from "html2pdf.js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppContext } from "@/hooks/useAppContext";

const InvoiceGenerator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const previewRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
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
      invoiceNumber: "INV-001",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
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
        unit: "nos",
        rate: 50000,
        discount: 0,
        gstRate: 18,
      },
    ],
  });

  useEffect(() => {
    const title = "Invoice Generator | EnableFlow";
    const description = "Create professional GST-compliant invoices with HSN/SAC, place of supply, auto tax split, and export to PDF. Fast, free invoice generator for India.";
    setMetaDescription(description);
    const keywords = "invoice generator,GST invoice,HSN,SAC,place of supply,CGST,SGST,IGST,PDF,India";
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
    const faqJson = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is the invoice generator GST-compliant?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. It supports HSN/SAC, place of supply, and auto CGST/SGST/IGST split based on intra/inter-state rules."
          }
        },
        {
          "@type": "Question",
          "name": "Can I add HSN/SAC and tax rates per item?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Set HSN/SAC and GST rate for each line item. Totals are calculated automatically."
          }
        },
        {
          "@type": "Question",
          "name": "How do I export the invoice to PDF?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Click Download PDF to generate a high-quality A4 PDF using your current invoice data."
          }
        },
        {
          "@type": "Question",
          "name": "Do you store my invoice data?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Everything runs in your browser. Data is not sent to any server."
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
  const handleDownloadPdf = () => {
    const element = previewRef.current;
    if (!element) return;

    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number], // No margin to keep full bleed background if any, but we have padding in component
      filename: `Invoice_${invoiceData.details.invoiceNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Invoice Generator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Create professional GST-compliant invoices with HSN/SAC, place of supply, auto tax split, and export to high-quality PDF.
              </p>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Button 
                onClick={handlePrint} 
                variant="outline"
                className="gap-2 bg-white"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button 
                onClick={handleDownloadPdf} 
                className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Form Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="text-xl font-semibold">Invoice Details</h2>
                  <p className="text-sm text-muted-foreground">Fill in the fields to generate your invoice</p>
                </div>
                <div className="p-6 max-h-[calc(100vh-350px)] overflow-y-auto">
                  <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
                </div>
              </div>
            </div>
            
            {/* RIGHT: Preview Section */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-200 rounded-2xl border p-4 md:p-10 flex justify-center items-start min-h-[600px] overflow-auto shadow-inner">
                <div className="scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-[0.8] xl:scale-[0.95] origin-top transform-gpu shadow-2xl bg-white">
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
                    Make sure to double check the <strong>Place of Supply</strong>. It determines whether CGST + SGST or IGST is applied to your invoice.
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
              <h2 className="text-2xl font-bold text-foreground mb-6">About this tool</h2>
              <p className="text-muted-foreground leading-relaxed">
                Create professional invoices compliant with Indian norms including GST, HSN/SAC, place of supply, and amount-in-words.
                Live preview and PDF export make it easy to share and archive billing documents.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Seller/buyer details with GSTIN and bank info</li>
                    <li>• Itemized list with HSN/SAC, GST rate, quantity, price</li>
                    <li>• Auto CGST/SGST/IGST based on place of supply</li>
                    <li>• Editable terms and notes; high-quality PDF export</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Benefits
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Accurate tax compliance for Indian businesses</li>
                    <li>• Faster invoice creation with a user-friendly UI</li>
                    <li>• Professional documents for clients and records</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">Is this GST compliant?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. The tool follows Indian GST norms including HSN/SAC, place of supply and automatic CGST/SGST/IGST calculation.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Can I set tax rate per item?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. Each line item can have its own GST rate and HSN/SAC. The totals are aggregated automatically.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">How do I export to PDF?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Simply use the "Download PDF" button to generate a high-quality A4 document. You can also use the Print button for browser-native printing.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Is my data stored?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    No. Your invoice data stays entirely in your browser. We don't store or send your billing information to any server.
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
