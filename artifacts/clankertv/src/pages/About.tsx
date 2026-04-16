import { Terminal, ShieldAlert, Code2, Rss } from "lucide-react";

export default function About() {
  return (
    <div className="w-full flex flex-col h-full min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-12 flex flex-col gap-12 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <Terminal className="h-12 w-12 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SYSTEM: CLANKER_TV</h1>
          <p className="text-muted-foreground max-w-xl font-mono text-sm">
            REAL-TIME INTELLIGENCE INTERFACE FOR CLANKER PROTOCOL DEPLOYMENTS ON BASE NETWORK.
          </p>
        </div>

        {/* Disclaimer - Critical UI Element */}
        <div className="terminal-box border-warning p-6 bg-warning/5 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
          <div className="flex items-center gap-2 text-warning font-bold text-lg tracking-wider">
            <ShieldAlert className="h-5 w-5" />
            LEGAL DISCLAIMER & WARNING
          </div>
          <p className="text-warning/90 font-sans text-sm leading-relaxed font-medium">
            NOT FINANCIAL ADVICE. This is a data aggregation tool only. DYOR (Do Your Own Research). Trading meme coins involves extreme risk and you may lose your entire investment. ClankerTV does not endorse, verify, or audit any tokens displayed on this platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="terminal-box p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <Rss className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">WHAT IS CLANKERTV?</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              ClankerTV is a terminal-grade dashboard designed for on-chain degens to monitor token deployments in real-time. It streams data directly from the Clanker protocol, providing an unfiltered, low-latency feed of new meme coins launching on the Base network.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Use the discovery feed to catch alpha early, monitor trending launches, and maintain a watchlist of tokens you're tracking.
            </p>
          </div>

          <div className="terminal-box p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border/50 pb-3">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">WHAT IS CLANKER?</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Clanker is an autonomous AI agent running on Farcaster that deploys tokens on the Base network when requested by users. It bridges social intent with on-chain execution.
            </p>
            <div className="mt-auto pt-4 flex flex-col gap-3">
              <a 
                href="https://clanker.world" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-border hover:border-primary text-sm transition-colors group"
              >
                <span>clanker.world</span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a 
                href="https://warpcast.com/clanker" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-border hover:border-primary text-sm transition-colors group"
              >
                <span>@clanker on Warpcast</span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-xs text-muted-foreground/50 pt-8 border-t border-border/30">
          SYSTEM VERSION 0.1.0 // OPERATIONAL // BASE_MAINNET
        </div>
      </div>
    </div>
  );
}
