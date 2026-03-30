import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  FileJson, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Activity, 
  Zap, 
  Layout, 
  Trash2, 
  Settings2, 
  Share2, 
  Code, 
  Braces, 
  Info, 
  Maximize2,
  Minimize2,
  FileCode,
  Search,
  AlertCircle,
  Network
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const JSONFormatter = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    const title = "Professional JSON Formatter & Validator | EnableFlow";
    const description = "Advanced real-time JSON formatter, validator, and minifier. Pretty-print complex JSON with instant error detection and node metrics. 100% private.";
    setMetaDescription(description);
    const keywords = "JSON formatter, validate JSON, minify JSON, JSON pretty print, API debugger, JSON analyzer, development tool";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/json-formatter`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    
    const head = document.head;
    const addJsonLd = (json: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.setAttribute("type", "application/ld+json");
      s.textContent = JSON.stringify(json);
      head.appendChild(s);
      return s;
    };

    const s1 = addJsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "JSON Formatter", "item": canonicalHref }
      ]
    });

    return () => {
      s1.remove();
    };
  }, []);

  const stats = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parsed = JSON.parse(input);
      const size = new Blob([input]).size;
      const sizeFormatted = size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} B`;
      
      let nodeCount = 0;
      let maxDepth = 0;
      
      const analyze = (obj: any, depth: number) => {
        nodeCount++;
        maxDepth = Math.max(maxDepth, depth);
        if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach(val => analyze(val, depth + 1));
        }
      };
      
      analyze(parsed, 1);
      
      return {
        size: sizeFormatted,
        nodes: nodeCount,
        depth: maxDepth,
        isValid: true
      };
    } catch (e: any) {
      return {
        isValid: false,
        errorMessage: e.message
      };
    }
  }, [input]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
      toast({ title: "Success", description: "JSON formatted successfully" });
    } catch (e: any) {
      setError(e.message);
      setOutput("");
      toast({ title: "Invalid JSON", description: "Please check your syntax", variant: "destructive" });
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
      toast({ title: "Success", description: "JSON minified successfully" });
    } catch (e: any) {
      setError(e.message);
      setOutput("");
      toast({ title: "Invalid JSON", description: "Please check your syntax", variant: "destructive" });
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({ title: "Copied!", description: "Output copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const downloadJSON = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isZenMode ? 'bg-white' : 'bg-slate-50'}`}>
      {!isZenMode && <Header />}
      
      <main className={`flex-1 ${isZenMode ? 'py-0' : 'py-12'}`}>
        <div className={`container mx-auto px-4 max-w-[1400px] transition-all duration-500 ${isZenMode ? 'max-w-4xl' : ''}`}>
          
          {/* Bento Header */}
          {!isZenMode && (
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Braces className="h-3 w-3" />
                  Dev-Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  JSON Formatter <span className="text-primary">Pro</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-xl">
                  Format, validate, and minify complex JSON structures with instant performance metrics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsZenMode(true)}
                  className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <Maximize2 className="h-4 w-4 mr-2 text-slate-400 group-hover:text-primary transition-colors" />
                  Zen Mode
                </Button>
                <div className="h-10 w-px bg-slate-200 mx-2" />
                <Button 
                  onClick={() => {
                    setInput("");
                    setOutput("");
                    setError("");
                  }}
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  title="Clear All"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${isZenMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8 items-start`}>
            
            {/* LEFT: Editor Workspace */}
            <div className={`${isZenMode ? 'lg:col-span-1' : 'lg:col-span-8'} space-y-6`}>
              <Card className={`border-none shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 ${isZenMode ? 'border-none shadow-none mt-10' : ''}`}>
                <CardHeader className={`bg-white border-b px-8 py-6 flex flex-row items-center justify-between ${isZenMode ? 'border-none bg-transparent' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <FileCode className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Input JSON</CardTitle>
                      {!isZenMode && <CardDescription>100% private. No data is sent to our servers.</CardDescription>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button onClick={handleFormat} size="sm" className="rounded-xl font-bold">
                      Pretty Print
                    </Button>
                    <Button onClick={handleMinify} variant="outline" size="sm" className="rounded-xl font-bold">
                      Minify
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='{"paste": "your", "json": "here"}'
                    className={`w-full p-8 focus:outline-none text-base leading-relaxed text-slate-700 placeholder:text-slate-300 resize-none min-h-[400px] font-mono transition-all duration-500 ${isZenMode ? 'bg-transparent text-lg' : 'bg-white'}`}
                  />
                  
                  {isZenMode && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsZenMode(false)}
                      className="fixed top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Minimize2 className="h-4 w-4 mr-2" /> Exit Zen
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Output Card */}
              <Card className={`border-none shadow-2xl shadow-slate-200/50 overflow-hidden ${isZenMode ? 'hidden' : ''}`}>
                <CardHeader className="bg-slate-50 border-b px-8 py-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layout className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Formatted Output</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {output && (
                      <>
                        <Button variant="ghost" size="sm" onClick={downloadJSON} className="rounded-lg h-8 gap-2">
                          <Download className="h-3 w-3" /> JSON
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="rounded-lg h-8 gap-2">
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-slate-900/5 min-h-[400px]">
                  {error ? (
                    <div className="p-8 flex items-start gap-4 text-rose-500 bg-rose-50/50">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-lg mb-1">Parsing Error</div>
                        <p className="font-mono text-sm leading-relaxed">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <pre className="p-8 font-mono text-sm leading-relaxed text-slate-800 overflow-auto max-h-[600px]">
                      {output || <span className="text-slate-300 italic">Formatted JSON will appear here...</span>}
                    </pre>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Intelligence Panel - Bento Grid Layout */}
            {!isZenMode && (
              <div className="lg:col-span-4 space-y-6 sticky top-8">
                {/* Major Metrics Bento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                      <Code className="h-16 w-16" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-3xl font-black">{stats?.nodes || 0}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Nodes</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                      <Zap className="h-16 w-16" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-3xl font-black text-slate-900">{stats?.size || '0 B'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Payload Size</div>
                    </div>
                  </div>
                </div>

                {/* Structure Analysis Bento */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-primary bg-primary/5">
                        Structure Analysis
                      </Badge>
                      <div className="text-xl font-black text-slate-900">{stats?.depth || 0} Layers</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-500 leading-snug mb-6">
                      Your JSON structure is {stats?.depth || 0} levels deep. {stats?.depth > 10 ? "Consider flattening for better API performance." : "Structure looks optimized."}
                    </div>
                    <Separator className="my-6 opacity-50" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validation Status</span>
                        {stats?.isValid ? (
                          <Badge className="bg-emerald-500 text-white border-none rounded-full">Valid JSON</Badge>
                        ) : (
                          <Badge variant="destructive" className="rounded-full">Invalid Syntax</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Educational Bento */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-primary text-white p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                    <Info className="h-16 w-16" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Did you know?</h4>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                      Minifying JSON can reduce payload size by up to 30%, significantly improving mobile API response times.
                    </p>
                  </div>
                </Card>

                {/* Related Tools Bento */}
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/tools/cidr-calculator" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Network className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold uppercase">CIDR Tool</span>
                    </Button>
                  </Link>
                  <Link to="/tools/qr-generator" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Search className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold uppercase">QR Tool</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* FAQ Section */}
          {!isZenMode && (
            <div className="mt-32 max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="bg-primary/10 text-primary border-none rounded-full mb-4">Resources</Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Understanding JSON Tools</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { 
                    q: "What is Pretty-Printing?", 
                    a: "It's the process of adding indentation and line breaks to raw JSON data. This makes it human-readable and much easier to debug nested structures." 
                  },
                  { 
                    q: "Is my data sent to any server?", 
                    a: "Never. EnableFlow processes all data locally in your browser using JavaScript. Your sensitive JSON data never touches our infrastructure." 
                  },
                  { 
                    q: "Why use Minification?", 
                    a: "Minification removes all unnecessary whitespace and formatting. This reduces the file size for production use, making API transfers faster and cheaper." 
                  },
                  { 
                    q: "How does the validator work?", 
                    a: "We use the browser's native JSON engine to attempt parsing. If it fails, we catch the exception and provide the specific reason for the syntax error." 
                  }
                ].map((faq, i) => (
                  <div key={i} className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                      <span className="flex-none w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">0{i+1}</span>
                      {faq.q}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm ml-11">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {!isZenMode && <Footer />}
    </div>
  );
};

export default JSONFormatter;

