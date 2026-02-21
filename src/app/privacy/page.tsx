export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen p-8 pt-24 max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-3xl font-bold text-zinc-100 mb-6 font-mono text-emerald-400">Privacy Policy</h1>
            <p className="text-zinc-400 leading-relaxed mb-4">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                SentinelScan operates primarily as an automated security scanner. We collect the domain names you submit for scanning, technical scan results, and temporary IP connection data to enforce rate limits and prevent abuse.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. How We Use Information</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                The data collected is used strictly to generate the requested vulnerability reports and ensure the stability and security of our platform. We pass raw scanning data to our AI providers strictly for the purpose of generating the report.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Data Retention</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                Scan reports are temporarily stored to allow you to view and share them. We do not indefinitely store scan results or build persistent profiles of users or targeted domains.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Third-Party Services</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                We rely on third-party infrastructure (such as Vercel, Supabase, and OpenRouter) to process and host data. These providers are bound by their respective privacy policies.
            </p>

            <p className="text-zinc-500 text-sm mt-12 border-t border-zinc-800 pt-6">
                This is a standard boilerplate privacy policy for the SentinelScan MVP.
            </p>
        </main>
    );
}
