import { DomainInput } from "@/components/DomainInput";
import { Card } from "@/components/ui/card";
import { Shield, Activity, Lock, Terminal, Github, Linkedin, Globe } from "lucide-react";
import Link from "next/link";
import { RiskBadge } from "@/components/RiskBadge";

// Placeholder data for Phase 1
const recentScans = [
  { id: "1", domain: "example.com", score: 2, time: "2 mins ago" },
  { id: "2", domain: "testsite.org", score: 8, time: "15 mins ago" },
  { id: "3", domain: "hackme.local", score: 10, time: "1 hour ago" },
  { id: "4", domain: "secure-app.io", score: 1, time: "3 hours ago" },
  { id: "5", domain: "vulnerable.net", score: 6, time: "5 hours ago" },
];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-5xl px-6 pt-24 pb-16 flex flex-col items-center text-center space-y-12">

        {/* Hero Section */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            v2.0 Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(to_bottom_right,#f4f4f5,#71717a)]">
            Automated Reconnaissance <br className="hidden md:block" />
            <span className="text-emerald-400">& Vulnerability Reporting</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Input a target domain and receive a structured, AI-generated security report in under 20 seconds. Built on serverless infrastructure.
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full">
          <DomainInput />
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-6 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-zinc-800/80 rounded-lg text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-100 font-semibold">Fast & Concurrent</h3>
            <p className="text-zinc-500 text-sm">Passive enumeration, port scanning, and header analysis run concurrently.</p>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-6 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-zinc-800/80 rounded-lg text-emerald-400">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-100 font-semibold">AI-Powered Output</h3>
            <p className="text-zinc-500 text-sm">Data streams directly into an LLM context window to generate highly readable Markdown reports.</p>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50 p-6 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-zinc-800/80 rounded-lg text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-100 font-semibold">Consent Gated</h3>
            <p className="text-zinc-500 text-sm">Strict validation and authorization required. Play safe, test ethically.</p>
          </Card>
        </div>

        {/* Recent Scans (UI Stub) */}
        <div className="w-full max-w-3xl pt-16 text-left border-t border-zinc-800/50 mt-8">
          <h2 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Recent Scans
          </h2>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {recentScans.map((scan) => (
                <Link key={scan.id} href={`/report/${scan.id}`} className="block hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-zinc-300">{scan.domain}</div>
                      <RiskBadge score={scan.score} />
                    </div>
                    <div className="text-sm text-zinc-500">{scan.time}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full pt-16 mt-8 border-t border-zinc-800/50 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-500">
            <Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full text-zinc-500 text-sm gap-4">
            <div className="flex items-center gap-2">
              Made by <a href="https://daniyal-rashid.vercel.app/" target="_blank" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Daniyal Rashid</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Daniyal-Rashid-00" target="_blank" className="hover:text-emerald-400 transition-colors" title="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/the-daniyal-rashid/" target="_blank" className="hover:text-emerald-400 transition-colors" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://daniyal-rashid.vercel.app/" target="_blank" className="hover:text-emerald-400 transition-colors" title="Portfolio">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
