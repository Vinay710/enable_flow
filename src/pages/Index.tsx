import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";
import { categories, tools, searchTools } from "@/lib/tools";
import { useAppContext } from "@/hooks/useAppContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  LayoutGrid, 
  Filter, 
  Zap,
  TrendingUp,
  Layout,
  MousePointer2,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  
  useEffect(() => {
    const title = "EnableFlow | Corporate Tools for Finance, HR & Productivity";
    const description = "EnableFlow offers free, simple, and practical tools for everyday corporate work. Access Salary Calculators, GST Calculators, Pomodoro Timers, and more to boost your productivity.";
    const keywords = "salary calculator, gst calculator, corporate tools, hr tools, productivity tools, pomodoro timer, working days calculator, invoice generator";
    const origin = window.location.origin || "";
    
    document.title = title;
    setMetaDescription(description);
    setMetaKeywords(keywords);
    setCanonicalUrl(`${origin}/`);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    if (searchQuery) {
      return searchTools(searchQuery);
    }
    if (selectedCategory) {
      return tools.filter(tool => tool.categoryId === selectedCategory);
    }
    return tools;
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };
  
  const setCategoryTab = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        <Hero onSearch={handleSearch} />
        
        {/* Popular Tools Bento Section */}
        <section className="py-24 bg-white border-y border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 opacity-[0.03] pointer-events-none rotate-12">
            <TrendingUp className="h-96 w-96" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                  <TrendingUp className="h-3 w-3 mr-2 inline" />
                  Most Used
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[0.9]">
                  Popular <br /> <span className="text-primary italic">Utilities</span>
                </h2>
              </div>
              <p className="text-slate-500 font-medium max-w-sm">
                The most requested tools by our community of professionals, optimized for daily performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {["salary-calculator", "invoice-generator", "qr-generator", "cidr-calculator"].map((id, index) => {
                const tool = tools.find(t => t.id === id);
                if (!tool) return null;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ToolCard
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      category={tool.category}
                      color={tool.color}
                      path={tool.path}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Section with Modern Cards */}
        <section id="categories" className="py-32 relative overflow-hidden bg-slate-50">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <Badge className="bg-slate-900 text-white border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                Discover
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                Explore by Category
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CategoryCard
                    title={category.title}
                    description={category.description}
                    icon={category.icon}
                    toolCount={tools.filter(t => t.categoryId === category.id).length}
                    color={category.color}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Tools Grid Section */}
        <section id="tools" className="py-32 bg-white border-t border-slate-100 relative">
          <div className="container mx-auto px-4">
            
            {/* Search & Filters UI */}
            <div className="max-w-5xl mx-auto space-y-12 mb-24">
              <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What tool do you need today?"
                  className="w-full h-20 pl-16 pr-8 rounded-[2rem] border-none bg-slate-50 text-xl font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { id: null, label: "All Tools", icon: <LayoutGrid className="h-4 w-4" /> },
                  { id: "finance", label: "Finance", icon: <TrendingUp className="h-4 w-4" /> },
                  { id: "hr", label: "HR Tools", icon: <Zap className="h-4 w-4" /> },
                  { id: "productivity", label: "Productivity", icon: <Sparkles className="h-4 w-4" /> },
                  { id: "utilities", label: "Utilities", icon: <Layout className="h-4 w-4" /> },
                ].map(tab => (
                  <button
                    key={tab.label}
                    onClick={() => setCategoryTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all active:scale-95 ${
                      selectedCategory === tab.id 
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                        : "border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-200"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {searchQuery 
                    ? `Results for "${searchQuery}"`
                    : selectedCategory 
                      ? `${categories.find(c => c.id === selectedCategory)?.title} Suite`
                      : "The Complete Toolbox"
                  }
                </h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {filteredTools.length} Professional Utility available
                </p>
              </div>
              
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  Clear All
                </Button>
              )}
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool) => (
                  <motion.div 
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ToolCard
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      category={tool.category}
                      color={tool.color}
                      path={tool.path}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredTools.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 space-y-6"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">No tools found matching your request.</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Try a different search term or browse our categories to find what you're looking for.
                </p>
                <Button
                  onClick={clearFilters}
                  className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20"
                >
                  View All Tools
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section - Already Redesigned in previous turn but enhanced with Badge */}
        <section className="py-32 overflow-hidden bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="gradient-bg rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
              <div className="relative z-10 space-y-8">
                <Badge className="bg-white/20 text-white border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] backdrop-blur-md">
                  Unlimited Access
                </Badge>
                <h2 className="text-4xl md:text-7xl font-black text-primary-foreground tracking-tighter leading-[0.9]">
                  Ready to boost your <br /> <span className="italic">productivity?</span>
                </h2>
                <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                  All tools are free, no login required. Just open, use, and close. 
                  It's that simple.
                </p>
                <button 
                  onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-16 px-12 rounded-[2rem] bg-white text-primary text-lg font-bold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/5 flex items-center gap-2 mx-auto"
                >
                  Explore All Tools
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
