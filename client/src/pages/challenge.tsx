import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TrendingUp, TrendingDown, ChevronLeft, Clock, AlertCircle, Lock } from "lucide-react";
import type { CryptoPrice, CryptoId, ApiResponse } from "@shared/schema";
import { getCurrentUser, type FarcasterUser } from "@/lib/farcaster";

type ChallengeType = 'quick' | 'big';
type Direction = 'up' | 'down';

export default function Challenge() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  // Parse URL params
  const params = new URLSearchParams(searchParams);
  const coinId = params.get('coin') as CryptoId | null;
  const challengeType = params.get('type') as ChallengeType | null;
  
  // State
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [currentUser, setCurrentUser] = useState<FarcasterUser | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Get current Farcaster user
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);
  
  // Redirect if no coin or challenge type
  useEffect(() => {
    if (!coinId || !challengeType) {
      setLocation('/');
    }
  }, [coinId, challengeType, setLocation]);
  
  // Fetch prices - real-time updates every 1 second
  const { data: pricesData } = useQuery<ApiResponse<CryptoPrice[]>>({
    queryKey: ['/api/prices'],
    refetchInterval: 1000,
  });
  
  const prices = pricesData?.data || [];
  const currentPrice = prices.find(p => p.id === coinId);
  
  // Calculate round info and time remaining
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Date.now();
      const roundDuration = challengeType === 'quick' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      let roundStartTime: number;
      if (challengeType === 'quick') {
        // Quick: rounds start every 5 minutes
        roundStartTime = Math.floor(now / roundDuration) * roundDuration;
      } else {
        // Big: rounds start at UTC midnight
        const nowDate = new Date(now);
        const todayMidnight = new Date(Date.UTC(
          nowDate.getUTCFullYear(),
          nowDate.getUTCMonth(),
          nowDate.getUTCDate(),
          0, 0, 1
        ));
        roundStartTime = todayMidnight.getTime();
      }
      
      const roundEndTime = roundStartTime + roundDuration;
      const diff = roundEndTime - now;
      
      if (diff <= 0) {
        setTimeRemaining('Checking...');
        setIsLocked(true);
        setLockoutMessage('Round ended. Wait for next round...');
        return;
      }
      
      // Check lockout periods
      if (challengeType === 'quick' && diff <= 60 * 1000) {
        // Quick: last 1 minute
        setIsLocked(true);
        setLockoutMessage('Betting closes in the last 60 seconds!');
      } else if (challengeType === 'big') {
        // Big: UTC 22:00-00:00
        const nowDate = new Date(now);
        const utcHour = nowDate.getUTCHours();
        if (utcHour >= 22) {
          setIsLocked(true);
          setLockoutMessage('Betting locked (UTC 22:00-00:00). Opens at 00:00:01!');
        } else {
          setIsLocked(false);
          setLockoutMessage('');
        }
      } else {
        setIsLocked(false);
        setLockoutMessage('');
      }
      
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [challengeType]);
  
  // Submit prediction mutation
  const predictMutation = useMutation({
    mutationFn: async () => {
      if (!coinId || !challengeType || !selectedDirection) {
        throw new Error('Please select a direction');
      }
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      if (!currentPrice) {
        throw new Error('Price data not available');
      }
      
      return apiRequest('POST', '/api/predict', {
        fid: currentUser.fid,
        username: currentUser.username,
        displayName: currentUser.displayName,
        pfpUrl: currentUser.pfpUrl,
        coinId,
        challengeType,
        direction: selectedDirection,
        startPrice: currentPrice.currentPrice,
      });
    },
    onSuccess: () => {
      toast({
        title: "Prediction Submitted!",
        description: `Your ${selectedDirection?.toUpperCase()} prediction is locked in!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/predictions'] });
      setLocation('/profile');
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit prediction",
        description: error.message,
      });
    },
  });
  
  const handleSubmit = () => {
    if (!selectedDirection) {
      toast({
        variant: "destructive",
        title: "Please select a direction",
        description: "Choose UP or DOWN before submitting",
      });
      return;
    }
    predictMutation.mutate();
  };
  
  if (!coinId || !challengeType) {
    return null;
  }
  
  const coinName = coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
  const coinSymbol = coinId === 'bitcoin' ? 'BTC' : 'ETH';
  const CoinIcon = coinId === 'bitcoin' ? SiBitcoin : SiEthereum;
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center hover:bg-accent transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-lg font-bold">
              {challengeType === 'quick' ? 'Quick Challenge' : 'Big Challenge'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {challengeType === 'quick' ? '5 minutes' : '24 hours'}
            </p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-xl relative z-10">
        {/* Round Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-card border border-border/40"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Round #{Math.floor(Date.now() / (challengeType === 'quick' ? 300000 : 86400000))}</div>
              <div className="text-base font-semibold text-foreground">Predictions Close In</div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-bold text-orange-400">{timeRemaining}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Coin Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-card border border-border/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              coinId === 'bitcoin' ? 'bg-orange-500/20' : 'bg-purple-500/20'
            }`}>
              <CoinIcon className={`w-7 h-7 ${
                coinId === 'bitcoin' ? 'text-orange-400' : 'text-purple-400'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{coinName}</h2>
              <p className="text-sm text-muted-foreground">{coinSymbol}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <motion.div
              key={currentPrice?.currentPrice}
              initial={{ scale: 1.05, color: '#22c55e' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold font-mono"
            >
              ${currentPrice ? currentPrice.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--'}
            </motion.div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-500 font-semibold">Live</span>
            </div>
          </div>
        </motion.div>
        
        {/* Make Your Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Make Your Prediction</h3>
          
          {/* Direction Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* UP Button */}
            <motion.button
              onClick={() => setSelectedDirection('up')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedDirection === 'up'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-border/40 bg-card hover:border-green-500/50'
              }`}
              data-testid="button-direction-up"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-2xl font-bold text-foreground">UP</div>
                <div className="text-xs text-muted-foreground">Price will rise</div>
              </div>
            </motion.button>
            
            {/* DOWN Button */}
            <motion.button
              onClick={() => setSelectedDirection('down')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedDirection === 'down'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-border/40 bg-card hover:border-red-500/50'
              }`}
              data-testid="button-direction-down"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-2xl font-bold text-foreground">DOWN</div>
                <div className="text-xs text-muted-foreground">Price will fall</div>
              </div>
            </motion.button>
          </div>
          
          {/* Lockout Warning */}
          {isLocked && lockoutMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3"
            >
              {challengeType === 'quick' ? (
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              )}
              <p className="text-sm font-medium text-orange-400">
                {lockoutMessage}
              </p>
            </motion.div>
          )}
          
          {/* Submit Button */}
          {selectedDirection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={predictMutation.isPending || isLocked}
                className="w-full h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-submit-prediction"
              >
                {predictMutation.isPending ? (
                  <span>Submitting...</span>
                ) : isLocked ? (
                  'Betting Closed'
                ) : (
                  `Lock in ${selectedDirection.toUpperCase()} Prediction`
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
