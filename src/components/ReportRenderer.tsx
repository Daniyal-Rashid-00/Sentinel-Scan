"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportRendererProps {
    markdown: string;
    isStreaming?: boolean;
}

export function ReportRenderer({ markdown, isStreaming = false }: ReportRendererProps) {
    return (
        <div className="relative">
            {isStreaming && (
                <div className="absolute -top-2 right-0 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    AI Streaming...
                </div>
            )}
            <div className="prose prose-invert prose-sm max-w-none
        prose-h1:text-emerald-400 prose-h1:font-mono prose-h1:border-b prose-h1:border-zinc-800 prose-h1:pb-2
        prose-h2:text-zinc-100 prose-h2:font-semibold prose-h2:mt-6
        prose-h3:text-zinc-200 prose-h3:font-medium
        prose-p:text-zinc-400 prose-p:leading-relaxed
        prose-strong:text-zinc-200
        prose-code:text-emerald-400 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
        prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
        prose-blockquote:border-l-emerald-500 prose-blockquote:text-zinc-500
        prose-ul:text-zinc-400 prose-ol:text-zinc-400
        prose-li:marker:text-emerald-400
        prose-table:text-zinc-400
        prose-th:text-zinc-300 prose-th:border-zinc-700 prose-th:bg-zinc-800/50
        prose-td:border-zinc-800
        prose-hr:border-zinc-800
        prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
      ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown || ""}
                </ReactMarkdown>
                {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                )}
            </div>
        </div>
    );
}
