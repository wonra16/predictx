import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { Zap, Crown, ChevronRight, User, Trophy, Sparkles, Activity, ArrowUpRight, ArrowDownRight, Heart, Clock, Flame } from "lucide-react";
import type { CryptoPrice, CryptoId, ApiResponse } from "@shared/schema";
import DailyReward from "@/components/predictx/daily-reward";
import { getCurrentUser, addMiniAppToFavorites, type FarcasterUser } from "@/lib/farcaster";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ChallengeType = 'quick' | 'big';

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State
  const [selectedCoin, setSelectedCoin] = useState<CryptoId | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [currentUser, setCurrentUser] = useState<FarcasterUser | null>(null);
  
  // Get current Farcaster user
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);
  
  // Check daily reward on mount (ONCE per day)
  useEffect(() => {
    const lastRewardDate = localStorage.getItem('lastDailyReward');
    const lastRewardClaimed = localStorage.getItem('lastRewardClaimed') === 'true';
    const today = new Date().toDateString();
    
    // Only show if: different day AND not already claimed today
    if (lastRewardDate !== today && !lastRewardClaimed) {
      setTimeout(() => setShowDailyReward(true), 1500);
    } else if (lastRewardDate !== today) {
      // New day - reset claimed status
      localStorage.removeItem('lastRewardClaimed');
    }
  }, []);
  
  // Mutation for claiming daily reward
  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.fid) throw new Error('User not authenticated');
      const res = await apiRequest('POST', '/api/daily-reward/claim', { fid: currentUser.fid });
      return await res.json();
    },
    onSuccess: (data: any) => {
      const today = new Date().toDateString();
      setShowDailyReward(false);
      localStorage.setItem('lastDailyReward', today);
      localStorage.setItem('lastRewardClaimed', 'true');
      
      // Invalidate stats query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/stats', currentUser?.fid] });
      
      if (data.success) {
        toast({
          title: "🎉 Daily Reward Claimed!",
          description: `You earned ${data.data.points} points! Streak: ${data.data.streakDays} days`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Failed to claim reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim daily reward. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleClaimReward = () => {
    claimRewardMutation.mutate();
  };
  
  // Fetch prices - real-time updates every 1 second
  const { data: pricesData } = useQuery<ApiResponse<CryptoPrice[]>>({
    queryKey: ['/api/prices'],
    refetchInterval: 1000, // 1 second for real-time price updates
  });
  
  const prices = pricesData?.data || [];
  const bitcoinPrice = prices.find(p => p.id === 'bitcoin');
  const ethereumPrice = prices.find(p => p.id === 'ethereum');
  
  const handleCoinSelect = (coinId: CryptoId) => {
    setSelectedCoin(coinId);
  };
  
  const handleChallengeSelect = (challenge: ChallengeType) => {
    // Check Big Challenge lockout (UTC 22:00-00:00)
    if (challenge === 'big') {
      const now = new Date();
      const utcHour = now.getUTCHours();
      if (utcHour >= 22) {
        toast({
          title: "Big Challenge Locked",
          description: "Betting is locked between UTC 22:00-00:00. New round opens at 00:00:01.",
          variant: "destructive",
        });
        return;
      }
    }
    setSelectedChallenge(challenge);
  };
  
  const handleAddToFavorites = async () => {
    const success = await addMiniAppToFavorites();
    if (success) {
      toast({
        title: "Added to Favorites!",
        description: "PredictX has been added to your Farcaster favorites.",
      });
    } else {
      toast({
        title: "How to Add to Favorites",
        description: "Tap the ⋯ menu at top-right, then select 'Add to Favorites'",
        variant: "default",
      });
    }
  };
  
  return (
    <>
      <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PredictX</h1>
                <p className="text-sm text-gray-500">Predict & Win</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToFavorites}
                className="w-10 h-10 rounded-xl bg-[#1a1f35] border border-white/10 hover:border-pink-500/50 flex items-center justify-center transition-all group"
                data-testid="button-add-favorite"
                title="Add to Favorites"
              >
                <Heart className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
              </button>
              <button
                onClick={() => setLocation('/profile')}
                className="w-10 h-10 rounded-xl bg-[#1a1f35] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
                data-testid="button-profile"
              >
                <User className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setLocation('/leaderboard')}
                className="w-10 h-10 rounded-xl bg-[#1a1f35] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
                data-testid="button-leaderboard"
              >
                <Trophy className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1f35] border border-cyan-500/30 rounded-3xl p-6 mb-6 max-h-[calc(100vh-180px)] overflow-y-auto"
          >
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1.5 bg-cyan-500 rounded-full" />
              <div className={`flex-1 h-1.5 rounded-full transition-all ${selectedCoin ? 'bg-cyan-500' : 'bg-white/10'}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-all ${selectedCoin && selectedChallenge ? 'bg-cyan-500' : 'bg-white/10'}`} />
            </div>

            {/* Step 1: Choose Coin */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-white">Choose Your Coin</h2>
              </div>

              <div className="space-y-4">
                {/* Bitcoin */}
                <motion.button
                  onClick={() => handleCoinSelect('bitcoin')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedCoin === 'bitcoin'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-orange-500/30'
                  }`}
                  data-testid="card-coin-bitcoin"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                          <SiBitcoin className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold text-white">Bitcoin</div>
                          <div className="text-xs text-gray-500">BTC</div>
                        </div>
                      </div>
                      {selectedCoin === 'bitcoin' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${bitcoinPrice ? bitcoinPrice.currentPrice.toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3 h-3" />
                          Live
                        </div>
                      </div>
                      {bitcoinPrice && bitcoinPrice.priceChangePercentage24h !== 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          bitcoinPrice.priceChangePercentage24h >= 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {bitcoinPrice.priceChangePercentage24h >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(bitcoinPrice.priceChangePercentage24h).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>

                {/* Ethereum */}
                <motion.button
                  onClick={() => handleCoinSelect('ethereum')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedCoin === 'ethereum'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-cyan-500/30'
                  }`}
                  data-testid="card-coin-ethereum"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                          <SiEthereum className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold text-white">Ethereum</div>
                          <div className="text-xs text-gray-500">ETH</div>
                        </div>
                      </div>
                      {selectedCoin === 'ethereum' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          ${ethereumPrice ? ethereumPrice.currentPrice.toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3 h-3" />
                          Live
                        </div>
                      </div>
                      {ethereumPrice && ethereumPrice.priceChangePercentage24h !== 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          ethereumPrice.priceChangePercentage24h >= 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ethereumPrice.priceChangePercentage24h >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(ethereumPrice.priceChangePercentage24h).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Step 2: Choose Challenge */}
            {selectedCoin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-white">Choose Challenge</h2>
                </div>

                <div className="space-y-4">
                  {/* Quick Challenge */}
                  <motion.button
                    onClick={() => handleChallengeSelect('quick')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedChallenge === 'quick'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/10 bg-[#111827] hover:border-cyan-500/30'
                    }`}
                    data-testid="card-challenge-quick"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-white">Quick Challenge</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>5 minutes</span>
                              <span>•</span>
                              <Flame className="w-3 h-3" />
                              <span>Streak bonus: up to 4x</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-cyan-400">50-200</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Big Challenge */}
                  <motion.button
                    onClick={() => handleChallengeSelect('big')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedChallenge === 'big'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-[#111827] hover:border-purple-500/30'
                    }`}
                    data-testid="card-challenge-big"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-white">Big Challenge</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>24 hours</span>
                              <span>•</span>
                              <Flame className="w-3 h-3" />
                              <span>Streak bonus: up to 5x</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-400">200-1K+</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Start Predicting Button */}
                {selectedChallenge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={() => {
                        // Navigate to challenge page with selected options
                        setLocation(`/challenge?coin=${selectedCoin}&type=${selectedChallenge}`);
                      }}
                      className="w-full h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30"
                      data-testid="button-start-predicting"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Predicting
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* HOW IT WORKS */}
            {!selectedCoin && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-bold text-gray-400 mb-4">HOW IT WORKS</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Choose & Predict</h4>
                      <p className="text-xs text-gray-500">
                        Select a coin and predict if the price will go UP or DOWN
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Build Your Streak</h4>
                      <p className="text-xs text-gray-500">
                        Win consecutive predictions to multiply your points up to 5x!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Climb the Leaderboard</h4>
                      <p className="text-xs text-gray-500">
                        Compete with others and unlock exclusive badges
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation('/how-it-works')}
                    variant="outline"
                    className="w-full mt-4 border-white/10 hover:bg-white/5"
                    data-testid="button-how-it-works"
                  >
                    View Full Rules & Scoring
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Daily Reward Modal */}
      <DailyReward 
        isOpen={showDailyReward}
        onClose={handleClaimReward}
        streakDays={currentUser ? 1 : 0}
        rewardPoints={100}
      />
    </>
  );
}
