import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  MousePointer2, 
  ArrowRight, 
  Sparkles,
  Globe,
  Code,
  Heart,
  MessageCircle,
  Activity,
  Layout,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

const About = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  
  useEffect(() => {
    document.title = "About EnableFlow | Precision Productivity Tools";
    const origin = window.location.origin || "";
    setMetaDescription("EnableFlow provides professional-grade, no-login productivity tools. From finance calculators to dev utilities, explore our privacy-first suite designed for speed.");
    setMetaKeywords("EnableFlow, about us, productivity mission, privacy tools, professional utilities");
    setCanonicalUrl(`${origin}/about`);
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: "Privacy First",
      desc: "All calculations happen entirely in your browser. No data is ever sent to our servers.",
      color: "bg-emerald-50"
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "Instant Speed",
      desc: "Zero login, zero loading screens. Tools are ready to work the moment you open them.",
      color: "bg-amber-50"
    },
    {
      icon: <MousePointer2 className="h-6 w-6 text-blue-500" />,
      title: "Simple UI",
      desc: "Clean, professional layouts focused on utility. No clutter, no ads, just work.",
      color: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-white border-b">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
                Our Mission
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                Tools built for <br />
                <span className="text-primary italic">clarity & speed.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                EnableFlow is a suite of professional-grade utilities designed to remove friction from your workday. No signups, no tracking—just pure utility.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Value Propositions Bento */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardContent className="p-10 space-y-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", feature.color)}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">{feature.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
            <Activity className="h-96 w-96" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <Badge className="bg-primary text-slate-900 border-none rounded-full px-4 py-1 font-bold uppercase tracking-widest text-[10px]">
                  Why we exist
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Crafting the <br />
                  <span className="text-primary italic">Ultimate Toolbox</span> <br />
                  for Modern Professionals.
                </h2>
                <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                  <p>
                    We believe the best tools are the ones that get out of your way. Most online utilities are cluttered with ads, cookie banners, and mandatory signups.
                  </p>
                  <p>
                    EnableFlow was built to be different. It's a "tool-first" platform where functionality takes center stage. Whether you're calculating a complex salary breakdown or validating a JSON payload, our tools are optimized for accuracy and developer-grade precision.
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">100%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Client-side</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">Zero</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ad Tracking</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-white">Free</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Forever</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-4 pt-12">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <Globe className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-bold text-white mb-2">Global Standards</h4>
                    <p className="text-sm text-slate-500">Optimized for international workflows and local regulations.</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <Star className="h-8 w-8 text-amber-400 mb-4" />
                    <h4 className="font-bold text-white mb-2">Premium Experience</h4>
                    <p className="text-sm text-slate-500">SaaS-level UI for free public utilities.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <Code className="h-8 w-8 text-sky-400 mb-4" />
                    <h4 className="font-bold text-white mb-2">Open Logic</h4>
                    <p className="text-sm text-slate-500">Transparent algorithms focused on mathematical accuracy.</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <Heart className="h-8 w-8 text-rose-400 mb-4" />
                    <h4 className="font-bold text-white mb-2">User Centric</h4>
                    <p className="text-sm text-slate-500">Every feature is driven by real professional feedback.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tools Explorer Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Quick Access
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Explore the Suite</h2>
              </div>
              <Link to="/#tools">
                <Button variant="ghost" className="font-bold group gap-2 text-primary hover:text-primary hover:bg-primary/5">
                  View all tools <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.slice(0, 6).map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={tool.path}>
                    <Card className="group border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-[2rem] p-6 bg-white overflow-hidden relative">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all border border-slate-100 group-hover:border-primary/20">
                          <tool.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{tool.title}</h4>
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{tool.category}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </div>
                      <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <tool.icon className="h-20 w-20" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-white border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-[3rem] bg-slate-50 p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 p-8 opacity-5">
                <MessageCircle className="h-32 w-32" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Have a suggestion?</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                We're constantly expanding our toolset. If you need a specific utility or have feedback on our current suite, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold">
                  <a href="mailto:contact@enableflow.online">Email Support</a>
                </Button>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-slate-200 font-bold hover:bg-primary">
                    Contact Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
