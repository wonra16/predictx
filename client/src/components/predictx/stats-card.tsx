import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, TrendingUp } from "lucide-react";
import type { UserStats } from "@shared/schema";

interface StatsCardProps {
  stats: UserStats | null;
  loading?: boolean;
}

export function StatsCard({ stats, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card data-testid="card-stats-loading">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card data-testid="card-stats-empty">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Make your first prediction!</p>
        </CardContent>
      </Card>
    );
  }
  
  const statItems = [
    {
      icon: Trophy,
      label: 'Total Score',
      value: stats.totalScore.toLocaleString(),
      color: 'text-primary',
      showStreak: false,
      testId: 'stat-total-score'
    },
    {
      icon: Flame,
      label: 'Streak',
      value: stats.currentStreak,
      color: 'text-orange-500',
      showStreak: stats.currentStreak > 0,
      testId: 'stat-streak'
    },
    {
      icon: Target,
      label: 'Accuracy',
      value: `${stats.winRate.toFixed(1)}%`,
      color: 'text-success',
      showStreak: false,
      testId: 'stat-win-rate'
    },
    {
      icon: TrendingUp,
      label: 'Total Predictions',
      value: stats.totalPredictions,
      color: 'text-blue-500',
      showStreak: false,
      testId: 'stat-total-predictions'
    },
  ];
  
  return (
    <Card data-testid="card-stats">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label} 
                className="flex flex-col items-center text-center gap-2"
                data-testid={item.testId}
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
                <div>
                  <p className="text-2xl font-bold font-mono flex items-center gap-1 justify-center">
                    {item.value}
                    {item.showStreak && (
                      <Flame className="w-4 h-4 text-orange-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
