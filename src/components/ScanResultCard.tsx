"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RiskBadge } from "./RiskBadge";

interface ScanResultCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number | string;
}

export function ScanResultCard({ title, icon, children, defaultOpen = false, count }: ScanResultCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-emerald-400">{icon}</span>
                    <span className="text-zinc-200 font-semibold">{title}</span>
                    {count !== undefined && (
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">{count}</span>
                    )}
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
            </button>

            {open && (
                <div className="border-t border-zinc-800 p-4">
                    {children}
                </div>
            )}
        </div>
    );
}

// Subdomains list
export function SubdomainsList({ subdomains }: { subdomains: string[] }) {
    if (!subdomains || subdomains.length === 0) {
        return <p className="text-zinc-500 text-sm font-mono">No subdomains found.</p>;
    }
    return (
        <ul className="space-y-1">
            {subdomains.map((sub) => (
                <li key={sub} className="text-emerald-400 font-mono text-sm bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                    {sub}
                </li>
            ))}
        </ul>
    );
}

// Port list
export function PortsList({ ports }: { ports: { open: number[]; closed: number[]; services: Record<string, string> } }) {
    if (!ports) return <p className="text-zinc-500 text-sm font-mono">No port data.</p>;
    return (
        <div className="space-y-3">
            {ports.open.length > 0 && (
                <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Open Ports</p>
                    <div className="flex flex-wrap gap-2">
                        {ports.open.map((port) => (
                            <span key={port} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-mono text-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                                {port} <span className="text-zinc-500 text-xs">({ports.services[String(port)] || "?"})</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {ports.closed.length > 0 && (
                <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Closed/Filtered Ports</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ports.closed.map((port) => (
                            <span key={port} className="px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded font-mono text-xs">{port}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// HTTP Headers table
export function HeadersTable({ headers }: { headers: Record<string, { status: string; value: string | null }> }) {
    if (!headers || "error" in headers) {
        return <p className="text-zinc-500 text-sm font-mono">Could not retrieve headers.</p>;
    }
    const getStatusColor = (status: string) => {
        if (status.includes("warn")) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        if (status === "missing") return "text-red-400 bg-red-500/10 border-red-500/20";
        if (status.includes("good")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    };
    return (
        <div className="space-y-2">
            {Object.entries(headers).map(([header, data]) => (
                <div key={header} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 p-2.5 bg-zinc-800/30 rounded-lg">
                    <span className="font-mono text-xs text-zinc-300">{header}</span>
                    <div className="sm:text-right">
                        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-mono ${getStatusColor(data.status)}`}>
                            {data.status}
                        </span>
                        {data.value && <p className="text-zinc-500 text-xs mt-1 font-mono break-all sm:truncate sm:max-w-[220px] sm:ml-auto">{data.value}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Paths table
export function PathsTable({ paths }: { paths: Record<string, { status: number | string; severity: string }> }) {
    if (!paths || "error" in paths) {
        return <p className="text-zinc-500 text-sm font-mono">Could not probe paths.</p>;
    }
    return (
        <div className="space-y-1.5">
            {Object.entries(paths).map(([path, data]) => {
                const isExposed = data.status === 200 && path !== "/robots.txt";
                return (
                    <div key={path} className={`flex items-center justify-between p-2.5 rounded-lg ${isExposed ? "bg-red-500/10 border border-red-500/20" : "bg-zinc-800/30"}`}>
                        <span className="font-mono text-xs text-zinc-300">{path}</span>
                        <span className={`font-mono text-xs font-bold ${isExposed ? "text-red-400" : data.status === "error" ? "text-zinc-600" : "text-zinc-400"}`}>
                            {String(data.status)}
                            {isExposed && <span className="ml-2 text-red-400 text-xs">⚠ EXPOSED</span>}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
