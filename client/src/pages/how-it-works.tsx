import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Zap, Crown, Target, Clock, TrendingUp, Trophy, Flame, AlertCircle, Info, Lock, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";

export default function HowItWorks() {
  const [, setLocation] = useLocation();

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
            <h1 className="text-lg font-bold">How It Works</h1>
            <p className="text-xs text-muted-foreground">Game Rules & Scoring</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl relative z-10 space-y-8 pb-20">
        
        {/* Game Overview */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to PredictX!</h2>
              <p className="text-muted-foreground leading-relaxed">
                Predict if Bitcoin or Ethereum will go UP or DOWN within a set time window. 
                Correct predictions earn you points based on your current winning streak!
              </p>
            </div>
          </div>
        </Card>

        {/* Challenge Types */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Challenge Types</h3>
          
          {/* Quick Challenge */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Quick Challenge</h4>
                <p className="text-sm text-muted-foreground">5-minute rounds • Fast-paced action</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span><strong className="text-foreground">Duration:</strong> 5 minutes per round</span>
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span><strong className="text-foreground">Points:</strong> 50-200 (based on streak)</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span><strong className="text-foreground">Max Multiplier:</strong> 4x (at 10+ win streak)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span><strong className="text-foreground">Deadline:</strong> Betting closes in the <strong className="text-orange-400">last 60 seconds</strong> of each round</span>
              </li>
            </ul>
          </Card>

          {/* Big Challenge */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Big Challenge</h4>
                <p className="text-sm text-muted-foreground">24-hour rounds • Higher rewards</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span><strong className="text-foreground">Duration:</strong> 24 hours (starts at UTC 00:00:01)</span>
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span><strong className="text-foreground">Points:</strong> 200-1000+ (based on streak)</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span><strong className="text-foreground">Max Multiplier:</strong> 5x (at 10+ win streak)</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span><strong className="text-foreground">Deadline:</strong> Betting is <strong className="text-orange-400">locked from UTC 22:00 to 00:00</strong> (2 hours before round closes)</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span><strong className="text-foreground">One bet per day:</strong> Once you place a prediction, you cannot change it</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Scoring System */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            Streak-Based Scoring
          </h3>
          
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">
              Your points depend on your <strong className="text-foreground">current winning streak</strong>. 
              The more consecutive wins, the higher the multiplier!
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">0-2 wins</span>
                <span className="text-sm"><strong className="text-cyan-400">1x</strong> multiplier (base points)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">3-4 wins</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm"><strong className="text-orange-400">1.5x</strong> multiplier</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">5-9 wins</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm"><strong className="text-orange-400">2x</strong> multiplier</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <span className="font-medium">10+ wins</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                  <Flame className="w-4 h-4 text-orange-400" />
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm"><strong className="text-orange-400">4x (Quick)</strong> or <strong className="text-orange-400">5x (Big)</strong> multiplier</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">
                <strong>Lost a prediction?</strong> Your streak resets to 0 and you start over!
              </p>
            </div>
          </Card>
        </div>

        {/* Example Scenarios */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Example Scenarios</h3>
          
          <Card className="p-6 space-y-4">
            <div>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Quick Challenge - First Win
              </h4>
              <p className="text-sm text-muted-foreground">
                You have 0 streak → Predict BTC UP → WIN → Earn <strong className="text-cyan-400">50 points</strong> (1x multiplier)
              </p>
            </div>

            <div className="border-t border-border/40 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Quick Challenge - 5 Win Streak
              </h4>
              <p className="text-sm text-muted-foreground">
                You have 4 wins → Predict ETH DOWN → WIN → Earn <strong className="text-orange-400">100 points</strong> (2x multiplier)
              </p>
            </div>

            <div className="border-t border-border/40 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-orange-400" />
                Big Challenge - 10 Win Streak
              </h4>
              <p className="text-sm text-muted-foreground">
                You have 9 wins → Predict BTC UP → WIN → Earn <strong className="text-orange-400">1000 points!</strong> (5x multiplier)
              </p>
            </div>

            <div className="border-t border-border/40 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Streak Reset
              </h4>
              <p className="text-sm text-muted-foreground">
                You have 7 wins → Predict ETH UP → LOSE → Earn <strong className="text-red-400">0 points</strong> • Streak resets to 0
              </p>
            </div>
          </Card>
        </div>

        {/* Tips */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-400" />
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Start with Quick Challenges to build your streak safely</li>
            <li>• Watch the countdown timer - don't get locked out!</li>
            <li>• Big Challenges offer higher rewards but can't be changed once placed</li>
            <li>• Long streaks = massive points, but one wrong prediction resets everything</li>
            <li>• Check the leaderboard to see top players and their scores</li>
          </ul>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => setLocation('/')}
            className="w-full max-w-md h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 shadow-lg shadow-cyan-500/30"
            data-testid="button-start-predicting"
          >
            Start Predicting Now!
          </Button>
        </div>
      </main>
    </div>
  );
}
