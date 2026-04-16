import { useListTokens, getListTokensQueryKey, useGetStats } from "@workspace/api-client-react";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";
import { Link } from "wouter";

export function Ticker() {
  const { data: tokensResponse, isLoading: tokensLoading } = useListTokens(
    { limit: 20, sort: "newest" }, 
    { query: { queryKey: getListTokensQueryKey({ limit: 20, sort: "newest" }), refetchInterval: 30000 } }
  );

  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: { refetchInterval: 60000 }
  });

  const tokens = tokensResponse?.data || [];

  return (
    <div className="w-full flex flex-col border-b border-border/50 bg-black/40 backdrop-blur-md">
      {/* Live Ticker Bar */}
      <div className="h-10 flex items-center overflow-hidden border-b border-border/30 relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 flex items-center px-4">
          <span className="text-xs font-bold text-primary animate-pulse flex items-center gap-1">
            <Activity className="h-3 w-3" /> LIVE
          </span>
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex whitespace-nowrap pl-24 pr-8 hover:[animation-play-state:paused] animate-[ticker_30s_linear_infinite]">
          {tokensLoading ? (
            <span className="text-xs text-muted-foreground px-4 py-1">CONNECTING TO FEED...</span>
          ) : (
            <div className="flex items-center">
              {tokens.map((token) => (
                <Link key={`ticker-${token.id}`} href={`/token/${token.contract_address}`} className="flex items-center gap-3 px-6 border-r border-border/30 group hover:bg-white/5 transition-colors h-10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{token.symbol}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(token.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">{formatCurrency(token.current_market_cap)}</span>
                    {token.price_change_24h && (
                      <span className={`text-[10px] flex items-center ${token.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                        {token.price_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(token.price_change_24h).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {/* Duplicate for infinite loop illusion */}
              {tokens.map((token) => (
                <Link key={`ticker-dup-${token.id}`} href={`/token/${token.contract_address}`} className="flex items-center gap-3 px-6 border-r border-border/30 group hover:bg-white/5 transition-colors h-10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{token.symbol}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(token.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">{formatCurrency(token.current_market_cap)}</span>
                    {token.price_change_24h && (
                      <span className={`text-[10px] flex items-center ${token.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                        {token.price_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(token.price_change_24h).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="h-8 flex items-center px-4 overflow-x-auto no-scrollbar gap-6 text-[10px] sm:text-xs font-mono text-muted-foreground">
        {!statsLoading && stats && (
          <>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-foreground">TOTAL LAUNCHED (24H):</span>
              <span className="text-primary font-bold">{stats.tokens_24h}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-foreground">VOL (24H):</span>
              <span className="text-primary font-bold">{formatCurrency(stats.total_volume_24h)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-primary font-bold">{stats.trending_up}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <span className="text-destructive font-bold">{stats.trending_down}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
