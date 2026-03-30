import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Network, 
  Copy, 
  Check, 
  RotateCcw, 
  Activity, 
  Zap, 
  Layout, 
  Settings2, 
  Braces, 
  Info, 
  Maximize2,
  Minimize2,
  FileCode,
  Search,
  AlertCircle,
  Globe,
  Server,
  Hash,
  Binary,
  ShieldCheck
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const CIDRCalculator = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const { toast } = useToast();
  const [ip, setIp] = useState("192.168.1.1");
  const [cidr, setCidr] = useState("24");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const title = "Professional CIDR Calculator & Subnet Tool | EnableFlow";
    const description = "Calculate network ranges, subnet masks, and host capacity instantly. Advanced IPv4 CIDR calculator with binary visualization and network metrics.";
    setMetaDescription(description);
    const keywords = "cidr calculator, subnet mask, ip range, network calculator, ipv4 subnetting, host capacity, networking tools";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/cidr-calculator`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
  }, []);

  const ipToLong = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    return parts.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const longToIp = (long: number) => {
    return [
      (long >>> 24) & 0xff,
      (long >>> 16) & 0xff,
      (long >>> 8) & 0xff,
      long & 0xff
    ].join('.');
  };

  const stats = useMemo(() => {
    const ipLong = ipToLong(ip);
    const maskSize = parseInt(cidr, 10);

    if (ipLong === null || isNaN(maskSize) || maskSize < 0 || maskSize > 32) {
      return { isValid: false };
    }

    const mask = (0xffffffff << (32 - maskSize)) >>> 0;
    const networkLong = (ipLong & mask) >>> 0;
    const broadcastLong = (networkLong | ~mask) >>> 0;
    const totalHosts = Math.max(0, Math.pow(2, 32 - maskSize));
    const usableHosts = maskSize <= 30 ? totalHosts - 2 : (maskSize === 31 ? 2 : 1);

    const firstHostLong = maskSize <= 30 ? networkLong + 1 : networkLong;
    const lastHostLong = maskSize <= 30 ? broadcastLong - 1 : broadcastLong;

    const wildcardMask = (~mask) >>> 0;

    const toBinary = (long: number) => {
      return (long >>> 0).toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || "";
    };

    return {
      isValid: true,
      network: longToIp(networkLong),
      broadcast: longToIp(broadcastLong),
      firstHost: longToIp(firstHostLong),
      lastHost: longToIp(lastHostLong),
      mask: longToIp(mask),
      wildcard: longToIp(wildcardMask),
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      binaryIp: toBinary(ipLong),
      binaryMask: toBinary(mask),
      maskSize
    };
  }, [ip, cidr]);

  const copyField = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast({ title: "Copied!", description: `${field} copied to clipboard` });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <Network className="h-3 w-3" />
                Network Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                CIDR Calculator <span className="text-primary">Pro</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-xl">
                Precision subnetting and network range analysis for IPv4 infrastructures.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  setIp("192.168.1.1");
                  setCidr("24");
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
            
            {/* LEFT: Input Section */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-white border-b px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Network Input</CardTitle>
                      <CardDescription>Enter an IPv4 address and CIDR prefix.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-2">
                      <Label htmlFor="ip" className="text-xs font-bold uppercase text-slate-500 tracking-wider">IP Address</Label>
                      <Input 
                        id="ip"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="e.g. 192.168.1.1"
                        className="h-14 rounded-2xl border-slate-200 text-lg font-mono focus:ring-primary/20"
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label htmlFor="cidr" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Prefix (CIDR)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">/</span>
                        <Input 
                          id="cidr"
                          type="number"
                          min="0"
                          max="32"
                          value={cidr}
                          onChange={(e) => setCidr(e.target.value)}
                          className="h-14 pl-8 rounded-2xl border-slate-200 text-lg font-mono focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {!stats?.isValid && ip && (
                    <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-semibold">Invalid IP address or CIDR prefix.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Binary Visualization Bento */}
              {stats?.isValid && (
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Binary className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Binary Representation</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>IP Address</span>
                          <span className="text-primary">{ip}</span>
                        </div>
                        <div className="font-mono text-xl md:text-2xl tracking-tighter break-all">
                          {stats.binaryIp.split('.').map((octet, i) => (
                            <span key={i}>
                              {octet}
                              {i < 3 && <span className="text-slate-700 mx-1">.</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Subnet Mask</span>
                          <span className="text-primary">/{cidr}</span>
                        </div>
                        <div className="font-mono text-xl md:text-2xl tracking-tighter break-all">
                          {stats.binaryMask.split('.').map((octet, i) => (
                            <span key={i}>
                              <span className="text-primary">{octet}</span>
                              {i < 3 && <span className="text-slate-700 mx-1">.</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* RIGHT: Intelligence Panel */}
            <div className="lg:col-span-4 space-y-6 sticky top-8">
              {/* Capacity Bento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                    <Hash className="h-16 w-16" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-slate-900">{stats?.usableHosts || 0}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Usable Hosts</div>
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                    <Globe className="h-16 w-16" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black">{stats?.totalHosts || 0}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total IPs</div>
                  </div>
                </div>
              </div>

              {/* Range Details Bento */}
              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-primary bg-primary/5">
                    Network Range
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Network Address", value: stats?.network, icon: <Activity className="h-3 w-3" /> },
                    { label: "Broadcast Address", value: stats?.broadcast, icon: <Zap className="h-3 w-3" /> },
                    { label: "First Usable", value: stats?.firstHost, icon: <Server className="h-3 w-3" /> },
                    { label: "Last Usable", value: stats?.lastHost, icon: <Server className="h-3 w-3" /> },
                    { label: "Subnet Mask", value: stats?.mask, icon: <ShieldCheck className="h-3 w-3" /> },
                    { label: "Wildcard Mask", value: stats?.wildcard, icon: <RotateCcw className="h-3 w-3" /> },
                  ].map((item) => (
                    <div key={item.label} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          {item.icon}
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900">{item.value || "—"}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => item.value && copyField(item.value, item.label)}
                      >
                        {copiedField === item.label ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pro Tips Bento */}
              <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-primary text-white p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                  <Info className="h-16 w-16" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-2">Network Tip</h4>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">
                    A /24 network provides 254 usable host addresses. The first address is the Network ID and the last is the Broadcast address.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-32 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-none rounded-full mb-4">Knowledge Base</Badge>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Understanding CIDR & Subnetting</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { 
                  q: "What is CIDR?", 
                  a: "Classless Inter-Domain Routing (CIDR) is a method for allocating IP addresses and IP routing. it replaced the older system based on classes (A, B, C) to allow more efficient use of the IPv4 address space." 
                },
                { 
                  q: "Why are 2 IPs subtracted from total hosts?", 
                  a: "In any standard subnet, two addresses are reserved: the Network Address (identifies the network itself) and the Broadcast Address (used to communicate with all hosts on the network)." 
                },
                { 
                  q: "What is a Wildcard Mask?", 
                  a: "A wildcard mask is essentially an inverted subnet mask. It's used in Access Control Lists (ACLs) and routing protocols like OSPF to specify which parts of an IP address should be examined." 
                },
                { 
                  q: "How does binary subnetting work?", 
                  a: "Subnetting works by 'borrowing' bits from the host portion of an IP address to create a network portion. The CIDR number (e.g., /24) tells you exactly how many bits are used for the network." 
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

export default CIDRCalculator;
