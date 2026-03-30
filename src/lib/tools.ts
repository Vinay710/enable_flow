import { 
  Calculator, 
  Users, 
  CheckCircle, 
  FileText,
  IndianRupee, 
  Percent, 
  Receipt, 
  CalendarDays, 
  Timer, 
  Type, 
  FileJson, 
  Link,
  QrCode,
  Network,
  LucideIcon 
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  categoryId: string;
  color: string;
  path: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  toolCount: number;
}

export const categories: Category[] = [
  {
    id: "finance",
    title: "Finance & Salary",
    description: "Tax, take-home pay, interest.",
    icon: Calculator,
    color: "finance",
    toolCount: 3,
  },
  {
    id: "hr",
    title: "HR & Management",
    description: "Leaves, working days, shifts.",
    icon: Users,
    color: "hr",
    toolCount: 1,
  },
  {
    id: "productivity",
    title: "Productivity",
    description: "To-do lists, pomodoro, notes.",
    icon: CheckCircle,
    color: "productivity",
    toolCount: 1,
  },
  {
    id: "utilities",
    title: "Utilities",
    description: "Invoices, converters, formatting.",
    icon: FileText,
    color: "utilities",
    toolCount: 5,
  },
];

export const tools: Tool[] = [
  // Finance Tools
  {
    id: "salary-calculator",
    title: "Salary Calculator",
    description: "Calculate CTC to in-hand salary with detailed breakup including PF, tax, and deductions.",
    icon: IndianRupee,
    category: "Finance & Salary",
    categoryId: "finance",
    color: "finance",
    path: "/tools/salary-calculator",
  },
  {
    id: "emi-calculator",
    title: "EMI Calculator",
    description: "Calculate your monthly EMI for home, car, or personal loans with amortization schedule.",
    icon: Percent,
    category: "Finance & Salary",
    categoryId: "finance",
    color: "finance",
    path: "/tools/emi-calculator",
  },
  {
    id: "gst-calculator",
    title: "GST Calculator",
    description: "Calculate GST amount and total price with support for all GST rates.",
    icon: Receipt,
    category: "Finance & Salary",
    categoryId: "finance",
    color: "finance",
    path: "/tools/gst-calculator",
  },
  
  // HR Tools
  {
    id: "working-days",
    title: "Working Days Calculator",
    description: "Calculate working days between two dates excluding weekends and holidays.",
    icon: CalendarDays,
    category: "HR & Management",
    categoryId: "hr",
    color: "hr",
    path: "/tools/working-days",
  },
  
  // Productivity Tools
  {
    id: "pomodoro-timer",
    title: "Pomodoro Timer",
    description: "Stay focused with the Pomodoro technique - 25 min work, 5 min break cycles.",
    icon: Timer,
    category: "Productivity",
    categoryId: "productivity",
    color: "productivity",
    path: "/tools/pomodoro-timer",
  },
  
  // Utilities Tools
  {
    id: "word-counter",
    title: "Word & Character Counter",
    description: "Count words, characters, sentences, and paragraphs in your text instantly.",
    icon: Type,
    category: "Utilities",
    categoryId: "utilities",
    color: "utilities",
    path: "/tools/word-counter",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting.",
    icon: FileJson,
    category: "Utilities",
    categoryId: "utilities",
    color: "utilities",
    path: "/tools/json-formatter",
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes for URLs, text, and contact information.",
    icon: QrCode,
    category: "Utilities",
    categoryId: "utilities",
    color: "utilities",
    path: "/tools/qr-generator",
  },
  {
    id: "invoice-generator",
    title: "Invoice Generator",
    description: "Create professional invoices quickly with customizable templates.",
    icon: FileText,
    category: "Utilities",
    categoryId: "utilities",
    color: "utilities",
    path: "/tools/invoice-generator",
  },
  {
    id: "cidr-calculator",
    title: "CIDR Calculator",
    description: "Calculate network range, subnet mask, and host capacity for any IP/CIDR block.",
    icon: Network,
    category: "Utilities",
    categoryId: "utilities",
    color: "utilities",
    path: "/tools/cidr-calculator",
  },
];

export const getToolsByCategory = (categoryId: string) => {
  return tools.filter(tool => tool.categoryId === categoryId);
};

export const searchTools = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return tools.filter(
    tool =>
      tool.title.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.category.toLowerCase().includes(lowercaseQuery)
  );
};
