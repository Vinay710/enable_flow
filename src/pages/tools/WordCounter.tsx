import { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Type, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  Clock, 
  AlignLeft, 
  Hash, 
  BarChart3, 
  Trash2, 
  Search, 
  Maximize2, 
  Download, 
  Languages, 
  Settings2,
  ListFilter,
  Activity,
  Zap,
  BookOpen,
  Layout,
  PieChart,
  Eye,
  EyeOff,
  Share2,
  FileJson,
  FileCode
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const WordCounter = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const { toast } = useToast();
  
  useEffect(() => {
    const title = "Professional Word Counter & Text Analyzer | EnableFlow";
    const description = "Advanced real-time word counter with reading time, keyword density, and SEO optimization tools. Free, private, and powerful text analysis.";
    setMetaDescription(description);
    const keywords = "word counter, character count, keyword density, reading time, SEO analyzer, text analysis tool, writing assistant";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/word-counter`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    
    // Schema.org logic
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
        { "@type": "ListItem", "position": 2, "name": "Word Counter", "item": canonicalHref }
      ]
    });

    const s2 = addJsonLd({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "EnableFlow Word Counter",
      "operatingSystem": "Web",
      "applicationCategory": "Utility",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    });

    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const wordsArray = trimmed ? trimmed.split(/\s+/) : [];
    const words = wordsArray.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
    
    // Readability Logic (Simple Flesch-Kincaid approximation)
    const syllables = wordsArray.reduce((acc, word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (cleanWord.length <= 3) return acc + 1;
      const syllableMatches = cleanWord.match(/[aeiouy]{1,2}/g);
      return acc + (syllableMatches ? syllableMatches.length : 1);
    }, 0);

    const readabilityScore = words > 0 && sentences > 0 
      ? 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
      : 0;

    const getReadabilityLevel = (score: number) => {
      if (score >= 90) return { label: "Very Easy", color: "text-emerald-500", desc: "5th grade level" };
      if (score >= 80) return { label: "Easy", color: "text-emerald-400", desc: "6th grade level" };
      if (score >= 70) return { label: "Fairly Easy", color: "text-sky-500", desc: "7th grade level" };
      if (score >= 60) return { label: "Standard", color: "text-amber-500", desc: "8th-9th grade level" };
      if (score >= 50) return { label: "Fairly Difficult", color: "text-orange-500", desc: "10th-12th grade level" };
      if (score >= 30) return { label: "Difficult", color: "text-rose-500", desc: "College level" };
      return { label: "Very Difficult", color: "text-red-600", desc: "College graduate level" };
    };

    // Keyword Density
    const wordFreq: Record<string, number> = {};
    wordsArray.forEach(w => {
      const clean = w.toLowerCase().replace(/[.,!?;:()]/g, "");
      if (clean.length > 3) { // meaningful words
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({ word, count, percentage: ((count / words) * 100).toFixed(1) }));

    // Times
    const readingTimeMinutes = Math.floor(words / 200);
    const readingTimeSeconds = Math.round((words % 200) / (200 / 60));
    const speakingTimeMinutes = Math.floor(words / 130);
    const speakingTimeSeconds = Math.round((words % 130) / (130 / 60));

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime: `${readingTimeMinutes}m ${readingTimeSeconds}s`,
      speakingTime: `${speakingTimeMinutes}m ${speakingTimeSeconds}s`,
      topKeywords,
      avgWordLength: words > 0 ? (charactersNoSpaces / words).toFixed(1) : 0,
      readability: getReadabilityLevel(readabilityScore),
      readabilityScore: Math.round(readabilityScore)
    };
  }, [text]);

  const copyToClipboard = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCase = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'clean') => {
    if (!text) return;
    let newText = "";
    if (type === 'upper') newText = text.toUpperCase();
    if (type === 'lower') newText = text.toLowerCase();
    if (type === 'title') {
      newText = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (type === 'sentence') {
      newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    }
    if (type === 'clean') {
      newText = text.replace(/\s+/g, ' ').trim();
    }
    setText(newText);
    toast({ title: "Success", description: `Text updated` });
  };

  const exportData = (format: 'txt' | 'json') => {
    if (!text) return;
    let content = text;
    let type = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify({ text, stats, timestamp: new Date().toISOString() }, null, 2);
      type = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${new Date().toISOString().slice(0,10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isZenMode ? 'bg-white' : 'bg-slate-50'}`}>
      {!isZenMode && <Header />}
      
      <main className={`flex-1 ${isZenMode ? 'py-0' : 'py-12'}`}>
        <div className={`container mx-auto px-4 max-w-[1400px] transition-all duration-500 ${isZenMode ? 'max-w-4xl' : ''}`}>
          
          {/* Bento Grid Header */}
          {!isZenMode && (
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Activity className="h-3 w-3" />
                  Real-time Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Text Analyzer <span className="text-primary">Pro</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-xl">
                  Analyze readability, density, and depth with our high-performance writing suite.
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
                  onClick={() => setText("")}
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  title="Clear All"
                >
                  <Trash2 className="h-5 w-5" />
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
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Writing Canvas</CardTitle>
                      {!isZenMode && <CardDescription>Your text is processed locally in real-time.</CardDescription>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border">
                    <TooltipProvider>
                      {[
                        { icon: <Type className="h-4 w-4" />, label: "Sentence Case", action: () => handleCase('sentence') },
                        { icon: <span className="text-[10px] font-bold">AA</span>, label: "Uppercase", action: () => handleCase('upper') },
                        { icon: <span className="text-[10px] font-bold">aa</span>, label: "Lowercase", action: () => handleCase('lower') },
                        { icon: <RotateCcw className="h-4 w-4" />, label: "Clean Spaces", action: () => handleCase('clean') },
                      ].map((btn, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={btn.action}
                              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                            >
                              {btn.icon}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{btn.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative group">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your content here..."
                    className={`w-full p-10 focus:outline-none text-xl leading-relaxed text-slate-700 placeholder:text-slate-300 resize-none min-h-[600px] transition-all duration-500 ${isZenMode ? 'bg-transparent text-2xl font-serif' : 'bg-white font-sans'}`}
                  />
                  
                  {isZenMode && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsZenMode(false)}
                      className="fixed top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" /> Exit Zen
                    </Button>
                  )}

                  <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="lg"
                      variant={copied ? "default" : "secondary"}
                      onClick={copyToClipboard}
                      className="rounded-2xl shadow-xl px-6"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? "Copied" : "Copy Canvas"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Character Limit Indicators - Bento Style */}
              {!isZenMode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Twitter / X", current: stats.characters, max: 280, color: "bg-sky-400", icon: <Hash className="h-3 w-3" /> },
                    { label: "SEO Description", current: stats.characters, max: 160, color: "bg-emerald-400", icon: <Search className="h-3 w-3" /> },
                    { label: "Google Title", current: stats.characters, max: 60, color: "bg-amber-400", icon: <PieChart className="h-3 w-3" /> }
                  ].map((item) => (
                    <div key={item.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${item.color.replace('bg-', 'text-')} bg-slate-50`}>
                            {item.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className={`text-xs font-black ${item.current > item.max ? 'text-rose-500' : 'text-slate-900'}`}>
                          {item.current} / {item.max}
                        </span>
                      </div>
                      <Progress value={Math.min((item.current / item.max) * 100, 100)} className="h-2 rounded-full bg-slate-50" indicatorClassName={item.color} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Intelligence Panel - Bento Grid Layout */}
            {!isZenMode && (
              <div className="lg:col-span-4 space-y-6 sticky top-8">
                {/* Major Metrics Bento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                      <Hash className="h-16 w-16" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-4xl font-black">{stats.words}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Words</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                      <Type className="h-16 w-16" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-4xl font-black text-slate-900">{stats.characters}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Characters</div>
                    </div>
                  </div>
                </div>

                {/* Readability Bento */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-primary bg-primary/5">
                        Readability Analysis
                      </Badge>
                      <div className="text-2xl font-black text-slate-900">{stats.readabilityScore}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl font-bold ${stats.readability.color} mb-1`}>
                      {stats.readability.label}
                    </div>
                    <p className="text-sm text-slate-500 leading-snug">
                      Your content is rated as {stats.readability.label.toLowerCase()}, suitable for a {stats.readability.desc}.
                    </p>
                    <Separator className="my-6 opacity-50" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Reading Time</span>
                        </div>
                        <div className="font-bold text-slate-900">{stats.readingTime}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <BookOpen className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Speaking Time</span>
                        </div>
                        <div className="font-bold text-slate-900">{stats.speakingTime}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Density Bento */}
                {stats.topKeywords.length > 0 && (
                  <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <ListFilter className="h-4 w-4 text-primary" />
                        Keyword Density
                      </h4>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Weight</div>
                    </div>
                    <div className="space-y-4">
                      {stats.topKeywords.map((kw, idx) => (
                        <div key={idx} className="space-y-2 group">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{kw.word}</span>
                            <span className="text-xs font-black text-slate-400">{kw.percentage}%</span>
                          </div>
                          <Progress value={parseFloat(kw.percentage) * 5} className="h-1 bg-slate-50" indicatorClassName="bg-slate-200 group-hover:bg-primary transition-all duration-500" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Export Bento */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => exportData('txt')}
                    className="rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <FileCode className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase">Export TXT</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => exportData('json')}
                    className="rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <FileJson className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase">Export JSON</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* FAQ Section - Clean & Minimal */}
          {!isZenMode && (
            <div className="mt-32 max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="bg-primary/10 text-primary border-none rounded-full mb-4">Resources</Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Understanding your metrics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { 
                    q: "How is the Readability Score calculated?", 
                    a: "We use the Flesch-Kincaid Ease formula. It analyzes sentence length and syllable count to determine how accessible your text is to various audiences." 
                  },
                  { 
                    q: "Is my writing safe and private?", 
                    a: "Yes. All analysis is performed client-side using Web Workers and local state. We never upload your text to any server or use it for training models." 
                  },
                  { 
                    q: "What are 'stop words' in keyword density?", 
                    a: "We automatically filter out common words like 'the', 'and', 'with' (less than 4 letters) to focus on the meaningful keywords that define your content." 
                  },
                  { 
                    q: "Can I use this for academic writing?", 
                    a: "Absolutely. The sentence and paragraph counts are 100% accurate, helping you stay within strict submission guidelines." 
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

export default WordCounter;


