import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowLeft, QrCode, Copy, Download, RotateCcw, Upload, Image as ImageIcon, CheckCircle2, Info, ExternalLink, Timer, History as HistoryIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";

const QRCodeGenerator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  useEffect(() => {
    const title = "QR Code Generator | EnableFlow";
    const description = "Generate professional QR codes for URLs and text with custom colors, size, and center logo. High-quality PNG and SVG downloads for branding.";
    setMetaDescription(description);
    const keywords = "QR code generator,QR code PNG,QR code SVG,logo overlay,custom colors,scan,URL QR,branding tools";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/qr-generator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "QR Code Generator", "item": canonicalHref }
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
          "name": "What can I encode in the QR code?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can encode URLs, plain text, email addresses, and contact details. URLs are most common for marketing purposes."
          }
        },
        {
          "@type": "Question",
          "name": "How does the logo embedding work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The tool places your logo in the center. We recommend keeping logo size under 25% to ensure the QR code remains scannable."
          }
        },
        {
          "@type": "Question",
          "name": "Which formats are best for printing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For high-quality printing, SVG is recommended as it is a vector format. PNG is ideal for web and digital use."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data private?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. All QR generation happens locally in your browser. Your data and logos are never uploaded to any server."
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
  const [data, setData] = useState<string>("https://enableflow.online");
  const [foregroundColor, setForegroundColor] = useState<string>("#0f172a");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [qrSize, setQrSize] = useState<number>(300);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(20);
  const [logoPadding, setLogoPadding] = useState<number>(4);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code with logo
  useEffect(() => {
    const generateAsync = async () => {
      if (!qrCanvasRef.current) return;

      try {
        // Generate QR code on hidden canvas
        await QRCode.toCanvas(qrCanvasRef.current, data, {
          width: qrSize,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: 'H' // High error correction for logo support
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = qrSize;
        canvas.height = qrSize;

        // Fill background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, qrSize, qrSize);

        // Draw QR code
        ctx.drawImage(qrCanvasRef.current, 0, 0, qrSize, qrSize);

        // If there's a logo, draw it
        if (logoImage) {
          const img = new Image();
          img.onload = () => {
            const logoPixelSize = (qrSize * logoSize) / 100;
            const logoX = (qrSize - logoPixelSize) / 2;
            const logoY = (qrSize - logoPixelSize) / 2;

            // Draw background for logo with padding
            if (logoPadding > 0) {
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(
                logoX - logoPadding,
                logoY - logoPadding,
                logoPixelSize + logoPadding * 2,
                logoPixelSize + logoPadding * 2
              );
            }

            // Draw logo
            ctx.drawImage(img, logoX, logoY, logoPixelSize, logoPixelSize);
          };
          img.src = logoImage;
        }
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };

    generateAsync();
  }, [data, foregroundColor, backgroundColor, qrSize, logoImage, logoSize, logoPadding]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a logo smaller than 2MB.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
        toast({
          title: "Logo Uploaded",
          description: "Your logo has been added to the QR code."
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = (format: "png" | "svg") => {
    if (!canvasRef.current) return;

    if (format === "png") {
      const link = document.createElement("a");
      link.download = `QR_Code_${new Date().getTime()}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    } else {
      const size = qrSize;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
        <image href="${canvasRef.current.toDataURL('image/png')}" width="${size}" height="${size}"/>
      </svg>`;

      const link = document.createElement("a");
      link.download = `QR_Code_${new Date().getTime()}.svg`;
      link.href = "data:image/svg+xml;base64," + btoa(svg);
      link.click();
    }
    
    toast({
      title: "✓ Downloaded!",
      description: `QR code saved as ${format.toUpperCase()}`,
      duration: 2000,
    });
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => resolve(blob!), "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      toast({
        title: "✓ Copied!",
        description: "QR code image copied to clipboard",
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

  const reset = () => {
    setData("https://enableflow.online");
    setForegroundColor("#0f172a");
    setBackgroundColor("#ffffff");
    setQrSize(300);
    setLogoImage(null);
    setLogoSize(20);
    setLogoPadding(4);
    toast({
      title: "Settings Reset",
      description: "All parameters have been set to default."
    });
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">QR Code Generator</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Create high-quality, professional QR codes for your business. Customize colors, add your brand logo, and download in vector or raster formats.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Configuration */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    QR Configuration
                  </h2>
                  <p className="text-sm text-muted-foreground">Adjust settings to customize your QR code</p>
                </div>

                <div className="p-6 space-y-8">
                  {/* Data Input */}
                  <div className="space-y-3">
                    <Label htmlFor="qrData" className="text-sm font-semibold">Content (URL or Text) <span className="text-destructive">*</span></Label>
                    <textarea
                      id="qrData"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      placeholder="https://enableflow.online"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] text-sm"
                    />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">QR Color</Label>
                      <div className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-xl bg-slate-50">
                        <input
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{foregroundColor}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Background</Label>
                      <div className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-xl bg-slate-50">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{backgroundColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Size Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">QR Size</Label>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{qrSize}x{qrSize} px</span>
                    </div>
                    <Slider
                      value={[qrSize]}
                      onValueChange={(v) => setQrSize(v[0])}
                      min={200}
                      max={600}
                      step={10}
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>200px</span>
                      <span>600px</span>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                        Brand Logo
                      </Label>
                      {logoImage && (
                        <button onClick={() => setLogoImage(null)} className="text-[10px] uppercase font-bold text-destructive hover:underline">
                          Remove Logo
                        </button>
                      )}
                    </div>
                    
                    {!logoImage ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary/30 cursor-pointer transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-slate-300 group-hover:text-primary transition-colors" />
                          <p className="text-xs font-medium text-slate-500">Upload SVG, PNG, or JPG</p>
                          <p className="text-[10px] text-slate-400 mt-1">Max 2MB</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                            <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">Logo detected</p>
                            <p className="text-xs text-slate-500">Adjust size and padding below</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold">Logo Size</Label>
                            <span className="text-[10px] font-bold text-slate-500">{logoSize}%</span>
                          </div>
                          <Slider value={[logoSize]} onValueChange={(v) => setLogoSize(v[0])} min={10} max={30} step={1} />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold">Logo Padding</Label>
                            <span className="text-[10px] font-bold text-slate-500">{logoPadding}px</span>
                          </div>
                          <Slider value={[logoPadding]} onValueChange={(v) => setLogoPadding(v[0])} min={0} max={10} step={1} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={reset}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Pro Tip</h4>
                  <p className="text-blue-800 text-xs leading-relaxed mt-1">
                    Always use a high-contrast color for the QR code (dark on light) to ensure reliable scanning across all devices.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Preview & Download */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <p className="text-slate-400 text-sm">Real-time QR generation</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ready to scan</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col items-center space-y-8">
                  {/* QR Display */}
                  <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group transition-all">
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl z-10 backdrop-blur-[1px]">
                      <div className="bg-white shadow-xl rounded-2xl p-4 flex flex-col items-center gap-2">
                        <QrCode className="h-6 w-6 text-primary" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Instant Preview</span>
                      </div>
                    </div>
                    
                    <div className="relative z-0">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        style={{ width: "100%", height: "auto" }}
                      />
                      {/* Hidden QR canvas used for generation */}
                      <canvas ref={qrCanvasRef} className="hidden" />
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Error Correction</p>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        High (Level H)
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Logo Safe</span>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Dimensions</p>
                      <p className="text-sm font-semibold text-slate-900">{qrSize} x {qrSize} px</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={() => downloadQRCode("png")}
                        className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PNG
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadQRCode("svg")}
                        className="h-12 border-slate-200 hover:bg-slate-50 rounded-xl transition-all active:scale-[0.98]"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download SVG
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="w-full h-12 text-slate-600 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Image to Clipboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools Section */}
          <section className="py-16 mt-10">
            <h3 className="text-2xl font-bold mb-8 tracking-tight">Related Productivity Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Salary Calculator", path: "/tools/salary-calculator", description: "Calculate monthly take-home salary", icon: HistoryIcon },
                { title: "EMI Calculator", path: "/tools/emi-calculator", description: "Calculate monthly loan repayment", icon: Timer },
                { title: "GST Calculator", path: "/tools/gst-calculator", description: "Calculate Indian tax splits instantly", icon: QrCode },
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
                Generate high-resolution, scannable QR codes for marketing, business cards, and digital assets. 
                Our generator uses high error correction (Level H) to ensure your codes remain readable even with an embedded brand logo.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                    <li>• Custom branding with logo embedding</li>
                    <li>• Vector (SVG) and Raster (PNG) export options</li>
                    <li>• Fully customizable color palette</li>
                    <li>• 100% browser-side generation for privacy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">What can I encode in the QR code?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    You can encode URLs, plain text, email addresses, and contact details. URLs are most common for marketing purposes.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">How does the logo embedding work?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    The tool places your logo in the center. We recommend keeping logo size under 25% to ensure the QR code remains scannable.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Which formats are best for printing?</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    For high-quality printing, SVG is recommended as it is a vector format. PNG is ideal for web and digital use.
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

export default QRCodeGenerator;

