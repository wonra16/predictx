import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import sdk from "@farcaster/frame-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { Home, Trophy, TrendingUp, TrendingDown, Clock, Target, Share2, Zap, Crown, Flame } from "lucide-react";
import { RoundCounter } from "@/components/predictx/round-counter";
import type { Prediction, UserStats, CryptoPrice, ApiResponse } from "@shared/schema";
import logoUrl from "@assets/generated_images/PredictX_crypto_prediction_logo_ebffbafd.png";
import { getCurrentUser, type FarcasterUser } from "@/lib/farcaster";

type TabType = 'quick' | 'big' | 'history' | 'stats';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('quick');
  const [showWinningPopup, setShowWinningPopup] = useState(false);
  const [winningPrediction, setWinningPrediction] = useState<Prediction | null>(null);
  const [currentUser, setCurrentUser] = useState<FarcasterUser | null>(null);
  
  // Fetch user info from Farcaster SDK
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);
  
  // Fetch ALL predictions (we'll filter client-side)
  const { data: predictionsData, isLoading: predictionsLoading } = useQuery<ApiResponse<Prediction[]>>({
    queryKey: ['/api/user/predictions', currentUser?.fid],
    enabled: !!currentUser,
    refetchInterval: 5000, // Check every 5 seconds for prediction updates
  });
  
  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery<ApiResponse<UserStats>>({
    queryKey: ['/api/stats', currentUser?.fid],
    enabled: !!currentUser,
    refetchInterval: 5000, // Update stats every 5 seconds
  });
  
  // Fetch current prices for live comparison - REAL-TIME
  const { data: pricesData } = useQuery<ApiResponse<CryptoPrice[]>>({
    queryKey: ['/api/prices'],
    refetchInterval: 1000, // 1 second for real-time price updates
  });
  
  const allPredictions = predictionsData?.data || [];
  const stats = statsData?.data || null;
  const prices = pricesData?.data || [];
  
  // Filter predictions by challenge type and status
  const quickPending = allPredictions.filter(p => p.challengeType === 'quick' && p.status === 'pending')[0] || null;
  const bigPending = allPredictions.filter(p => p.challengeType === 'big' && p.status === 'pending')[0] || null;
  const historyPredictions = allPredictions.filter(p => p.status !== 'pending');
  
  // Calculate win/loss status for active prediction
  const getWinLossStatus = (prediction: Prediction | null) => {
    if (!prediction) return null;
    
    const currentPrice = prices.find(p => p.id === prediction.coinId)?.currentPrice;
    if (!currentPrice) return null;
    
    const priceDiff = currentPrice - prediction.startPrice;
    const isWinning = (prediction.direction === 'up' && priceDiff > 0) || 
                     (prediction.direction === 'down' && priceDiff < 0);
    
    return {
      isWinning,
      currentPrice,
      priceDiff,
      percentage: ((priceDiff / prediction.startPrice) * 100).toFixed(3)
    };
  };
  
  // Check for winning predictions and show popup (ONCE per win)
  useEffect(() => {
    const checkForWin = () => {
      if (historyPredictions.length > 0) {
        const latestWin = historyPredictions.find(p => p.status === 'won');
        if (latestWin) {
          const shownWins = JSON.parse(localStorage.getItem('shownWinPopups') || '[]');
          
          // Only show if this win hasn't been shown before
          if (!shownWins.includes(latestWin.id)) {
            setWinningPrediction(latestWin);
            setShowWinningPopup(true);
            
            // Mark this win as shown
            shownWins.push(latestWin.id);
            localStorage.setItem('shownWinPopups', JSON.stringify(shownWins));
          }
        }
      }
    };
    
    checkForWin();
  }, [historyPredictions]);
  
  // Calculate time remaining
  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Checking...';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    
    return `${minutes}m ${seconds}s`;
  };
  
  // Render active prediction card
  const renderActivePrediction = (prediction: Prediction | null, type: 'quick' | 'big') => {
    if (!prediction) {
      return (
        <Card className="p-12 text-center backdrop-blur-md bg-card/30 border-border/40">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No Active {type === 'quick' ? 'Quick' : 'Big'} Prediction</h3>
          <p className="text-muted-foreground mb-6">
            You don't have an active {type === 'quick' ? '5-minute' : '24-hour'} prediction.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={() => setLocation('/')}
            data-testid="button-make-prediction"
          >
            <Home className="w-5 h-5 mr-2" />
            Make a Prediction
          </Button>
        </Card>
      );
    }
    
    const winLossStatus = getWinLossStatus(prediction);
    
    return (
      <>
        {/* Active Prediction Card */}
        <Card className="p-6 backdrop-blur-md bg-card/50 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Active 
              {type === 'quick' ? (
                <>
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Quick
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 text-orange-400" />
                  Big
                </>
              )} 
              Prediction
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold" data-testid="text-time-remaining">
                {getTimeRemaining(prediction.expiresAt)}
              </span>
            </div>
          </div>
          
          {/* Coin & Direction */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {prediction.coinId === 'bitcoin' ? (
                <div className="w-12 h-12 rounded-2xl bg-bitcoin/20 flex items-center justify-center">
                  <SiBitcoin className="w-7 h-7 text-bitcoin" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-ethereum/20 flex items-center justify-center">
                  <SiEthereum className="w-7 h-7 text-ethereum" />
                </div>
              )}
              <div>
                <p className="text-xl font-bold">
                  {prediction.coinId === 'bitcoin' ? 'BITCOIN' : 'ETHEREUM'}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success font-semibold">Live</span>
                </div>
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-full ${
              prediction.direction === 'up' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
            }`}>
              <span className="text-sm font-bold">
                {prediction.direction === 'up' ? '↑ UP' : '↓ DOWN'}
              </span>
            </div>
          </div>
          
          {/* Current Price */}
          <div className="p-4 rounded-xl bg-background/50 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-3xl font-bold font-mono" data-testid="text-current-price">
              ${winLossStatus?.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {winLossStatus && (
              <div className={`flex items-center gap-1 mt-1 ${
                parseFloat(winLossStatus.percentage) >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {parseFloat(winLossStatus.percentage) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">
                  {winLossStatus.percentage}% (${Math.abs(winLossStatus.priceDiff).toFixed(2)})
                </span>
              </div>
            )}
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Starting Price</p>
              <p className="text-lg font-semibold font-mono" data-testid="text-starting-price">
                ${prediction.startPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price Change</p>
              <p className={`text-lg font-semibold font-mono ${
                winLossStatus && winLossStatus.priceDiff >= 0 ? 'text-success' : 'text-destructive'
              }`} data-testid="text-price-change">
                ${winLossStatus?.priceDiff.toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Win/Loss Status */}
          {winLossStatus && (
            <div className={`p-4 rounded-xl ${
              winLossStatus.isWinning ? 'bg-success/20' : 'bg-destructive/20'
            }`}>
              <p className={`text-center font-bold ${
                winLossStatus.isWinning ? 'text-success' : 'text-destructive'
              }`} data-testid="text-win-loss-status">
                <div className="flex items-center gap-2">
                  {winLossStatus.isWinning ? (
                    <>
                      <Target className="w-4 h-4 text-green-400" />
                      Currently Winning!
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-orange-400" />
                      Currently Losing
                    </>
                  )}
                </div>
              </p>
            </div>
          )}
        </Card>
      </>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="PredictX" className="w-10 h-10 rounded-xl shadow-lg" />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PredictX
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="default" variant="ghost" onClick={() => setLocation('/')} data-testid="button-home" className="gap-2">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button size="default" variant="ghost" onClick={() => setLocation('/leaderboard')} data-testid="button-leaderboard" className="gap-2">
              <Trophy className="h-5 w-5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* User Profile Header */}
          <Card className="p-6 backdrop-blur-md bg-card/30 border-border/40">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="w-20 h-20 ring-2 ring-cyan-500/30">
                <AvatarImage src={currentUser?.pfpUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.fid || 0}`} />
                <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{currentUser?.displayName || 'Demo User'}</h2>
                <p className="text-muted-foreground">@{currentUser?.username || 'demo_user'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/50 border border-border/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-cyan-500" />
                  <p className="text-xs text-muted-foreground">Total Score</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.totalScore || 0}</p>
              </div>
              
              <div className="bg-card/50 border border-border/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <p className="text-2xl font-bold text-emerald-500">{stats?.winRate.toFixed(1) || '0.0'}%</p>
              </div>
              
              <div className="bg-card/50 border border-border/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <p className="text-2xl font-bold text-orange-500">{stats?.currentStreak || 0}</p>
              </div>
              
              <div className="bg-card/50 border border-border/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Predictions</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.totalPredictions || 0}</p>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <div className="grid grid-cols-4 gap-2 p-1 bg-muted/30 rounded-2xl backdrop-blur-md">
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'quick'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('quick')}
              data-testid="tab-quick"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Quick</span>
            </button>
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'big'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('big')}
              data-testid="tab-big"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Big</span>
            </button>
            <button
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('history')}
              data-testid="tab-history"
            >
              History
            </button>
            <button
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('stats')}
              data-testid="tab-stats"
            >
              Stats
            </button>
          </div>
          
          {/* Quick Tab Content */}
          {activeTab === 'quick' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Round Counter */}
              <RoundCounter challengeType="quick" />
              
              {/* Active Quick Prediction */}
              {renderActivePrediction(quickPending, 'quick')}
            </div>
          )}
          
          {/* Big Tab Content */}
          {activeTab === 'big' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Round Counter */}
              <RoundCounter challengeType="big" />
              
              {/* Active Big Prediction */}
              {renderActivePrediction(bigPending, 'big')}
            </div>
          )}
          
          {/* History Tab Content */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {predictionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : historyPredictions.length > 0 ? (
                historyPredictions.map((prediction) => (
                  <Card key={prediction.id} className="p-4 backdrop-blur-md bg-card/50 border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {prediction.coinId === 'bitcoin' ? (
                          <div className="w-10 h-10 rounded-lg bg-bitcoin/20 flex items-center justify-center">
                            <SiBitcoin className="w-5 h-5 text-bitcoin" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-ethereum/20 flex items-center justify-center">
                            <SiEthereum className="w-5 h-5 text-ethereum" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">
                            {prediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {prediction.challengeType === 'quick' ? (
                                <Zap className="w-3 h-3" />
                              ) : (
                                <Crown className="w-3 h-3" />
                              )}
                              {prediction.challengeType === 'quick' ? 'Quick' : 'Big'} •{' '}
                            </div>
                            {prediction.direction === 'up' ? '↑ UP' : '↓ DOWN'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {prediction.status === 'won' && (
                          <div className="px-3 py-1 rounded-full text-sm font-semibold bg-success/20 text-success">
                            ✓ Won
                          </div>
                        )}
                        {prediction.status === 'lost' && (
                          <div className="px-3 py-1 rounded-full text-sm font-semibold bg-destructive/20 text-destructive">
                            ✗ Lost
                          </div>
                        )}
                        {prediction.score && prediction.score > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            +{prediction.score} pts
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center backdrop-blur-md bg-card/30 border-border/40">
                  <p className="text-muted-foreground">No prediction history yet.</p>
                </Card>
              )}
            </div>
          )}
          
          {/* Stats Tab Content */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : stats ? (
                <>
                  {/* Score Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-6 text-center backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Total Score</p>
                      <p className="text-3xl font-bold font-mono">{stats.totalScore}</p>
                    </Card>
                    <Card className="p-6 text-center backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Quick Score</p>
                      <p className="text-3xl font-bold font-mono">{stats.quickScore}</p>
                    </Card>
                    <Card className="p-6 text-center backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Big Score</p>
                      <p className="text-3xl font-bold font-mono">{stats.bigScore}</p>
                    </Card>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
                      <p className="text-2xl font-bold">{stats.totalPredictions}</p>
                    </Card>
                    <Card className="p-6 backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                      <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                    </Card>
                    <Card className="p-6 backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                      <div className="flex items-center gap-2 justify-center">
                        <Flame className="w-6 h-6 text-orange-400" />
                        <p className="text-2xl font-bold">{stats.currentStreak}</p>
                      </div>
                    </Card>
                    <Card className="p-6 backdrop-blur-md bg-card/50 border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
                      <p className="text-2xl font-bold">🏆 {stats.longestStreak}</p>
                    </Card>
                  </div>
                  
                  {/* Rank */}
                  <Card className="p-6 text-center backdrop-blur-md bg-gradient-to-br from-primary/10 to-secondary/10 border-border/40">
                    <p className="text-sm text-muted-foreground mb-2">Your Rank</p>
                    <p className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      #{stats.rank || '--'}
                    </p>
                  </Card>
                </>
              ) : (
                <Card className="p-12 text-center backdrop-blur-md bg-card/30 border-border/40">
                  <p className="text-muted-foreground">No stats available yet.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Winning Popup */}
      <Dialog open={showWinningPopup} onOpenChange={setShowWinningPopup}>
        <DialogContent className="max-w-md backdrop-blur-xl bg-background/95 border-2 border-success/30">
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              You won your prediction!
            </DialogDescription>
          </DialogHeader>
          
          {winningPrediction && (
            <div className="space-y-4 py-4">
              {/* Coin Display */}
              <div className="flex items-center justify-center gap-3">
                {winningPrediction.coinId === 'bitcoin' ? (
                  <SiBitcoin className="w-12 h-12 text-orange-400" />
                ) : (
                  <SiEthereum className="w-12 h-12 text-blue-400" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {winningPrediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum'}
                  </p>
                  <p className="text-lg font-bold">
                    <div className="flex items-center gap-1">
                      {winningPrediction.direction === 'up' ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          UP
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          DOWN
                        </>
                      )}
                    </div>
                  </p>
                </div>
              </div>
              
              {/* Score Display */}
              <Card className="p-6 text-center bg-success/10 border-success/30">
                <p className="text-sm text-muted-foreground mb-1">Points Earned</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-success to-green-400 bg-clip-text text-transparent">
                  +{winningPrediction.score || 0}
                </p>
              </Card>
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={async () => {
                try {
                  // Build dynamic OG image URL with victory data
                  const params = new URLSearchParams();
                  if (winningPrediction) {
                    params.set('coin', winningPrediction.coinId);
                    params.set('direction', winningPrediction.direction);
                    params.set('score', winningPrediction.score?.toString() || '0');
                  }
                  const embedUrl = `${window.location.origin}/api/og-embed?${params.toString()}`;
                  
                  const shareText = winningPrediction 
                    ? `I just won on PredictX!\n\nPredicted ${winningPrediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} ${winningPrediction.direction === 'up' ? '↑ UP' : '↓ DOWN'}\nEarned +${winningPrediction.score} points!\n\nJoin me on PredictX!`
                    : 'I just won on PredictX!';
                  
                  // Try Farcaster SDK first (works in mini app)
                  if (sdk?.actions?.composeCast) {
                    await sdk.actions.composeCast({
                      text: shareText,
                      embeds: [embedUrl]
                    });
                  } else {
                    // Fallback to window.open (web browser)
                    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(embedUrl)}`, '_blank');
                  }
                } catch (error) {
                  console.error('Share error:', error);
                  // Fallback to window.open on error
                  window.open(`https://warpcast.com/`, '_blank');
                }
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30"
              data-testid="button-share-farcaster"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on Farcaster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
