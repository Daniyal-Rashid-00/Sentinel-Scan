export default function ReportPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-emerald-400 font-mono mb-4">Report for {params.id}</h1>
            <p className="text-zinc-400">Loading full report...</p>
        </div>
    );
}
