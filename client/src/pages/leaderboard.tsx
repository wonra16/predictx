import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Home, User, Flame, Zap } from "lucide-react";
import type { LeaderboardEntry, ApiResponse } from "@shared/schema";

type LeaderboardType = 'total' | 'quick' | 'big';

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [boardType, setBoardType] = useState<LeaderboardType>('total');
  
  const { data, isLoading, error } = useQuery<ApiResponse<LeaderboardEntry[]>>({
    queryKey: ['/api/leaderboard', boardType],
    staleTime: 0,
    refetchOnMount: true,
  });
  
  const leaderboard = data?.data || [];
  
  const getScoreForType = (entry: LeaderboardEntry) => {
    if (boardType === 'quick') {
      return entry.quickScore;
    }
    if (boardType === 'big') {
      return entry.bigScore;
    }
    return entry.totalScore;
  };
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Top Predictors</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 max-w-3xl relative z-10">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setBoardType('total')}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'total'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 border-2 border-transparent'
                : 'bg-card border-2 border-border/40 text-muted-foreground hover:border-cyan-500/30'
            }`}
            data-testid="button-filter-total"
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              Overall
            </div>
          </button>
          <button
            onClick={() => setBoardType('quick')}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'quick'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 border-2 border-transparent'
                : 'bg-card border-2 border-border/40 text-muted-foreground hover:border-cyan-500/30'
            }`}
            data-testid="button-filter-quick"
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Quick
            </div>
          </button>
          <button
            onClick={() => setBoardType('big')}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              boardType === 'big'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 border-2 border-transparent'
                : 'bg-card border-2 border-border/40 text-muted-foreground hover:border-cyan-500/30'
            }`}
            data-testid="button-filter-big"
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              Big
            </div>
          </button>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        )}
        
        {/* Top 3 Podium (only if 3+ users) */}
        {!isLoading && leaderboard.length >= 3 && (
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
                data-testid="card-rank-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-gray-500">
                  <AvatarImage src={leaderboard[1].pfpUrl || undefined} alt={leaderboard[1].displayName} />
                  <AvatarFallback>{leaderboard[1].displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-white font-bold text-sm truncate">{leaderboard[1].displayName}</div>
                <div className="text-gray-400 text-xs truncate mb-2">@{leaderboard[1].username}</div>
                <div className="text-xl font-bold text-white">{getScoreForType(leaderboard[1]).toLocaleString()}</div>
                <div className="text-gray-400 text-xs">points</div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50 text-center transform scale-105 shadow-lg shadow-orange-500/20"
                data-testid="card-rank-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-orange-500">
                  <AvatarImage src={leaderboard[0].pfpUrl || undefined} alt={leaderboard[0].displayName} />
                  <AvatarFallback>{leaderboard[0].displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-white font-bold text-base truncate">{leaderboard[0].displayName}</div>
                <div className="text-orange-300 text-xs truncate mb-2">@{leaderboard[0].username}</div>
                <div className="text-2xl font-bold text-white">{getScoreForType(leaderboard[0]).toLocaleString()}</div>
                <div className="text-orange-300 text-xs">points</div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-amber-700/20 to-amber-800/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-amber-700/30 text-center"
                data-testid="card-rank-3"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-amber-700">
                  <AvatarImage src={leaderboard[2].pfpUrl || undefined} alt={leaderboard[2].displayName} />
                  <AvatarFallback>{leaderboard[2].displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-white font-bold text-sm truncate">{leaderboard[2].displayName}</div>
                <div className="text-gray-400 text-xs truncate mb-2">@{leaderboard[2].username}</div>
                <div className="text-xl font-bold text-white">{getScoreForType(leaderboard[2]).toLocaleString()}</div>
                <div className="text-gray-400 text-xs">points</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* All Rankings (for less than 3 users) */}
        {!isLoading && leaderboard.length > 0 && leaderboard.length < 3 && (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.fid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 hover-elevate backdrop-blur-md bg-card/50 border-border/40"
                  data-testid={`row-leaderboard-${entry.fid}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    </div>
                    
                    {/* Avatar & Name */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.pfpUrl || undefined} alt={entry.displayName} />
                      <AvatarFallback>
                        {entry.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" data-testid={`text-name-${entry.fid}`}>
                        {entry.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{entry.username}
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono" data-testid={`text-score-${entry.fid}`}>
                        {getScoreForType(entry).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-xs text-muted-foreground">
                          {entry.wonPredictions}/{entry.totalPredictions}
                        </span>
                        {entry.currentStreak > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <Flame className="w-3 h-3" />
                            {entry.currentStreak}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Rest of Leaderboard (for 4+ users) */}
        {!isLoading && leaderboard.length > 3 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Other Predictors
              </h2>
            </div>
            {leaderboard.slice(3).map((entry, index) => (
              <motion.div
                key={entry.fid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card
                  className="p-4 hover-elevate backdrop-blur-md bg-card/50 border-border/40"
                  data-testid={`row-leaderboard-${entry.fid}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    </div>
                    
                    {/* Avatar & Name */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.pfpUrl || undefined} alt={entry.displayName} />
                      <AvatarFallback>
                        {entry.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" data-testid={`text-name-${entry.fid}`}>
                        {entry.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{entry.username}
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono" data-testid={`text-score-${entry.fid}`}>
                        {getScoreForType(entry).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-xs text-muted-foreground">
                          {entry.wonPredictions}/{entry.totalPredictions}
                        </span>
                        {entry.currentStreak > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <Flame className="w-3 h-3" />
                            {entry.currentStreak}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && leaderboard.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-2">No Rankings Yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to make a prediction and claim the top spot!
            </p>
          </Card>
        )}
        
        {/* Bottom spacing for fixed navigation */}
        <div className="h-20" />
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-2 gap-2 py-3">
            <button
              onClick={() => setLocation('/')}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-accent transition-colors"
              data-testid="button-nav-home"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => setLocation('/profile')}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-accent transition-colors"
              data-testid="button-nav-profile"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-semibold">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
