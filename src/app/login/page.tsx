import { login, signup } from './actions'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage({ searchParams }: {
    searchParams?: { error?: string; success?: string; mode?: string }
}) {
    const isLoginError = searchParams?.error === 'login'
    const isSignupError = searchParams?.error === 'signup'
    const isEmailConfirmation = searchParams?.success === 'confirm'
    const defaultSignup = searchParams?.mode === 'signup'

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
                        <p className="text-zinc-500 mt-2 text-sm">Save your scan history to your account</p>
                    </div>

                    <form className="space-y-4">
                        {/* Username — only shown for signup flow */}
                        {defaultSignup && (
                            <div>
                                <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="username">
                                    Username <span className="text-zinc-600 text-xs">(optional)</span>
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    maxLength={30}
                                    placeholder="e.g. hacker42"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm placeholder:text-zinc-600"
                                />
                            </div>
                        )}

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
                                minLength={6}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                            />
                            <p className="text-zinc-600 text-xs mt-1">Minimum 6 characters</p>
                        </div>

                        {isLoginError && (
                            <p className="text-red-400 text-sm text-center py-2 bg-red-400/10 rounded-lg border border-red-400/20">
                                ❌ Invalid email or password. Please try again.
                            </p>
                        )}
                        {isSignupError && (
                            <p className="text-red-400 text-sm text-center py-2 bg-red-400/10 rounded-lg border border-red-400/20">
                                ❌ Sign up failed. Use a password of at least 6 characters.
                            </p>
                        )}
                        {isEmailConfirmation && (
                            <p className="text-emerald-400 text-sm text-center py-2 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
                                ✅ Account created! Check your email to confirm, then log in.
                            </p>
                        )}

                        {defaultSignup ? (
                            <button
                                formAction={signup}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors font-mono text-sm"
                            >
                                Create Account
                            </button>
                        ) : (
                            <button
                                formAction={login}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors font-mono text-sm"
                            >
                                Log In
                            </button>
                        )}
                    </form>

                    <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
                        {defaultSignup ? (
                            <>
                                <span>Already have an account?</span>
                                <Link href="/login" className="text-emerald-400 hover:underline">Log In</Link>
                            </>
                        ) : (
                            <>
                                <span>New to SentinelScan?</span>
                                <Link href="/login?mode=signup" className="text-emerald-400 hover:underline">Create Account</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
