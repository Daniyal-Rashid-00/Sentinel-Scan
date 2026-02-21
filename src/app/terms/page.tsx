export default function TermsPage() {
    return (
        <main className="min-h-screen p-8 pt-24 max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-3xl font-bold text-zinc-100 mb-6 font-mono text-emerald-400">Terms of Service</h1>
            <p className="text-zinc-400 leading-relaxed mb-4">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                By accessing and using SentinelScan, you agree to these terms. If you do not agree, do not use the service.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. Ethical Usage & Consent</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                SentinelScan is strictly for educational, defensive, and authorized testing purposes. <strong>You must only scan domains that you own or have explicit written permission to test.</strong> SentinelScan and its creators accept no liability for illegal or malicious use of this tool.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Disclaimer of Warranties</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                The service is provided "AS IS" without warranty of any kind. We do not guarantee the accuracy, completeness, or reliability of any scan results or AI-generated reports. Scan results may contain false positives or false negatives.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Abuse and Rate Limiting</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                We employ strict rate limits to prevent abuse. Attempts to circumvent these limits, perform denial-of-service attacks, or exploit the platform will result in a permanent ban.
            </p>

            <p className="text-zinc-500 text-sm mt-12 border-t border-zinc-800 pt-6">
                This is a standard boilerplate terms of service for the SentinelScan MVP.
            </p>
        </main>
    );
}
