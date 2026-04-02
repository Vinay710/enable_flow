import { AppContext } from "./hooks/useAppContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SalaryCalculator from "./pages/tools/SalaryCalculator";
import EMICalculator from "./pages/tools/EMICalculator";
import GSTCalculator from "./pages/tools/GSTCalculator";
import QRCodeGenerator from "./pages/tools/QRCodeGenerator";
import InvoiceGenerator from "./pages/tools/InvoiceGenerator";
import WorkingDaysCalculator from "./pages/tools/WorkingDaysCalculator";
import PomodoroTimer from "./pages/tools/PomodoroTimer";
import WordCounter from "./pages/tools/WordCounter";
import JSONFormatter from "./pages/tools/JSONFormatter";
import CIDRCalculator from "./pages/tools/CIDRCalculator";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => {
  const setMetaDescription = (description: string) => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", description);
    }
  };

  const setMetaKeywords = (keywords: string) => {
    const meta = document.querySelector('meta[name="keywords"]');
    if (meta) {
      meta.setAttribute("content", keywords);
      
    }
  };

  const setCanonicalUrl = (url: string) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  };

  return (
    <AppContext.Provider
      value={{ setMetaDescription, setMetaKeywords, setCanonicalUrl }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/tools/salary-calculator"
                element={<SalaryCalculator />}
              />
              <Route
                path="/tools/emi-calculator"
                element={<EMICalculator />}
              />
              <Route
                path="/tools/gst-calculator"
                element={<GSTCalculator />}
              />
              <Route
                path="/tools/qr-generator"
                element={<QRCodeGenerator />}
              />
              <Route
                path="/tools/invoice-generator"
                element={<InvoiceGenerator />}
              />
              <Route
                path="/tools/working-days"
                element={<WorkingDaysCalculator />}
              />
              <Route
                path="/tools/pomodoro-timer"
                element={<PomodoroTimer />}
              />
              <Route path="/tools/word-counter" element={<WordCounter />} />
              <Route
                path="/tools/json-formatter"
                element={<JSONFormatter />}
              />
              <Route
                path="/tools/cidr-calculator"
                element={<CIDRCalculator />}
              />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default App;
