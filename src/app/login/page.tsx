import { login, signup } from './actions'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>
            <div className="relative z-10 w-full max-w-sm">
                <Link href="/" className="text-zinc-500 hover:text-emerald-400 text-sm mb-4 inline-block">← Back to Home</Link>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>

                    <div className="text-center mb-8">
                        <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-zinc-100 font-mono">Authenticate</h1>
                        <p className="text-zinc-500 mt-2 text-sm">Log in to save your scan history</p>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                            />
                        </div>

                        {searchParams?.error && (
                            <p className="text-red-400 text-sm text-center py-2 bg-red-400/10 rounded-lg border border-red-400/20">
                                Invalid login credentials.
                            </p>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                formAction={login}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2 rounded-lg transition-colors font-mono text-sm"
                            >
                                Log In
                            </button>
                            <button
                                formAction={signup}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2 rounded-lg transition-colors border border-zinc-700 font-mono text-sm"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>

                    <p className="text-zinc-600 text-xs text-center mt-6">
                        Testing? You may need to disable "Confirm email" in Supabase to sign up instantly.
                    </p>
                </div>
            </div>
        </main>
    )
}
