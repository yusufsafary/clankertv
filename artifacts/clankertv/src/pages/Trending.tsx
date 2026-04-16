import { useState } from "react";
import { Link } from "wouter";
import { useGetTrendingTokens, getGetTrendingTokensQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatTimeAgo, truncateAddress } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Activity, Flame, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Trending() {
  const [timeframe, setTimeframe] = useState<"1h" | "6h" | "24h">("24h");

  const { data, isLoading } = useGetTrendingTokens(
    { timeframe }, 
    { query: { queryKey: getGetTrendingTokensQueryKey({ timeframe }), refetchInterval: 30000 } }
  );

  const tokens = data?.data || [];

  return (
    <div className="w-full flex flex-col h-full min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/30">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TRENDING TOKENS</h1>
              <p className="text-sm text-muted-foreground mt-1">Top movers by volume and market cap</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 border border-border bg-card p-1">
            {(["1h", "6h", "24h"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 text-xs font-medium uppercase transition-colors ${
                  timeframe === t 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase">
                <th className="py-4 pl-4 font-normal">#</th>
                <th className="py-4 font-normal">Token</th>
                <th className="py-4 font-normal text-right">Price/MCap</th>
                <th className="py-4 font-normal text-right">Volume (24h)</th>
                <th className="py-4 font-normal text-right">Change (24h)</th>
                <th className="py-4 font-normal text-right">Age</th>
                <th className="py-4 pr-4 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 pl-4"><div className="h-4 w-4 bg-border/50 rounded" /></td>
                    <td className="py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 bg-border/50 rounded-full" /><div className="h-4 w-24 bg-border/50 rounded" /></div></td>
                    <td className="py-4 text-right"><div className="h-4 w-16 bg-border/50 rounded ml-auto" /></td>
                    <td className="py-4 text-right"><div className="h-4 w-16 bg-border/50 rounded ml-auto" /></td>
                    <td className="py-4 text-right"><div className="h-4 w-12 bg-border/50 rounded ml-auto" /></td>
                    <td className="py-4 text-right"><div className="h-4 w-16 bg-border/50 rounded ml-auto" /></td>
                    <td className="py-4 pr-4"></td>
                  </tr>
                ))
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Activity className="h-8 w-8 opacity-20" />
                      <p>NO TRENDING TOKENS FOUND</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tokens.map((token, index) => (
                  <tr key={token.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 font-mono text-muted-foreground text-xs w-12">
                      {index + 1}
                    </td>
                    <td className="py-4">
                      <Link href={`/token/${token.contract_address}`} className="flex items-center gap-3 w-fit group-hover:text-primary transition-colors">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={token.image_url || undefined} alt={token.name} />
                          <AvatarFallback className="bg-black text-xs rounded-none">{token.symbol.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 text-right font-mono">
                      <div className="flex flex-col items-end">
                        <span>{formatCurrency(token.current_market_cap)}</span>
                        <span className="text-[10px] text-muted-foreground truncate w-24" title={token.contract_address}>{truncateAddress(token.contract_address)}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono">
                      {formatCurrency(token.volume_24h)}
                    </td>
                    <td className="py-4 text-right font-mono">
                      {token.price_change_24h !== null && token.price_change_24h !== undefined ? (
                        <div className={`flex items-center justify-end ${token.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                          {token.price_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                          {Math.abs(token.price_change_24h).toFixed(2)}%
                        </div>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="py-4 text-right font-mono text-xs text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(token.created_at)}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <Link href={`/token/${token.contract_address}`} className="text-xs text-primary hover:underline border border-primary/30 px-2 py-1 bg-primary/5 uppercase">
                        Analyze
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
