import React, { useState, useMemo, useEffect } from "react";
import {
  format,
  differenceInCalendarDays,
  eachDayOfInterval,
  isSameDay,
  getDay,
  startOfDay,
  addDays,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Calculator,
  Trash2,
  Plus,
  ArrowLeft,
  Clock,
  Briefcase,
  CalendarDays,
  Activity,
  Zap,
  Layout,
  PieChart,
  Settings2,
  FileText,
  Download,
  Share2,
  Info,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/hooks/useAppContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const WorkingDaysCalculator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [weekendDays, setWeekendDays] = useState<number[]>([0, 6]); // 0=Sun, 6=Sat
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [newHoliday, setNewHoliday] = useState<Date | undefined>();

  useEffect(() => {
    const title = "Professional Working Days Calculator | EnableFlow";
    const description = "Advanced business day calculator with custom weekends, holiday management, and detailed timeline metrics. Perfect for project planning and SLAs.";
    setMetaDescription(description);
    const keywords = "working days calculator, business days, project timeline, SLA calculator, holiday planner, work duration";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/working-days`;
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
        { "@type": "ListItem", "position": 2, "name": "Working Days Calculator", "item": canonicalHref }
      ]
    });

    return () => {
      s1.remove();
    };
  }, []);

  const handleToggleWeekend = (dayIndex: number) => {
    setWeekendDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const addHoliday = () => {
    if (newHoliday && !holidays.some((h) => isSameDay(h, newHoliday))) {
      setHolidays([...holidays, newHoliday].sort((a, b) => a.getTime() - b.getTime()));
      setNewHoliday(undefined);
    }
  };

  const removeHoliday = (dateToRemove: Date) => {
    setHolidays(holidays.filter((h) => !isSameDay(h, dateToRemove)));
  };

  const stats = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    if (start > end) return null;

    const allDays = eachDayOfInterval({ start, end });
    const totalDays = allDays.length;

    let workingDays = 0;
    let weekendCount = 0;
    let holidayCount = 0;

    allDays.forEach((day) => {
      const dayOfWeek = getDay(day);
      const isWeekend = weekendDays.includes(dayOfWeek);
      const isHoliday = holidays.some((h) => isSameDay(h, day));

      if (isWeekend) {
        weekendCount++;
      } else if (isHoliday) {
        holidayCount++;
      } else {
        workingDays++;
      }
    });

    const workPercentage = ((workingDays / totalDays) * 100).toFixed(1);
    const totalHours = workingDays * 8; // Assuming standard 8-hour day

    return {
      totalDays,
      workingDays,
      weekendCount,
      holidayCount,
      workPercentage,
      totalHours,
      weeks: (workingDays / 5).toFixed(1),
      remainingDays: totalDays - workingDays
    };
  }, [startDate, endDate, weekendDays, holidays]);

  const exportData = () => {
    if (!stats) return;
    const content = JSON.stringify({
      range: { start: startDate, end: endDate },
      weekendDays,
      holidays,
      stats,
      timestamp: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workdays-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-[1400px] transition-all duration-500">
          
          {/* Bento Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <Activity className="h-3 w-3" />
                Timeline Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Business Day <span className="text-primary">Pro</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-xl">
                Advanced workday calculator with custom weekends and holiday management.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  setStartDate(new Date());
                  setEndDate(addDays(new Date(), 7));
                  setWeekendDays([0, 6]);
                  setHolidays([]);
                }}
                variant="ghost" 
                size="icon" 
                className="rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                title="Reset Calculator"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Configuration Workspace */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500">
                <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Timeline Configuration</CardTitle>
                      <CardDescription>Define your working window and exclusions.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 justify-start text-left font-semibold text-lg hover:border-primary transition-all group">
                            <CalendarIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                            {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-4" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 justify-start text-left font-semibold text-lg hover:border-primary transition-all group">
                            <CalendarIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                            {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-4" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Weekend Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Weekend Policy</Label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 1, label: "Monday" },
                        { id: 2, label: "Tuesday" },
                        { id: 3, label: "Wednesday" },
                        { id: 4, label: "Thursday" },
                        { id: 5, label: "Friday" },
                        { id: 6, label: "Saturday" },
                        { id: 0, label: "Sunday" },
                      ].map((day) => (
                        <Button
                          key={day.id}
                          variant={weekendDays.includes(day.id) ? "default" : "outline"}
                          onClick={() => handleToggleWeekend(day.id)}
                          className={cn(
                            "rounded-2xl h-12 px-6 font-semibold transition-all",
                            weekendDays.includes(day.id) 
                              ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
                              : "border-slate-200 text-slate-600 hover:border-primary hover:bg-primary/5"
                          )}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Holiday Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Custom Holidays</Label>
                      </div>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-full px-3">
                        {holidays.length} Active
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 justify-start text-left font-semibold hover:border-primary transition-all group">
                            <Plus className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                            {newHoliday ? format(newHoliday, "PPP") : <span>Select holiday date...</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                          <Calendar mode="single" selected={newHoliday} onSelect={setNewHoliday} initialFocus className="p-4" />
                        </PopoverContent>
                      </Popover>
                      <Button onClick={addHoliday} disabled={!newHoliday} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg">
                        Add Holiday
                      </Button>
                    </div>

                    {holidays.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {holidays.map((date, idx) => (
                          <div key={idx} className="group flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl hover:border-rose-200 hover:bg-rose-50 transition-all">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600">{format(date, "MMM d, yyyy")}</span>
                            <button onClick={() => removeHoliday(date)} className="text-slate-400 hover:text-rose-500 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Insights Bento - Bottom Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg text-sky-500 bg-sky-50">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Hours</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stats?.totalHours || 0}h</div>
                  <Progress value={100} className="h-1.5 rounded-full bg-slate-50" indicatorClassName="bg-sky-400" />
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg text-emerald-500 bg-emerald-50">
                      <Briefcase className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Percentage</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stats?.workPercentage || 0}%</div>
                  <Progress value={parseFloat(stats?.workPercentage || "0")} className="h-1.5 rounded-full bg-slate-50" indicatorClassName="bg-emerald-400" />
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg text-amber-500 bg-amber-50">
                      <CalendarDays className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Weeks</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stats?.weeks || 0}</div>
                  <Progress value={Math.min((parseFloat(stats?.weeks || "0") / 52) * 100, 100)} className="h-1.5 rounded-full bg-slate-50" indicatorClassName="bg-amber-400" />
                </div>
              </div>
            </div>

            {/* RIGHT: Result Intelligence Panel */}
            <div className="lg:col-span-4 space-y-6 sticky top-8">
              {/* Major Stat Bento */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                  <Briefcase className="h-20 w-20" />
                </div>
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Total Business Days</div>
                  <div className="text-7xl font-black tracking-tighter">{stats?.workingDays || 0}</div>
                  <div className="mt-8 flex items-center gap-2">
                    <Badge className="bg-primary text-slate-900 border-none rounded-full font-bold">
                      {stats?.workPercentage}% Productive
                    </Badge>
                    <span className="text-xs text-slate-400">of {stats?.totalDays} total days</span>
                  </div>
                </div>
              </div>

              {/* Exclusions Bento */}
              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit rounded-full px-3 py-1 border-rose-100 text-rose-500 bg-rose-50/50">
                    Exclusion Summary
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weekends</div>
                      <div className="text-2xl font-black text-slate-900">{stats?.weekendCount || 0}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Holidays</div>
                      <div className="text-2xl font-black text-slate-900">{stats?.holidayCount || 0}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-500">Working Period</span>
                      <span className="text-slate-900">{stats?.totalDays} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-500">Non-working</span>
                      <span className="text-rose-500">{stats?.remainingDays} days</span>
                    </div>
                  </div>

                  <Separator className="opacity-50" />
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                    <Info className="h-4 w-4 text-primary flex-shrink-0" />
                    Calculated from {startDate ? format(startDate, "MMM d") : '...'} to {endDate ? format(endDate, "MMM d") : '...'} including custom weekend policy.
                  </div>
                </CardContent>
              </Card>

              {/* Export/Share Bento */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={exportData}
                  className="rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Download className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold uppercase">Export JSON</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-[1.5rem] h-20 flex flex-col items-center justify-center gap-1 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  onClick={() => {
                    toast({ title: "Coming Soon", description: "PDF reporting is under development." });
                  }}
                >
                  <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold uppercase">Generate PDF</span>
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ & Educational Section */}
          <div className="mt-32 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-none rounded-full mb-4">Knowledge Base</Badge>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mastering project timelines</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { 
                  q: "What defines a 'Business Day'?", 
                  a: "Business days are any 24-hour periods that align with your organization's working policy. While traditionally Monday-Friday, our calculator allows for custom weekend configurations to match global standards." 
                },
                { 
                  q: "How are holiday collisions handled?", 
                  a: "If a custom holiday falls on a selected weekend day, our system intelligently avoids double-counting, ensuring your 'Non-working days' count remains perfectly accurate." 
                },
                { 
                  q: "Is this suitable for SLA calculations?", 
                  a: "Yes. With down-to-the-day accuracy and exclusion of holidays/weekends, it's an ideal tool for estimating Service Level Agreement (SLA) response windows and project deadlines." 
                },
                { 
                  q: "How secure is my company data?", 
                  a: "Security is built-in by design. All date processing and calculation logic occurs entirely within your browser's sandbox. No data is transmitted to external servers." 
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkingDaysCalculator;

