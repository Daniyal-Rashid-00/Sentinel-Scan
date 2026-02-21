export function ScanResultCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <details className="bg-zinc-900 border border-zinc-800 rounded-md p-4 mt-4">
            <summary className="text-zinc-100 font-semibold cursor-pointer">{title}</summary>
            <div className="mt-4 text-zinc-400">
                {children}
            </div>
        </details>
    );
}
