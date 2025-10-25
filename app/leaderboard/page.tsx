'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, User, Crown, Medal, TrendingUp, Flame, Award, ChevronLeft } from 'lucide-react';
import { UserStats } from '@/lib/types';

type LeaderboardType = 'all' | 'quick' | 'big';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardType, setBoardType] = useState<LeaderboardType>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        
        if (data.success) {
          setLeaderboard(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getSortedLeaderboard = () => {
    if (boardType === 'quick') {
      return [...leaderboard].sort((a, b) => b.quickScore - a.quickScore);
    } else if (boardType === 'big') {
      return [...leaderboard].sort((a, b) => b.bigScore - a.bigScore);
    }
    return leaderboard;
  };

  const getScoreForType = (user: UserStats) => {
    if (boardType === 'quick') return user.quickScore;
    if (boardType === 'big') return user.bigScore;
    return user.totalScore;
  };

  const sortedBoard = getSortedLeaderboard();

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-[#1a1f35]/80 backdrop-blur-md border-b border-cyan-500/20 sticky top-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                <p className="text-sm text-gray-500">Top Predictors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setBoardType('all')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              Overall
            </div>
          </button>
          <button
            onClick={() => setBoardType('quick')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'quick'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quick
            </div>
          </button>
          <button
            onClick={() => setBoardType('big')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'big'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-[#1a1f35] text-gray-400 border border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              Big
            </div>
          </button>
        </div>

        {/* Top 3 Podium */}
        {!loading && sortedBoard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="grid grid-cols-3 gap-3 items-end">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-500/30 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                {sortedBoard[1].pfpUrl && (
                  <img src={sortedBoard[1].pfpUrl} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-500" />
                )}
                <div className="text-white font-bold text-sm truncate">{sortedBoard[1].displayName}</div>
                <div className="text-gray-400 text-xs truncate mb-2">@{sortedBoard[1].username}</div>
                <div className="text-xl font-bold text-white">{getScoreForType(sortedBoard[1]).toLocaleString()}</div>
                <div className="text-gray-400 text-xs">points</div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50 text-center transform scale-105 shadow-lg shadow-orange-500/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                {sortedBoard[0].pfpUrl && (
                  <img src={sortedBoard[0].pfpUrl} alt="" className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-orange-500" />
                )}
                <div className="text-white font-bold text-base truncate">{sortedBoard[0].displayName}</div>
                <div className="text-orange-300 text-xs truncate mb-2">@{sortedBoard[0].username}</div>
                <div className="text-2xl font-bold text-white">{getScoreForType(sortedBoard[0]).toLocaleString()}</div>
                <div className="text-orange-300 text-xs">points</div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-amber-700/20 to-amber-800/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-amber-700/30 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7 text-white" />
                </div>
                {sortedBoard[2].pfpUrl && (
                  <img src={sortedBoard[2].pfpUrl} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-amber-700" />
                )}
                <div className="text-white font-bold text-sm truncate">{sortedBoard[2].displayName}</div>
                <div className="text-amber-300 text-xs truncate mb-2">@{sortedBoard[2].username}</div>
                <div className="text-xl font-bold text-white">{getScoreForType(sortedBoard[2]).toLocaleString()}</div>
                <div className="text-amber-300 text-xs">points</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1f35] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#111827] px-4 py-3 border-b border-white/10">
            <div className="grid grid-cols-12 gap-3 text-gray-500 text-xs font-semibold uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Streak</div>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Trophy className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-gray-400">Loading leaderboard...</div>
              </div>
            ) : sortedBoard.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="text-white text-lg font-bold mb-2">No Rankings Yet</div>
                <div className="text-gray-500">Be the first to make predictions!</div>
              </div>
            ) : (
              sortedBoard.map((user, index) => {
                const winRate = user.totalPredictions > 0 
                  ? ((user.wonPredictions / user.totalPredictions) * 100).toFixed(1)
                  : '0.0';

                return (
                  <motion.div
                    key={user.fid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-4 py-3.5 hover:bg-white/5 transition-all ${
                      index < 3 ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className={`font-bold text-center ${
                          index === 0 ? 'text-orange-500 text-lg' :
                          index === 1 ? 'text-gray-400 text-base' :
                          index === 2 ? 'text-amber-700 text-base' :
                          'text-gray-600 text-sm'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Player */}
                      <div className="col-span-5 flex items-center gap-3">
                        {user.pfpUrl ? (
                          <img 
                            src={user.pfpUrl} 
                            alt="" 
                            className="w-10 h-10 rounded-xl border border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-cyan-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate">{user.displayName}</div>
                          <div className="text-gray-500 text-xs truncate">@{user.username}</div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-2 text-right">
                        <div className="text-white font-bold">{getScoreForType(user).toLocaleString()}</div>
                        <div className="text-gray-500 text-xs">pts</div>
                      </div>

                      {/* Win Rate */}
                      <div className="col-span-2 text-right">
                        <div className={`font-bold ${
                          parseFloat(winRate) >= 70 ? 'text-green-500' :
                          parseFloat(winRate) >= 50 ? 'text-yellow-500' :
                          'text-gray-400'
                        }`}>
                          {winRate}%
                        </div>
                        <div className="text-gray-500 text-xs">
                          {user.wonPredictions}/{user.totalPredictions}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="col-span-2 text-right">
                        {user.currentStreak > 0 ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-orange-500 font-bold text-sm">{user.currentStreak}</span>
                          </div>
                        ) : (
                          <div className="text-gray-600 font-bold">0</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1f35]/95 backdrop-blur-md border-t border-white/10 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl border border-white/10 hover:border-cyan-500/30 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex-1 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl border border-white/10 hover:border-cyan-500/30 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
