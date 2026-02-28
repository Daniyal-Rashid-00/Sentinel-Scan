import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import { Shield, ArrowRight, Clock, Globe, LogOut } from 'lucide-react'
import Link from 'next/link'
import { RiskBadge } from '@/components/RiskBadge'

export default async function DashboardPage() {
    const supabase = createClient()

    // Get user session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Fetch scans for this user
    const { data: scans, error } = await supabase
        .from('scans')
        .select('id, domain, risk_score, created_at, status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="z-10 w-full max-w-5xl px-6 pt-16 pb-16">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-mono text-zinc-100 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-400" />
                            Scan History
                        </h1>
                        <p className="text-zinc-500 mt-2 font-mono text-sm">
                            Logged in as {session.user.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-sm font-mono rounded-lg hover:bg-emerald-500/20 transition-colors">
                            + New Scan
                        </Link>
                        <form action={signOut}>
                            <button className="flex items-center gap-2 bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 text-sm font-mono rounded-lg hover:bg-zinc-700 transition-colors">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    {error ? (
                        <div className="p-8 text-center text-red-400 font-mono">
                            Error loading scans. Please try again later.
                        </div>
                    ) : !scans || scans.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Globe className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-xl font-medium text-zinc-300 mb-2">No scans yet</h3>
                            <p className="text-zinc-500 mb-6 max-w-sm">
                                You haven't run any security scans yet. Start by scanning your first target domain.
                            </p>
                            <Link href="/" className="bg-emerald-500 text-zinc-950 font-bold px-6 py-2 rounded-lg hover:bg-emerald-400 transition-colors">
                                Scan a Domain
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/50">
                            {scans.map((scan) => (
                                <Link key={scan.id} href={`/report/${scan.id}`} className="block hover:bg-zinc-800/30 transition-colors p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-zinc-800/80 rounded-lg">
                                                <Globe className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-zinc-200 font-mono mb-1">{scan.domain}</h3>
                                                <div className="flex items-center gap-3 text-zinc-500 text-xs font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(scan.created_at).toLocaleString()}
                                                    </span>
                                                    <span className={scan.status === 'complete' ? 'text-emerald-500/70' : 'text-yellow-500/70'}>
                                                        • {scan.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                            <div className="flex-1 sm:flex-none">
                                                {scan.risk_score !== null ? (
                                                    <RiskBadge score={scan.risk_score} />
                                                ) : (
                                                    <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md border border-zinc-700 font-mono">Pending...</span>
                                                )}
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-zinc-600 hidden sm:block" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
