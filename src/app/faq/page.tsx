export default function FAQPage() {
    const faqs = [
        {
            q: "What is SentinelScan?",
            a: "SentinelScan is an automated reconnaissance and vulnerability reporting tool. It scans a domain for common security misconfigurations, open ports, and exposed paths, and uses AI to generate an easy-to-read report."
        },
        {
            q: "Is SentinelScan free to use?",
            a: "Yes, currently SentinelScan MVP is free to use, though strict rate limits are in place to prevent abuse."
        },
        {
            q: "Is it legal to scan any website?",
            a: "Scanning a domain without explicit authorization from the owner can be interpreted as hostile activity or even a crime in some jurisdictions. You MUST only scan domains that you own or have written permission to test."
        },
        {
            q: "How does the AI reporting work?",
            a: "The tool performs standard technical checks (like headers and ports). It then feeds that raw data to a Large Language Model (Deepseek R1) acting as a cybersecurity analyst, which explains the findings in plain English."
        },
        {
            q: "Why did my scan fail?",
            a: "Scans may fail due to timeouts (if the target server responds very slowly), active firewalls/WAFs blocking our automated requests, or if you have hit your IP rate limit."
        }
    ];

    return (
        <main className="min-h-screen p-8 pt-24 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-100 mb-8 font-mono text-emerald-400">Frequently Asked Questions</h1>

            <div className="space-y-6">
                {faqs.map((faq, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-3">{faq.q}</h3>
                        <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
