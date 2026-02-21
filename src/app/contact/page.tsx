import { Mail, Phone, MapPin, Globe } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen p-8 pt-24 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-100 mb-8 font-mono text-emerald-400">Contact Us</h1>

            <p className="text-zinc-400 leading-relaxed mb-12 text-lg">
                Have a question, feedback, or a business inquiry? Feel free to reach out through any of the channels below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex items-start gap-4 hover:border-emerald-500/50 transition-colors">
                    <div className="p-3 bg-zinc-800 rounded-md text-emerald-400">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-zinc-200 font-semibold mb-1">Email</h3>
                        <a href="mailto:the.daniyal.rashid@gmail.com" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                            the.daniyal.rashid@gmail.com
                        </a>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex items-start gap-4 hover:border-emerald-500/50 transition-colors">
                    <div className="p-3 bg-zinc-800 rounded-md text-emerald-400">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-zinc-200 font-semibold mb-1">Phone</h3>
                        <a href="tel:+923137840038" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                            +92-313-7840038
                        </a>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex items-start gap-4 hover:border-emerald-500/50 transition-colors">
                    <div className="p-3 bg-zinc-800 rounded-md text-emerald-400">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-zinc-200 font-semibold mb-1">Portfolio</h3>
                        <a href="https://daniyal-rashid.vercel.app/" target="_blank" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                            daniyal-rashid.vercel.app
                        </a>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex items-start gap-4 hover:border-emerald-500/50 transition-colors">
                    <div className="p-3 bg-zinc-800 rounded-md text-emerald-400">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-zinc-200 font-semibold mb-1">Location</h3>
                        <span className="text-zinc-400">
                            Gujranwala, Punjab, Pakistan
                        </span>
                    </div>
                </div>

            </div>
        </main>
    );
}
