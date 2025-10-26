import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Challenge from "@/pages/challenge";
import HowItWorks from "@/pages/how-it-works";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/components/SplashScreen";
import { useAutoResultChecker } from "@/hooks/use-auto-result-checker";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/challenge" component={Challenge} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Auto-check prediction results every 30 seconds
  useAutoResultChecker();

  useEffect(() => {
    const initFarcasterSDK = async () => {
      try {
        const sdk = await import("@farcaster/frame-sdk");
        await sdk.default.actions.ready();
      } catch (error) {
        console.warn('Farcaster SDK not available (running outside Mini App context):', error);
      }
    };
    
    initFarcasterSDK();
    
    // Hide splash screen after 2.5 seconds (longer for better animation)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
