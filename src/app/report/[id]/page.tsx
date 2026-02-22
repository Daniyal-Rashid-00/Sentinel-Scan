"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { ReportRenderer } from "@/components/ReportRenderer";
import { ShareButton } from "@/components/ShareButton";
import {
    ScanResultCard,
    SubdomainsList,
    PortsList,
    HeadersTable,
    PathsTable,
} from "@/components/ScanResultCard";
import {
    Globe,
    Server,
    Shield,
    FileSearch,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import Link from "next/link";

// Types
interface RawData {
    domain: string;
    subdomains: string[];
    ports: { open: number[]; closed: number[]; services: Record<string, string> };
    headers: Record<string, { status: string; value: string | null }>;
    paths: Record<string, { status: number | string; severity: string }>;
}

interface ScanRecord {
    id: string;
    domain: string;
    raw_data: RawData;
    ai_report: string | null;
    risk_score: number | null;
    status: string;
    created_at: string;
}

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const scanId = params?.id as string;

    const [scan, setScan] = useState<ScanRecord | null>(null);
    const [aiReport, setAiReport] = useState<string>("");
    const [riskScore, setRiskScore] = useState<number | null>(null);
    const [isStreamingAi, setIsStreamingAi] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch raw scan data
    const fetchScanData = useCallback(async () => {
        if (!scanId) return;
        try {
            const res = await fetch(`/api/scan/${scanId}`);
            if (!res.ok) {
                // Try localStorage fallback before showing error
                try {
                    const cached = localStorage.getItem(`scan_${scanId}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        setScan(parsed);
                        setPageLoading(false);
                        return;
                    }
                } catch (e) { }

                if (res.status === 404) {
                    setError("Scan not found. It may have expired.");
                } else {
                    setError("Failed to load scan data.");
                }
                return;
            }
            const data: ScanRecord = await res.json();
            setScan(data);
            // If AI report already exists in DB (cached), use it
            if (data.ai_report) {
                setAiReport(data.ai_report);
                setRiskScore(data.risk_score);
            }
        } catch (e) {
            // Try localStorage fallback on network errors
            try {
                const cached = localStorage.getItem(`scan_${scanId}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setScan(parsed);
                    setPageLoading(false);
                    return;
                }
            } catch { }
            setError("Could not connect to server.");
        } finally {
            setPageLoading(false);
        }
    }, [scanId]);

    // Stream AI report
    const streamReport = useCallback(async () => {
        if (!scanId) return;
        setIsStreamingAi(true);
        setAiReport("");
        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scan_id: scanId }),
            });

            if (!res.ok || !res.body) {
                setIsStreamingAi(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const jsonData = JSON.parse(line.slice(6));
                            if (jsonData.text) {
                                setAiReport((prev) => prev + jsonData.text);
                            }
                            if (jsonData.done) {
                                setRiskScore(jsonData.score ?? null);
                                setIsStreamingAi(false);
                            }
                            if (jsonData.error) {
                                setIsStreamingAi(false);
                            }
                        } catch {
                            // ignore parse errors
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Stream error:", e);
        } finally {
            setIsStreamingAi(false);
        }
    }, [scanId]);

    useEffect(() => {
        fetchScanData();
    }, [fetchScanData]);

    // Start streaming once scan data loaded and no cached AI report
    useEffect(() => {
        if (scan && !scan.ai_report) {
            streamReport();
        }
    }, [scan, streamReport]);

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-zinc-400 font-mono text-sm">Loading scan data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-400 text-lg">{error}</p>
                    <Link href="/" className="text-emerald-400 hover:underline text-sm">
                        ← Scan another domain
                    </Link>
                </div>
            </div>
        );
    }

    const raw = scan?.raw_data;
    const displayScore = riskScore ?? scan?.risk_score;

    return (
        <main className="min-h-screen relative">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">

                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors text-sm mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Scan another domain
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-zinc-500 text-sm font-mono mb-1">Security Report</p>
                                <h1 className="text-2xl md:text-3xl font-bold font-mono text-zinc-100">
                                    {scan?.domain || scanId}
                                </h1>
                            </div>
                            {displayScore !== null && displayScore !== undefined && (
                                <RiskBadge score={displayScore} />
                            )}
                            {isStreamingAi && displayScore === null && (
                                <span className="text-xs text-zinc-500 font-mono animate-pulse">Calculating risk...</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <ShareButton />
                        </div>
                    </div>

                    {scan?.created_at && (
                        <p className="text-zinc-600 text-xs font-mono mt-2">
                            Scanned {new Date(scan.created_at).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Main layout: 2 columns on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Left: AI Report (wider) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-zinc-200 font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                AI Vulnerability Report
                            </h2>
                            {aiReport ? (
                                <ReportRenderer markdown={aiReport} isStreaming={isStreamingAi} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                                    <p className="text-zinc-500 font-mono text-sm">Analyzing with AI...</p>
                                    <p className="text-zinc-600 text-xs">This usually takes 10-30 seconds</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Raw Data Panel */}
                    <div className="lg:col-span-2 space-y-4">

                        <ScanResultCard
                            title="Subdomains"
                            icon={<Globe className="w-4 h-4" />}
                            count={raw?.subdomains?.length ?? 0}
                            defaultOpen={true}
                        >
                            <SubdomainsList subdomains={raw?.subdomains ?? []} />
                        </ScanResultCard>

                        <ScanResultCard
                            title="Open Ports"
                            icon={<Server className="w-4 h-4" />}
                            count={`${raw?.ports?.open?.length ?? 0} open`}
                            defaultOpen={true}
                        >
                            <PortsList ports={raw?.ports ?? { open: [], closed: [], services: {} }} />
                        </ScanResultCard>

                        <ScanResultCard
                            title="Security Headers"
                            icon={<Shield className="w-4 h-4" />}
                            count={Object.keys(raw?.headers ?? {}).length}
                        >
                            <HeadersTable headers={raw?.headers ?? {}} />
                        </ScanResultCard>

                        <ScanResultCard
                            title="Sensitive Paths"
                            icon={<FileSearch className="w-4 h-4" />}
                            count={Object.values(raw?.paths ?? {}).filter((p) => p.status === 200).length + " exposed"}
                        >
                            <PathsTable paths={raw?.paths ?? {}} />
                        </ScanResultCard>

                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center border-t border-zinc-800/50 pt-10">
                    <p className="text-zinc-500 text-sm mb-4">Want to test another domain?</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Start a new scan
                    </Link>
                </div>
            </div>
        </main>
    );
}
