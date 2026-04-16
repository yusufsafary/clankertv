import { useGetToken, getGetTokenQueryKey, useGetPortfolio, getGetPortfolioQueryKey, useAddToPortfolio, useRemoveFromPortfolio } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { formatCurrency, formatTimeAgo, truncateAddress, cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, Copy, ExternalLink, BookmarkPlus, BookmarkMinus, User, Droplets, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

export default function TokenDetail() {
  const { address } = useParams<{ address: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: token, isLoading, isError } = useGetToken(
    address || "", 
    { query: { enabled: !!address, queryKey: getGetTokenQueryKey(address || "") } }
  );

  const { data: portfolioData } = useGetPortfolio({
    query: { queryKey: getGetPortfolioQueryKey() }
  });

  const addToPortfolio = useAddToPortfolio();
  const removeFromPortfolio = useRemoveFromPortfolio();

  const portfolioItems = portfolioData?.data || [];
  const isInPortfolio = portfolioItems.some(item => item.contract_address === address);
  const portfolioItem = portfolioItems.find(item => item.contract_address === address);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: truncateAddress(text),
      duration: 2000,
    });
  };

  const toggleWatchlist = () => {
    if (!token) return;

    if (isInPortfolio && portfolioItem) {
      removeFromPortfolio.mutate({ id: portfolioItem.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
          toast({
            title: "Removed from Watchlist",
            description: `${token.symbol} has been removed.`,
          });
        }
      });
    } else {
      addToPortfolio.mutate({ 
        data: { 
          contract_address: token.contract_address,
          name: token.name,
          symbol: token.symbol
        } 
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
          toast({
            title: "Added to Watchlist",
            description: `${token.symbol} is now being tracked.`,
          });
        }
      });
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-destructive/50 mt-12 bg-destructive/5">
        <Activity className="h-12 w-12 text-destructive mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-destructive">TOKEN NOT FOUND</h1>
        <p className="text-muted-foreground mt-2 max-w-md">The contract address provided does not match any token deployed via Clanker.</p>
        <div className="mt-6 font-mono text-sm bg-black/50 p-2 border border-border">
          {address}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6 w-full max-w-5xl">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
        <span className="text-primary hover:underline cursor-pointer" onClick={() => window.history.back()}>← BACK TO FEED</span>
        <span>/</span>
        <span>TOKEN ANALYSIS</span>
        <span>/</span>
        <span className="text-foreground">{address ? truncateAddress(address) : "..."}</span>
      </div>

      {isLoading || !token ? (
        <div className="space-y-6">
          <div className="terminal-box p-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-none bg-border/50" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-40 bg-border/50" />
                <Skeleton className="h-4 w-60 bg-border/50" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 bg-border/50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 bg-border/50 rounded-none" />
            <Skeleton className="h-40 bg-border/50 rounded-none" />
            <Skeleton className="h-40 bg-border/50 rounded-none" />
          </div>
        </div>
      ) : (
        <>
          {/* Header Card */}
          <div className="terminal-box p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="flex items-start gap-5 relative z-10">
              <Avatar className="h-20 w-20 border-2 border-border rounded-none shadow-lg">
                <AvatarImage src={token.image_url || undefined} alt={token.name} />
                <AvatarFallback className="bg-black text-xl rounded-none">{token.symbol.slice(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col">
                <div className="flex items-end gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-foreground leading-none">{token.name}</h1>
                  <span className="text-xl text-primary font-mono">${token.symbol}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <span className="font-mono bg-black px-2 py-1 border border-border/50 text-xs">
                    {truncateAddress(token.contract_address)}
                  </span>
                  <button 
                    onClick={() => handleCopy(token.contract_address, "Contract Address")}
                    className="p-1 hover:bg-white/10 hover:text-foreground transition-colors border border-transparent hover:border-border/50"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 font-mono">
                  <Clock className="h-3 w-3" />
                  <span>Deployed {formatTimeAgo(token.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto relative z-10">
              <button
                onClick={toggleWatchlist}
                disabled={addToPortfolio.isPending || removeFromPortfolio.isPending}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 border text-sm font-bold transition-all w-full md:w-auto uppercase tracking-wide",
                  isInPortfolio 
                    ? "bg-primary/10 border-primary text-primary hover:bg-primary/20" 
                    : "bg-card border-border hover:border-primary text-foreground hover:text-primary"
                )}
              >
                {isInPortfolio ? (
                  <><BookmarkMinus className="h-4 w-4" /> IN WATCHLIST</>
                ) : (
                  <><BookmarkPlus className="h-4 w-4" /> ADD TO WATCHLIST</>
                )}
              </button>
              
              {token.warpcast_url && (
                <a 
                  href={token.warpcast_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-border bg-black text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full md:w-auto uppercase tracking-wide"
                >
                  <ExternalLink className="h-3 w-3" /> VIEW ON WARPCAST
                </a>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="terminal-box p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap</span>
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatCurrency(token.current_market_cap)}
              </div>
            </div>
            
            <div className="terminal-box p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Volume (24H)</span>
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatCurrency(token.volume_24h)}
              </div>
            </div>
            
            <div className="terminal-box p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">24H Change</span>
              <div className="text-2xl font-mono font-bold">
                {token.price_change_24h !== null && token.price_change_24h !== undefined ? (
                  <div className={`flex items-center ${token.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                    {token.price_change_24h >= 0 ? <ArrowUpRight className="h-5 w-5 mr-1" /> : <ArrowDownRight className="h-5 w-5 mr-1" />}
                    {Math.abs(token.price_change_24h).toFixed(2)}%
                  </div>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </div>
            </div>

            <div className="terminal-box p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting MCap</span>
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatCurrency(token.starting_market_cap)}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="terminal-box p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase flex items-center gap-2 border-b border-border pb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Token Information
                </h3>
                <div className="space-y-4">
                  {token.description && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Description</span>
                      <p className="text-sm text-foreground/90 font-sans leading-relaxed">{token.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Type</span>
                      <span className="font-mono text-sm capitalize">{token.type || "ERC20"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Decimals</span>
                      <span className="font-mono text-sm">{token.decimals || 18}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="terminal-box p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase flex items-center gap-2 border-b border-border pb-2">
                  <User className="h-4 w-4 text-primary" />
                  Deployer Information
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={token.requestor_pfp || undefined} />
                    <AvatarFallback className="bg-secondary text-xs"><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-foreground">{token.requestor_username || "Unknown"}</span>
                    {token.requestor_fid && (
                      <span className="text-xs font-mono text-muted-foreground">FID: {token.requestor_fid}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="terminal-box p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase flex items-center gap-2 border-b border-border pb-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  Liquidity Pool
                </h3>
                <div className="space-y-4">
                  {token.pool_address ? (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Pool Address</span>
                      <div className="flex items-center justify-between bg-black/50 p-2 border border-border group">
                        <span className="font-mono text-xs truncate max-w-[150px]">{token.pool_address}</span>
                        <button 
                          onClick={() => handleCopy(token.pool_address!, "Pool Address")}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No pool data available</span>
                  )}
                  
                  {token.pair && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Trading Pair</span>
                      <span className="font-mono text-sm bg-secondary px-2 py-1">{token.pair}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="terminal-box p-6 border-warning/50 bg-warning/5">
                <h3 className="text-sm font-bold text-warning mb-2 uppercase">Risk Warning</h3>
                <p className="text-xs text-warning/80 font-sans leading-relaxed">
                  Meme coins are extremely high risk and volatile. This data is for informational purposes only. Always do your own research before trading.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
