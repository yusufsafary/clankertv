import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/Shell";

import NotFound from "@/pages/not-found";
import Discovery from "@/pages/Discovery";
import Trending from "@/pages/Trending";
import TokenDetail from "@/pages/TokenDetail";
import Portfolio from "@/pages/Portfolio";
import About from "@/pages/About";

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Discovery} />
        <Route path="/trending" component={Trending} />
        <Route path="/token/:address" component={TokenDetail} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
