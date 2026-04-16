import { useGetPortfolio, getGetPortfolioQueryKey, useRemoveFromPortfolio } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatTimeAgo, truncateAddress } from "@/lib/utils";
import { Trash2, Bookmark, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Portfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data, isLoading } = useGetPortfolio({
    query: { queryKey: getGetPortfolioQueryKey() }
  });

  const removeFromPortfolio = useRemoveFromPortfolio();

  const items = data?.data || [];

  const handleRemove = (id: number, symbol: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovingId(id);
    
    removeFromPortfolio.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
        toast({
          title: "Removed from Watchlist",
          description: `${symbol} has been removed.`,
        });
        setRemovingId(null);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove token.",
          variant: "destructive"
        });
        setRemovingId(null);
      }
    });
  };

  return (
    <div className="w-full flex flex-col h-full min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-5xl">
        <div className="flex items-center gap-3 border-b border-border/50 pb-6">
          <div className="p-2 bg-primary/10 border border-primary/30">
            <Bookmark className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">YOUR WATCHLIST</h1>
            <p className="text-sm text-muted-foreground mt-1">Tracked tokens and personal notes</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="terminal-box p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 bg-border/50" />
                  <Skeleton className="h-4 w-48 bg-border/50" />
                </div>
                <Skeleton className="h-8 w-8 bg-border/50" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="terminal-box p-12 flex flex-col items-center justify-center text-center gap-4">
            <Bookmark className="h-12 w-12 text-muted-foreground opacity-50" />
            <div>
              <h3 className="text-lg font-bold text-foreground">WATCHLIST EMPTY</h3>
              <p className="text-sm text-muted-foreground mt-1">You aren't tracking any tokens yet.</p>
            </div>
            <Link href="/" className="mt-4 px-6 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors uppercase text-sm font-bold tracking-wide">
              DISCOVER TOKENS
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <Link 
                key={item.id} 
                href={`/token/${item.contract_address}`}
                className="terminal-box p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-colors relative overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      ${item.symbol}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="font-mono bg-black px-2 py-0.5 text-[10px] border border-border/50 text-muted-foreground hidden sm:block">
                      {truncateAddress(item.contract_address)}
                    </span>
                  </div>
                  
                  {item.notes ? (
                    <div className="text-sm text-muted-foreground/80 font-sans border-l-2 border-primary/30 pl-3 italic py-1 bg-black/20">
                      {item.notes}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Activity className="h-3 w-3" />
                      Added {formatTimeAgo(item.added_at)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto relative z-10">
                  <button 
                    onClick={(e) => handleRemove(item.id, item.symbol, e)}
                    disabled={removingId === item.id}
                    className="p-2 border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove from watchlist"
                  >
                    {removingId === item.id ? (
                      <Activity className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  <div className="px-4 py-2 border border-primary/30 bg-primary/5 text-primary text-xs uppercase font-bold tracking-wide">
                    View
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
