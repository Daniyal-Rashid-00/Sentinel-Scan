"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function DomainInput() {
    const [domain, setDomain] = useState("");
    const [consent, setConsent] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Auto-extract domain if user pastes a full URL
        let targetDomain = domain.trim().toLowerCase();
        try {
            const urlString = targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`;
            targetDomain = new URL(urlString).hostname;
            setDomain(targetDomain); // update input visually
        } catch (err) {
            // Keep original input if URL parsing fails
        }

        if (targetDomain && consent) {
            setIsScanning(true);

            try {
                // Fetch the user session to link the scan to an account if logged in
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                const user_id = session?.user?.id || null;

                const response = await fetch("/api/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ domain: targetDomain, consent, user_id }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Scan request failed");
                }

                // Once we have the scan_id, cache raw_data locally and redirect
                if (data.scan_id) {
                    // Store in localStorage as a fallback for the report page
                    try {
                        localStorage.setItem(
                            `scan_${data.scan_id}`,
                            JSON.stringify({
                                id: data.scan_id,
                                domain: targetDomain,
                                raw_data: data.raw_data,
                                ai_report: null,
                                risk_score: null,
                                status: "scanning",
                                created_at: new Date().toISOString(),
                            })
                        );
                    } catch (e) {
                        // localStorage unavailable (SSR/private mode), ignore
                    }
                    router.push(`/report/${data.scan_id}`);
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
                setIsScanning(false);
            }
        }
    };

    return (
        <form onSubmit={handleScan} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    type="text"
                    placeholder="Enter target domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isScanning}
                    className="font-mono text-base py-5 px-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500 shadow-sm"
                    required
                />
                <Button
                    type="submit"
                    disabled={!consent || !domain || isScanning}
                    className="py-5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        "Scan Now"
                    )}
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {isScanning && !error && (
                <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center space-y-3 animate-pulse">
                    <p className="text-emerald-400 font-mono text-sm">Initializing recon modules...</p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full w-full animate-[progress_2s_ease-in-out_infinite]" style={{ transformOrigin: 'left' }}></div>
                    </div>
                </div>
            )}

            <div className="flex items-start space-x-3 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                <Checkbox
                    id="consent"
                    checked={consent}
                    disabled={isScanning}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    className="mt-1 border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-500"
                />
                <label
                    htmlFor="consent"
                    className="text-sm text-zinc-400 leading-relaxed cursor-pointer"
                >
                    I confirm that I am authorized to perform a security scan on this domain.
                    Scanning domains you do not own or have explicit permission to test may be illegal.
                    SentinelScan accepts no liability for misuse.
                </label>
            </div>
        </form>
    );
}
