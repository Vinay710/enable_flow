import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle,
  Clock,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const toolOptions = [
  { label: "Salary Calculator", value: "salary-calculator" },
  { label: "EMI Calculator", value: "emi-calculator" },
  { label: "GST Calculator", value: "gst-calculator" },
  { label: "Invoice Generator", value: "invoice-generator" },
  { label: "Working Days Calculator", value: "working-days" },
  { label: "QR Code Generator", value: "qr-generator" },
  { label: "Pomodoro Timer", value: "pomodoro-timer" },
  { label: "Word Counter", value: "word-counter" },
  { label: "JSON Formatter", value: "json-formatter" },
  { label: "CIDR Calculator", value: "cidr-calculator" },
  { label: "Other", value: "other" },
];

const Contact = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tool, setTool] = useState(toolOptions[0].value);
  const [type, setType] = useState<"feedback" | "feature">("feedback");
  const [requestTool, setRequestTool] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const title = "Contact & Feedback | EnableFlow";
    const description = "Send feedback on current tools or request a new tool. Your submission helps improve EnableFlow.";
    const keywords = "contact,feedback,request tool,support,EnableFlow";
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/contact`;
    document.title = title;
    setMetaDescription(description);
    setMetaKeywords(keywords);
    setCanonicalUrl(canonicalHref);
  }, []);

  const submit = async () => {
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!name || !email || !message) {
      toast({ title: "Missing fields", description: "Please fill name, email, and message.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`https://enableflow.online/api/feedback.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          tool,
          type,
          request_tool: tool === "other" ? requestTool : "",
          message,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Thank you!", description: "Feedback submitted successfully." });
        setName("");
        setEmail("");
        setTool(toolOptions[0].value);
        setType("feedback");
        setRequestTool("");
        setMessage("");
      } else {
        toast({ title: "Submission failed", description: data.error || "Please try again later.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not submit feedback.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-white border-b">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
                Support Center
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                Help us build <br />
                <span className="text-primary italic">the perfect suite.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Found a bug? Need a new feature? Or just want to say hi? Your feedback directly drives our roadmap.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left: Contact Form Card */}
              <div className="lg:col-span-8">
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-white border-b px-8 py-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black text-slate-900">Get in touch</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Response time: Usually within 24 hours.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 lg:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                        <Input 
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Johnson"
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@company.com"
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Related Tool</Label>
                        <Select value={tool} onValueChange={setTool}>
                          <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base font-medium">
                            <SelectValue placeholder="Select a tool" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            {toolOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-3 focus:bg-primary/5 focus:text-primary transition-colors">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Type</Label>
                        <div className="flex p-1.5 bg-slate-50/50 border border-slate-100 rounded-2xl gap-1.5 h-14">
                          <button
                            onClick={() => setType("feedback")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                              type === "feedback" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            <Info className="h-3 w-3" />
                            Feedback
                          </button>
                          <button
                            onClick={() => setType("feature")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                              type === "feature" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            <PlusCircle className="h-3 w-3" />
                            New Feature
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {tool === "other" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-10 space-y-3 overflow-hidden"
                        >
                          <Label htmlFor="requestTool" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requested Tool Name</Label>
                          <Input 
                            id="requestTool"
                            value={requestTool}
                            onChange={(e) => setRequestTool(e.target.value)}
                            placeholder="e.g. Unit Converter"
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base font-medium"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3 mb-12">
                      <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</Label>
                      <Textarea 
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        className="min-h-[200px] p-6 rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base font-medium leading-relaxed resize-none"
                      />
                    </div>

                    <Button 
                      onClick={submit}
                      disabled={submitting}
                      className="h-16 w-full md:w-auto px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                      {submitting ? (
                        <>
                          <Zap className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Quick Help & Info Bento */}
              <div className="lg:col-span-4 space-y-6 sticky top-8">
                {/* Email Bento */}
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                    <Mail className="h-20 w-20" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <Badge className="bg-white/10 text-white border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Direct Access
                    </Badge>
                    <h3 className="text-2xl font-black">Quick Email</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Prefer direct communication? Drop us a line anytime.
                    </p>
                    <div className="pt-4">
                      <a href="mailto:contact@enableflow.online" className="text-primary font-bold text-lg hover:underline transition-all">
                        contact@enableflow.online
                      </a>
                    </div>
                  </div>
                </div>

                {/* FAQ Quick Bento */}
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden p-8">
                  <CardHeader className="p-0 mb-6">
                    <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-primary bg-primary/5 w-fit">
                      Common Queries
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {[
                      { q: "Is it really free?", a: "Yes, 100% free with no hidden charges.", icon: <Sparkles className="h-4 w-4" /> },
                      { q: "How fast is the response?", a: "We aim for under 24 hours on workdays.", icon: <Clock className="h-4 w-4" /> },
                      { q: "Can I request custom tools?", a: "Absolutely. We build for the community.", icon: <HelpCircle className="h-4 w-4" /> },
                    ].map((faq, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <span className="text-primary">{faq.icon}</span>
                          {faq.q}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed ml-6">{faq.a}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Privacy Bento */}
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-emerald-500 text-white p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                    <ShieldCheck className="h-20 w-20" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-bold text-lg">Your data is safe.</h4>
                    <p className="text-emerald-50 text-sm leading-relaxed">
                      All feedback is encrypted and handled with absolute privacy. We never share your email with third parties.
                    </p>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Link to="/about" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Info className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold uppercase">About Us</span>
                    </Button>
                  </Link>
                  <Link to="/" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Layout className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold uppercase">All Tools</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
