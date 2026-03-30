import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronDown, 
  ArrowRight,
  Calculator, 
  FileText, 
  Calendar, 
  Clock, 
  Globe, 
  QrCode, 
  Type, 
  FileJson, 
  Fingerprint, 
  Briefcase,
  IndianRupee,
  Percent,
  Receipt,
  CalendarDays,
  Timer,
  Network,
  Sparkles,
  Zap,
  Layout,
  Search,
  Command as CommandIcon,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import enableflowLogo from "@/assets/enableflow-logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { tools } from "@/lib/tools";

const toolCategories = [
  {
    title: "Finance & Salary",
    items: [
      { title: "Salary Calculator", href: "/tools/salary-calculator", icon: IndianRupee, desc: "CTC to in-hand pay analysis" },
      { title: "EMI Calculator", href: "/tools/emi-calculator", icon: Percent, desc: "Loan amortization schedules" },
      { title: "GST Calculator", href: "/tools/gst-calculator", icon: Receipt, desc: "Tax calculation for all rates" },
    ],
  },
  {
    title: "HR & Management",
    items: [
      { title: "Working Days Calculator", href: "/tools/working-days", icon: CalendarDays, desc: "Business days excluding holidays" },
    ],
  },
  {
    title: "Productivity",
    items: [
      { title: "Pomodoro Timer", href: "/tools/pomodoro-timer", icon: Timer, desc: "Stay focused with work/break cycles" },
    ],
  },
  {
    title: "Utilities",
    items: [
      { title: "Word & Character Counter", href: "/tools/word-counter", icon: Type, desc: "Real-time text depth analysis" },
      { title: "JSON Formatter", href: "/tools/json-formatter", icon: FileJson, desc: "Validate and beautify JSON data" },
      { title: "QR Code Generator", href: "/tools/qr-generator", icon: QrCode, desc: "Branded custom QR generation" },
      { title: "Invoice Generator", href: "/tools/invoice-generator", icon: FileText, desc: "Professional billing templates" },
      { title: "CIDR Calculator", href: "/tools/cidr-calculator", icon: Network, desc: "IPv4 subnetting and host capacity" },
    ],
  },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setSearchOpen(false);
    command();
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "border-b border-slate-100 bg-white/90 backdrop-blur-xl py-2" 
        : "bg-white py-4"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
          <img 
            src={enableflowLogo} 
            alt="EnableFlow" 
            className="h-10 w-auto" 
          />
        </Link>

        {/* Center: Search & Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1 ml-12 gap-8">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-3 px-4 h-10 w-64 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-400 hover:border-primary/20 hover:bg-white hover:shadow-sm transition-all text-sm"
          >
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left">Search tools...</span>
            <kbd className="hidden lg:flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-600 hover:text-slate-900 focus:bg-transparent focus:text-slate-900 data-[active]:bg-transparent data-[active]:text-slate-900 data-[state=open]:bg-transparent data-[state=open]:text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em]">
                  Tools Suite
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[calc(100vw-4rem)] md:w-[650px] lg:w-[750px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      {/* Left Side: Finance & HR */}
                      <div className="space-y-6">
                        {toolCategories.slice(0, 2).map((category) => (
                          <div key={category.title}>
                            <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                              <span className="h-1 w-1 rounded-full bg-primary" />
                              {category.title}
                            </h4>
                            <ul className="space-y-1">
                              {category.items.map((item) => (
                                <li key={item.title}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={item.href}
                                      className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-slate-50"
                                    >
                                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm group-hover:border-primary/20 group-hover:text-primary transition-all">
                                        <item.icon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900">{item.title}</div>
                                        <div className="text-[9px] text-slate-400 line-clamp-1">{item.desc}</div>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Right Side: Productivity & Utilities */}
                      <div className="space-y-6">
                        {toolCategories.slice(2, 4).map((category) => (
                          <div key={category.title}>
                            <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                              <span className="h-1 w-1 rounded-full bg-primary" />
                              {category.title}
                            </h4>
                            <ul className="grid grid-cols-1 gap-1">
                              {category.items.map((item) => (
                                <li key={item.title}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={item.href}
                                      className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-slate-50"
                                    >
                                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm group-hover:border-primary/20 group-hover:text-primary transition-all">
                                        <item.icon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900">{item.title}</div>
                                        <div className="text-[9px] text-slate-400 line-clamp-1">{item.desc}</div>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promo Banner */}
                    <div className="mt-6 pt-4 border-t border-slate-50">
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/#tools" 
                          className="flex items-center justify-between group rounded-xl bg-slate-50 p-3 transition-all hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Explore full productivity suite</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-primary transition-transform group-hover:translate-x-1" />
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/about">
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-slate-600 hover:text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em]")}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contact">
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-slate-600 hover:text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em]")}>
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/#tools">
            <Button className="h-11 rounded-[1.5rem] px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
              Explore Tools
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSearchOpen(true)}
            className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-900"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-900">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-white p-0 border-l-0">
              <SheetHeader className="p-8 border-b border-slate-50">
                <SheetTitle className="text-left flex items-center justify-between">
                  <img 
                    src={enableflowLogo} 
                    alt="EnableFlow" 
                    className="h-8 w-auto" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl h-10 w-10">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full overflow-y-auto pb-32">
                <div className="p-8 space-y-10">
                  {/* Mobile Tools List */}
                  {toolCategories.map((category) => (
                    <div key={category.title} className="space-y-5">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {category.title}
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {category.items.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 group active:scale-95 transition-transform"
                          >
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Separator className="bg-slate-50" />

                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      to="/about"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-bold text-slate-900"
                    >
                      About Platform
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-bold text-slate-900"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput placeholder="Type a tool name to search..." className="border-none focus:ring-0" />
        </div>
        <CommandList className="max-h-[450px]">
          <CommandEmpty>No tools found matching your search.</CommandEmpty>
          <CommandGroup heading="Available Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                onSelect={() => runCommand(() => navigate(tool.path))}
                className="flex items-center gap-3 p-3 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-white group"
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-all",
                  "bg-white border-slate-100 text-slate-400 group-data-[selected=true]:border-white/20 group-data-[selected=true]:text-primary group-data-[selected=true]:bg-white"
                )}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-700 group-data-[selected=true]:text-white transition-colors">{tool.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest group-data-[selected=true]:text-white/70 transition-colors">{tool.category}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Platform">
            <CommandItem 
              onSelect={() => runCommand(() => navigate("/about"))} 
              className="flex items-center gap-3 p-3 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-white group"
            >
              <Info className="h-5 w-5 text-slate-400 group-data-[selected=true]:text-white" />
              <span className="font-bold text-slate-700 group-data-[selected=true]:text-white transition-colors">About Platform</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => navigate("/contact"))} 
              className="flex items-center gap-3 p-3 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-white group"
            >
              <Zap className="h-5 w-5 text-slate-400 group-data-[selected=true]:text-white" />
              <span className="font-bold text-slate-700 group-data-[selected=true]:text-white transition-colors">Contact Support</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Header;
