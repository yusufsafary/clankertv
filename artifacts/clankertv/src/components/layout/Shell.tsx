import { Link, useLocation } from "wouter";
import { Terminal, Menu, X, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "DISCOVERY" },
    { href: "/trending", label: "TRENDING" },
    { href: "/portfolio", label: "WATCHLIST" },
    { href: "/about", label: "ABOUT" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col w-full text-foreground bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="scanline" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-5 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_100%)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 glass-panel">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Activity className="h-5 w-5 text-primary group-hover:animate-pulse" />
            <span className="font-bold tracking-tighter text-lg">
              CLANKER<span className="text-primary">TV</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "hover:text-primary transition-colors duration-200",
                  location === item.href ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-xs px-3 py-1 border border-primary/50 text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider">
              CONNECT WALLET
            </button>
          </div>

          {/* Mobile toggle */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "text-sm font-medium p-2",
                  location === item.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button className="text-xs px-4 py-2 border border-primary/50 text-primary mt-2 uppercase tracking-wider">
              CONNECT WALLET
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {children}
      </main>

      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span>SYS.TERMINAL.CLANKERTV // V0.1.0</span>
          </div>
          <p>DATA AGGREGATION ONLY. NOT FINANCIAL ADVICE.</p>
        </div>
      </footer>
    </div>
  );
}
