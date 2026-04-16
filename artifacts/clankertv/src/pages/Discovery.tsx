import { useListTokens, getListTokensQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { formatCurrency, formatTimeAgo, isTokenNew, isTokenRecent, truncateAddress } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, Copy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticker } from "@/components/layout/Ticker";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Discovery() {
  const [sort, setSort] = useState<"newest" | "trending" | "oldest">("newest");
  const { toast } = useToast();

  const { data, isLoading } = useListTokens(
    { page: 1, limit: 30, sort }, 
    { query: { queryKey: getListTokensQueryKey({ page: 1, limit: 30, sort }), refetchInterval: 15000 } }
  );

  const tokens = data?.data || [];

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: truncateAddress(text),
      duration: 2000,
    });
  };

  return (
    <div className="w-full flex flex-col h-full min-h-[calc(100vh-80px)]">
      <Ticker />

      <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">DISCOVERY FEED</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time Base meme coin deployments via Clanker</p>
          </div>
          
          <div className="flex items-center gap-2 border border-border bg-card p-1">
            {(["newest", "trending", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  sort === s 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="terminal-box p-4 h-40 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-none bg-border/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-border/50" />
                      <Skeleton className="h-3 w-16 bg-border/50" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 bg-border/50" />
                </div>
                <div className="space-y-2 mt-auto">
                  <Skeleton className="h-3 w-full bg-border/50" />
                  <Skeleton className="h-3 w-2/3 bg-border/50" />
                </div>
              </div>
            ))
          ) : tokens.length === 0 ? (
            <div className="col-span-full h-64 flex items-center justify-center border border-dashed border-border text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 opacity-20" />
                <p>NO TOKENS FOUND</p>
              </div>
            </div>
          ) : (
            tokens.map((token) => (
              <Link 
                key={token.id} 
                href={`/token/${token.contract_address}`}
                className="terminal-box p-4 group hover:border-primary/50 transition-colors flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 pointer-events-none">
                  {isTokenRecent(token.created_at) && (
                    <div className="pulse-dot" />
                  )}
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-none border border-border group-hover:border-primary/30">
                      <AvatarImage src={token.image_url || undefined} alt={token.name} />
                      <AvatarFallback className="rounded-none bg-black text-xs">{token.symbol.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-lg leading-none">{token.symbol}</span>
                        {isTokenNew(token.created_at) && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-primary text-primary bg-primary/10 rounded-none font-mono">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">{token.name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">MARKET CAP</span>
                    <span className="font-mono text-sm">{formatCurrency(token.current_market_cap)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground">24H CHANGE</span>
                    {token.price_change_24h !== null && token.price_change_24h !== undefined ? (
                      <span className={`font-mono text-sm flex items-center ${token.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                        {token.price_change_24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {Math.abs(token.price_change_24h).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">--</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4 rounded-full">
                      <AvatarImage src={token.requestor_pfp || undefined} />
                      <AvatarFallback className="text-[8px] bg-secondary"><User className="h-2 w-2" /></AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">{token.requestor_username || "Unknown"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(token.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
