'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, Sparkles, Zap, Crown, TrendingUp, Trophy, User, ChevronRight, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { initializeFarcaster } from '@/lib/farcaster';
import { CryptoId, ChallengeType } from '@/lib/types';
import SplashScreen from '@/components/SplashScreen';
import DailyReward from '@/components/DailyReward';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CryptoId | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [prices, setPrices] = useState<{ [key: string]: number }>({ BTC: 0, ETH: 0 });
  const [priceChanges, setPriceChanges] = useState<{ [key: string]: number }>({ BTC: 0, ETH: 0 });
  
  // Daily Reward State
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [streakDays, setStreakDays] = useState(1);
  const [rewardPoints, setRewardPoints] = useState(100);

  // WebSocket connections
  useEffect(() => {
    const btcWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    const ethWs = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

    let btcInitial = 0;
    let ethInitial = 0;

    btcWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      if (btcInitial === 0) btcInitial = price;
      const change = ((price - btcInitial) / btcInitial) * 100;
      setPrices(prev => ({ ...prev, BTC: price }));
      setPriceChanges(prev => ({ ...prev, BTC: change }));
    };

    ethWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      if (ethInitial === 0) ethInitial = price;
      const change = ((price - ethInitial) / ethInitial) * 100;
      setPrices(prev => ({ ...prev, ETH: price }));
      setPriceChanges(prev => ({ ...prev, ETH: change }));
    };

    return () => {
      btcWs.close();
      ethWs.close();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 3000);
        });
        const initPromise = initializeFarcaster();
        const context = await Promise.race([initPromise, timeoutPromise]);
        
        // Check daily reward
        if (context?.user) {
          const lastVisit = localStorage.getItem(`lastVisit_${context.user.fid}`);
          const today = new Date().toDateString();
          
          if (lastVisit !== today) {
            // Calculate streak
            const lastVisitDate = lastVisit ? new Date(lastVisit) : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            let currentStreak = 1;
            if (lastVisitDate && lastVisitDate.toDateString() === yesterday.toDateString()) {
              // Consecutive day
              const savedStreak = parseInt(localStorage.getItem(`streak_${context.user.fid}`) || '0');
              currentStreak = savedStreak + 1;
            }
            
            // Calculate reward (increases with streak)
            const reward = 100 + (currentStreak - 1) * 50; // 100, 150, 200, 250...
            
            setStreakDays(currentStreak);
            setRewardPoints(reward);
            
            // Save data
            localStorage.setItem(`lastVisit_${context.user.fid}`, today);
            localStorage.setItem(`streak_${context.user.fid}`, currentStreak.toString());
            
            // Show modal after a short delay
            setTimeout(() => {
              setShowDailyReward(true);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStart = () => {
    if (selectedCoin && selectedChallenge) {
      window.location.href = `/predict?coin=${selectedCoin}&type=${selectedChallenge}`;
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

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
            className="flex items-center justify-between mb-8"
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
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-10 h-10 rounded-xl bg-[#1a1f35] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
              >
                <User className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="w-10 h-10 rounded-xl bg-[#1a1f35] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
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
            className="bg-[#1a1f35] border border-cyan-500/30 rounded-3xl p-6 mb-6"
          >
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-1 bg-cyan-500 rounded-full" />
              <div className={`flex-1 h-1 rounded-full ${selectedCoin ? 'bg-cyan-500' : 'bg-white/10'}`} />
              <div className={`flex-1 h-1 rounded-full ${selectedCoin && selectedChallenge ? 'bg-cyan-500' : 'bg-white/10'}`} />
            </div>

            {/* Step 1: Choose Coin */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-white">Choose Your Coin</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bitcoin */}
                <motion.button
                  onClick={() => setSelectedCoin('bitcoin')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedCoin === 'bitcoin'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-orange-500/30'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                          <Bitcoin className="w-7 h-7 text-white" strokeWidth={2.5} />
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
                          ${prices.BTC > 0 ? prices.BTC.toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3 h-3" />
                          Live
                        </div>
                      </div>
                      {priceChanges.BTC !== 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          priceChanges.BTC >= 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {priceChanges.BTC >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(priceChanges.BTC).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>

                {/* Ethereum */}
                <motion.button
                  onClick={() => setSelectedCoin('ethereum')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedCoin === 'ethereum'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-cyan-500/30'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                          </svg>
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
                          ${prices.ETH > 0 ? prices.ETH.toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3 h-3" />
                          Live
                        </div>
                      </div>
                      {priceChanges.ETH !== 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          priceChanges.ETH >= 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {priceChanges.ETH >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(priceChanges.ETH).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Step 2: Choose Challenge */}
            <AnimatePresence>
              {selectedCoin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <h2 className="text-xl font-bold text-white">Choose Challenge</h2>
                  </div>

                  <div className="space-y-3">
                    {/* Quick Challenge */}
                    <motion.button
                      onClick={() => setSelectedChallenge('quick')}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left rounded-xl border-2 transition-all ${
                        selectedChallenge === 'quick'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-[#111827] hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-cyan-500" />
                            <span className="text-lg font-bold text-white">Quick Challenge</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-500">50-200</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">⏱️ 5 minutes</span>
                          <span className="text-gray-400">⚡ Speed bonus: 10s</span>
                        </div>
                      </div>
                    </motion.button>

                    {/* Big Challenge */}
                    <motion.button
                      onClick={() => setSelectedChallenge('big')}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left rounded-xl border-2 transition-all ${
                        selectedChallenge === 'big'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-[#111827] hover:border-orange-500/30'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-orange-500" />
                            <span className="text-lg font-bold text-white">Big Challenge</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-500">200-1K+</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">⏱️ 24 hours</span>
                          <span className="text-gray-400">👑 Speed bonus: 60s</span>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Button */}
            <AnimatePresence>
              {selectedCoin && selectedChallenge && (
                <motion.button
                  onClick={handleStart}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Predicting
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1f35] border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-3">HOW IT WORKS</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-500 font-bold text-sm">1</span>
                </div>
                <div>
                  <div className="text-white font-medium mb-0.5">Choose & Predict</div>
                  <div className="text-sm text-gray-500">Select a coin and predict if the price will go UP or DOWN</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-500 font-bold text-sm">2</span>
                </div>
                <div>
                  <div className="text-white font-medium mb-0.5">Wait & Watch</div>
                  <div className="text-sm text-gray-500">Track live prices and see how your prediction performs</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-500 font-bold text-sm">3</span>
                </div>
                <div>
                  <div className="text-white font-medium mb-0.5">Win Points</div>
                  <div className="text-sm text-gray-500">Earn points based on accuracy. Climb the leaderboard!</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Daily Reward Modal */}
      <DailyReward
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
        streakDays={streakDays}
        rewardPoints={rewardPoints}
      />
    </>
  );
}
