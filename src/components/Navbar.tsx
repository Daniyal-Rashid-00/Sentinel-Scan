'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User, LayoutDashboard, LogOut, Home, Shield } from 'lucide-react'

export function Navbar() {
    const [email, setEmail] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setEmail(session.user.email ?? null)
                setUsername(session.user.user_metadata?.username ?? null)
            }
            setLoading(false)
        }
        checkSession()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <nav className="w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold font-mono text-sm">SentinelScan</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>

                    {!loading && (
                        email ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                                    title={email}
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline font-mono max-w-[120px] truncate">{username || email?.split('@')[0]}</span>
                                    <LogOut className="w-3.5 h-3.5 ml-1 text-zinc-600" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login?mode=signup" className="text-sm font-mono text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 rounded-full font-semibold transition-colors">
                                    Sign Up
                                </Link>
                                <Link href="/login" className="text-sm font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-full border border-zinc-700 transition-colors">
                                    Log In
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    )
}
