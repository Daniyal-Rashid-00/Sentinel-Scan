export default function AboutPage() {
    return (
        <main className="min-h-screen p-8 pt-24 max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-3xl font-bold text-zinc-100 mb-6 font-mono text-emerald-400">About SentinelScan</h1>

            <p className="text-zinc-400 leading-relaxed mb-6 text-lg">
                SentinelScan is a lightweight, AI-powered Automated Reconnaissance and Vulnerability Reporting platform designed to provide quick security insights.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">The Mission</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                Our mission is to make basic security testing accessible, fast, and easy to understand. By combining concurrent network scanning with advanced AI analysis, we translate raw technical data into readable, actionable security reports.
            </p>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">How It Works</h2>
            <ul className="text-zinc-400 space-y-2 mb-6">
                <li><strong>Passive Recon:</strong> We gather subdomains utilizing open-source intelligence.</li>
                <li><strong>Port Scanning:</strong> We quickly test common ports to identify exposed services.</li>
                <li><strong>Header Analysis:</strong> We evaluate HTTP headers against modern security standards.</li>
                <li><strong>AI Synthesis:</strong> The raw data is passed to a Large Language Model to generate human-readable context and risk scores.</li>
            </ul>

            <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">Built by Daniyal Rashid</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
                SentinelScan was built by Daniyal Rashid, a Cybersecurity Practitioner and Developer focused on creating secure, automated pipelines.
            </p>
        </main>
    );
}
