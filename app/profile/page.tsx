'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Home, Trophy, TrendingUp, Target, Award, Flame, Clock, CheckCircle2, XCircle, ChevronLeft, BarChart3, Activity } from 'lucide-react';
import { initializeFarcaster } from '@/lib/farcaster';
import { Prediction, UserStats, FarcasterContext } from '@/lib/types';

type TabType = 'active' | 'history' | 'stats';

export default function ProfilePage() {
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [livePrice, setLivePrice] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await initializeFarcaster();
        if (ctx?.user) {
          setContext(ctx);
          
          const [statsRes, predictionsRes] = await Promise.all([
            fetch(`/api/user-stats?fid=${ctx.user.fid}`),
            fetch(`/api/predict?fid=${ctx.user.fid}`)
          ]);
          
          const statsData = await statsRes.json();
          const predictionsData = await predictionsRes.json();
          
          if (statsData.success && statsData.data) {
            setStats(statsData.data.stats || statsData.data);
          } else {
            setStats({
              fid: ctx.user.fid,
              username: ctx.user.username || '',
              displayName: ctx.user.displayName || '',
              pfpUrl: ctx.user.pfpUrl || '',
              totalScore: 0,
              quickScore: 0,
              bigScore: 0,
              totalPredictions: 0,
              quickPredictions: 0,
              bigPredictions: 0,
              wonPredictions: 0,
              lostPredictions: 0,
              pendingPredictions: 0,
              winRate: 0,
              averageAccuracy: 0,
              currentStreak: 0,
              longestStreak: 0,
              rank: 0,
              quickRank: 0,
              bigRank: 0,
              badges: [],
            });
          }
          
          if (predictionsData.success) {
            setPredictions(predictionsData.data || []);
            setActivePrediction(predictionsData.activePrediction || null);
          }
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!activePrediction) return;
    const updateTimer = () => {
      const remaining = activePrediction.expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeRemaining('Checking...');
        fetch('/api/check-results').then(() => {
          setTimeout(() => window.location.reload(), 2000);
        });
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        if (minutes > 60) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          setTimeRemaining(`${hours}h ${mins}m`);
        } else {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activePrediction]);

  // Live Price WebSocket for active prediction
  useEffect(() => {
    if (!activePrediction) return;
    
    const coinId = activePrediction.cryptoId || activePrediction.coinId;
    const symbol = coinId === 'bitcoin' ? 'btcusdt' : 'ethusdt';
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      setLivePrice(price);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [activePrediction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!context?.user) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-cyan-500" />
          </div>
          <div className="text-white text-lg font-bold mb-2">Not Connected</div>
          <div className="text-gray-400 mb-4">Open in Farcaster to view profile</div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const completedPredictions = predictions.filter(p => p.status !== 'pending');
  const winRate = stats && stats.totalPredictions > 0 
    ? ((stats.wonPredictions / stats.totalPredictions) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-[#1a1f35]/80 backdrop-blur-md border-b border-cyan-500/20 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <button
              onClick={() => window.location.href = '/leaderboard'}
              className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
            >
              <Trophy className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f35] border border-cyan-500/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            {context.user.pfpUrl ? (
              <img 
                src={context.user.pfpUrl} 
                alt="" 
                className="w-20 h-20 rounded-2xl border-2 border-cyan-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{context.user.displayName}</h2>
              <p className="text-gray-400">@{context.user.username}</p>
            </div>
            {stats && stats.rank > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Global Rank</div>
                <div className="text-2xl font-bold text-orange-500">#{stats.rank}</div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-cyan-500" />
                <div className="text-xs text-gray-500">Total Score</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats?.totalScore.toLocaleString() || 0}</div>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-500" />
                <div className="text-xs text-gray-500">Win Rate</div>
              </div>
              <div className="text-2xl font-bold text-green-500">{winRate}%</div>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <div className="text-xs text-gray-500">Streak</div>
              </div>
              <div className="text-2xl font-bold text-orange-500">{stats?.currentStreak || 0}</div>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <div className="text-xs text-gray-500">Predictions</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats?.totalPredictions || 0}</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10'
            }`}
          >
            Stats
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activePrediction ? (
              <div className="bg-[#1a1f35] border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Active Prediction</h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/20">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold text-sm">{timeRemaining}</span>
                  </div>
                </div>
                
                {/* Live Price Display */}
                <div className="bg-[#111827] rounded-xl p-5 mb-4 border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 font-semibold">{(activePrediction.cryptoId || activePrediction.coinId).toUpperCase()}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-500">LIVE</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      activePrediction.direction === 'up' 
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {activePrediction.direction === 'up' ? '↑ UP' : '↓ DOWN'}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-1">
                    ${livePrice > 0 ? livePrice.toLocaleString(undefined, {maximumFractionDigits: 2}) : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-500">Current Price</div>
                </div>

                {/* Prediction Details */}
                <div className="bg-[#111827] rounded-xl p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="text-sm text-gray-400">Starting Price</div>
                      <div className="text-lg font-bold text-white">
                        ${activePrediction.startPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </div>
                    </div>
                    
                    {livePrice > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">Price Change</div>
                          <div className={`text-lg font-bold ${
                            livePrice > activePrediction.startPrice ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {livePrice > activePrediction.startPrice ? '+' : ''}
                            ${(livePrice - activePrediction.startPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">Percentage</div>
                          <div className={`text-lg font-bold ${
                            livePrice > activePrediction.startPrice ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {((livePrice - activePrediction.startPrice) / activePrediction.startPrice * 100).toFixed(3)}%
                          </div>
                        </div>

                        {/* Win/Loss Indicator */}
                        <div className={`mt-4 p-3 rounded-xl text-center font-bold ${
                          (activePrediction.direction === 'up' && livePrice > activePrediction.startPrice) ||
                          (activePrediction.direction === 'down' && livePrice < activePrediction.startPrice)
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {(activePrediction.direction === 'up' && livePrice > activePrediction.startPrice) ||
                           (activePrediction.direction === 'down' && livePrice < activePrediction.startPrice)
                            ? '🎯 Currently Winning!'
                            : '⏳ Currently Losing'}
                        </div>
                      </>
                    )}
                    
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-500 mb-1">Challenge Type</div>
                      <div className="text-sm font-semibold text-white">
                        {activePrediction.challengeType === 'quick' ? '⚡ Quick (5 minutes)' : '👑 Big (24 hours)'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 mb-4">
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <Activity className="w-4 h-4" />
                    <span>
                      You predicted price will go <strong>{activePrediction.direction === 'up' ? 'UP' : 'DOWN'}</strong> from ${activePrediction.startPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={async () => {
                    try {
                      const sdk = (await import('@farcaster/frame-sdk')).default;
                      const coinName = activePrediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
                      const text = `🎯 I predicted ${coinName} will go ${activePrediction.direction === 'up' ? 'UP' : 'DOWN'} from $${activePrediction.startPrice.toLocaleString()}!\n\nJoin me on PredictX!`;
                      
                      await sdk.actions.composeCast({
                        text,
                        embeds: ['https://predictx-gilt.vercel.app']
                      });
                    } catch (error) {
                      console.error('Share error:', error);
                    }
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  Share on Farcaster
                </button>
              </div>
            ) : (
              <div className="bg-[#1a1f35] border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Predictions</h3>
                <p className="text-gray-400 mb-6">Start predicting to see your active challenges here</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl"
                >
                  Make a Prediction
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {completedPredictions.length === 0 ? (
              <div className="bg-[#1a1f35] border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No History Yet</h3>
                <p className="text-gray-400">Your completed predictions will appear here</p>
              </div>
            ) : (
              completedPredictions.map((prediction, index) => {
                const priceChange = (prediction.endPrice || 0) - (prediction.startPrice || prediction.currentPrice);
                const priceChangePercent = ((priceChange / (prediction.startPrice || prediction.currentPrice)) * 100);
                
                return (
                  <div
                    key={prediction.id}
                    className="bg-[#1a1f35] border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          prediction.status === 'won' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {prediction.status === 'won' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold flex items-center gap-2">
                            {(prediction.cryptoId || prediction.coinId).toUpperCase()}
                            <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                              prediction.direction === 'up' 
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {prediction.direction === 'up' ? '↑ UP' : '↓ DOWN'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{prediction.challengeType === 'quick' ? 'Quick (5m)' : 'Big (24h)'} Challenge</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          prediction.status === 'won' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {prediction.status === 'won' ? '+' : ''}{prediction.earnedPoints || prediction.score || 0}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    <div className="bg-[#111827] rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Start Price</span>
                        <span className="text-white font-semibold">${(prediction.startPrice || prediction.currentPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">End Price</span>
                        <span className="text-white font-semibold">${(prediction.endPrice || prediction.targetPrice || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                        <span className="text-gray-400">Change</span>
                        <span className={`font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(3)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-[#1a1f35] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Challenge Stats</h3>
              
              <div className="space-y-4">
                <div className="bg-[#111827] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-500" />
                      <span className="text-white font-semibold">Quick Challenges</span>
                    </div>
                    <span className="text-cyan-500 font-bold">{stats?.quickScore || 0} pts</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {stats?.quickPredictions || 0} predictions
                  </div>
                </div>

                <div className="bg-[#111827] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-500" />
                      <span className="text-white font-semibold">Big Challenges</span>
                    </div>
                    <span className="text-orange-500 font-bold">{stats?.bigScore || 0} pts</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {stats?.bigPredictions || 0} predictions
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f35] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Won Predictions</span>
                  <span className="text-green-500 font-bold">{stats?.wonPredictions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lost Predictions</span>
                  <span className="text-red-500 font-bold">{stats?.lostPredictions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Longest Streak</span>
                  <span className="text-orange-500 font-bold">{stats?.longestStreak || 0} 🔥</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1f35]/95 backdrop-blur-md border-t border-white/10 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Make a Prediction
          </button>
        </div>
      </div>
    </div>
  );
}
