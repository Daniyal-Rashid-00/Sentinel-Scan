import { Badge } from "@/components/ui/badge";

export function RiskBadge({ score }: { score: number }) {
    let colorClass = "bg-zinc-800 text-zinc-400";
    let label = "Unknown";

    if (score >= 0 && score <= 3) {
        colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        label = "Low Risk";
    } else if (score >= 4 && score <= 6) {
        colorClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        label = "Medium Risk";
    } else if (score >= 7 && score <= 8) {
        colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
        label = "High Risk";
    } else if (score >= 9) {
        colorClass = "bg-red-500/10 text-red-400 border-red-500/20";
        label = "Critical Risk";
    }

    return (
        <Badge variant="outline" className={`${colorClass} px-3 py-1 font-mono hover:bg-transparent`}>
            {score}/10 - {label}
        </Badge>
    );
}
