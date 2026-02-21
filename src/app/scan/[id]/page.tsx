export default function ScanProgressPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <h1 className="text-2xl font-bold font-mono">Scanning {params.id}...</h1>
        </div>
    );
}
