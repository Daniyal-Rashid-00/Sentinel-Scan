import Link from 'next/link'
import { Shield, Github, Linkedin, Globe } from 'lucide-react'

export function Footer() {
    return (
        <footer className="w-full border-t border-zinc-800/50 mt-8 py-10 px-6">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-5">
                {/* Logo */}
                <div className="flex items-center gap-2 text-zinc-500">
                    <Shield className="w-4 h-4 text-emerald-500/60" />
                    <span className="font-mono text-sm font-semibold text-zinc-400">SentinelScan</span>
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                    <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                    <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
                    <Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
                    <Link href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link>
                    <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
                </div>

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-2xl text-zinc-600 text-xs gap-3">
                    <span>
                        Made by{' '}
                        <a href="https://daniyal-rashid.vercel.app/" target="_blank" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">
                            Daniyal Rashid
                        </a>
                    </span>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/Daniyal-Rashid-00" target="_blank" className="hover:text-emerald-400 transition-colors" title="GitHub">
                            <Github className="w-4 h-4" />
                        </a>
                        <a href="https://www.linkedin.com/in/the-daniyal-rashid/" target="_blank" className="hover:text-emerald-400 transition-colors" title="LinkedIn">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a href="https://daniyal-rashid.vercel.app/" target="_blank" className="hover:text-emerald-400 transition-colors" title="Portfolio">
                            <Globe className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
