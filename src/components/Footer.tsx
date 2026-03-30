import enableflowLogo from "@/assets/enableflow-logo.png";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Heart,
  Globe,
  MessageCircle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { title: "Salary Calculator", path: "/tools/salary-calculator" },
    { title: "EMI Calculator", path: "/tools/emi-calculator" },
    { title: "GST Calculator", path: "/tools/gst-calculator" },
    { title: "Invoice Generator", path: "/tools/invoice-generator" },
    { title: "Working Days", path: "/tools/working-days" },
    { title: "QR Generator", path: "/tools/qr-generator" },
    { title: "Pomodoro Timer", path: "/tools/pomodoro-timer" },
    { title: "Word Counter", path: "/tools/word-counter" },
    { title: "JSON Formatter", path: "/tools/json-formatter" },
    { title: "CIDR Calculator", path: "/tools/cidr-calculator" },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="inline-block transition-transform active:scale-95">
              <img 
                src={enableflowLogo} 
                alt="EnableFlow" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md">
              The professional toolbox for modern workflows. Fast, private, and zero-login utilities designed to keep your work moving.
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:contact@enableflow.online">
                <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 gap-2 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
              </a>
              <div className="flex items-center gap-1">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Github, href: "#", label: "GitHub" },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href} 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-4 py-1.5 font-bold flex w-fit items-center gap-2">
                <ShieldCheck className="h-3 w-3" />
                100% Client-Side Privacy
              </Badge>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              
              {/* Tools Column */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tools Suite</h4>
                <ul className="space-y-4">
                  {toolLinks.slice(0, 5).map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="group flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                        {link.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-0 md:opacity-100">More Tools</h4>
                <ul className="space-y-4">
                  {toolLinks.slice(5).map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="group flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                        {link.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Platform Column */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</h4>
                <ul className="space-y-4">
                  {[
                    { title: "About Us", path: "/about" },
                    { title: "Contact", path: "/contact" },
                    { title: "Privacy Policy", path: "/privacy" },
                    { title: "Terms of Service", path: "/terms" },
                  ].map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Badge variant="outline" className="mt-2 border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest rounded-full">
                      v3.2.0-stable
                    </Badge>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        <Separator className="bg-slate-50" />

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <span>© {currentYear} EnableFlow.</span>
            <span className="hidden md:inline text-slate-200">|</span>
            <span className="flex items-center gap-1.5">
              Made with <Heart className="h-3 w-3 text-rose-400 fill-rose-400" /> for professionals.
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Globe className="h-3 w-3" />
              English (US)
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap className="h-3 w-3 text-primary fill-primary" />
              Server Status: Online
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
