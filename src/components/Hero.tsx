import { useRef, useState, useEffect } from "react";
import { ArrowRight, Calculator, FileText, Calendar, Zap, Sparkles, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface HeroProps {
  onSearch: (query: string) => void;
}

const FloatingCard = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ 
      y: [0, -15, 0],
      opacity: 1
    }}
    transition={{
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      },
      opacity: { duration: 0.8, delay }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const Spotlight = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(37, 99, 235, 0.08), transparent 40%)`,
        }}
      />
    </div>
  );
};

const DecryptedText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(true);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={cn(isAnimating ? "font-mono" : "font-sans")}>{displayText}</span>;
};

const Hero = ({ onSearch }: HeroProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden border-b">
      {/* react-bits Spotlight Effect */}
      <Spotlight />
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6 flex w-fit items-center gap-2">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Empowering Modern Workflows
              </Badge>
              
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                Tools that keep <br />
                <span className="text-primary italic">
                  <DecryptedText text="work moving" />
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                Simple, high-performance tools designed for the modern professional. 
                Finance, HR, and Productivity suites — all in one private workspace.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <Button 
                size="lg"
                onClick={() => scrollToSection('tools')}
                className="h-16 px-10 rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
              >
                Launch Tools
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('categories')}
                className="h-16 px-10 rounded-[2rem] border-slate-200 text-slate-600 text-lg font-bold hover:bg-primary transition-all hover:scale-105 active:scale-95"
              >
                Browse Categories
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-primary/10 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary fill-primary" />
                100% Free & Private
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Bento-style Mock */}
          <div className="lg:col-span-5 relative hidden lg:block h-[600px]">
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Floating Element 1: Salary */}
              <FloatingCard delay={0} className="absolute top-0 left-0 z-20">
                <Card className="w-64 rounded-[2rem] border-none shadow-2xl shadow-slate-200/50 p-6 bg-white group hover:scale-105 transition-transform cursor-default">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                      <Calculator className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900">Salary</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finance</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-50 rounded-full w-full" />
                    <div className="h-2 bg-slate-50 rounded-full w-2/3" />
                    <div className="h-8 bg-blue-50/50 rounded-xl w-full" />
                  </div>
                </Card>
              </FloatingCard>

              {/* Floating Element 2: Invoice */}
              <FloatingCard delay={0.5} className="absolute top-1/2 -right-4 -translate-y-1/2 z-30">
                <Card className="w-64 rounded-[2rem] border-none shadow-2xl shadow-blue-200/20 p-6 bg-slate-900 text-white group hover:scale-105 transition-transform cursor-default">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-black text-white">Invoice</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Productivity</div>
                    </div>
                  </div>
                  <div className="space-y-3 opacity-50">
                    <div className="h-2 bg-white/10 rounded-full w-full" />
                    <div className="h-10 bg-primary/20 rounded-xl w-full" />
                  </div>
                </Card>
              </FloatingCard>

              {/* Floating Element 3: Calendar */}
              <FloatingCard delay={1} className="absolute bottom-4 left-10 z-10">
                <Card className="w-56 rounded-[2rem] border-none shadow-xl shadow-slate-200/30 p-6 bg-white group hover:scale-105 transition-transform cursor-default">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Days</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[...Array(21)].map((_, i) => (
                      <div key={i} className={`h-3 rounded-md ${i % 7 > 4 ? 'bg-rose-100' : 'bg-slate-50'}`} />
                    ))}
                  </div>
                </Card>
              </FloatingCard>

              {/* Decorative Elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-dashed border-slate-200 rounded-full -z-10"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-20 animate-pulse" />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-slate-300"
      >
        <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;
