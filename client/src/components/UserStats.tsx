import { Trophy, TrendingUp, Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UserStatsProps {
  score: number;
  rank: number;
  totalPredictions: number;
  accuracy: number;
  currentStreak: number;
}

export default function UserStats({ score, rank, totalPredictions, accuracy, currentStreak }: UserStatsProps) {
  const stats = [
    { icon: Trophy, label: "Skor", value: score.toLocaleString('tr-TR'), color: "text-primary" },
    { icon: Target, label: "Doğruluk", value: `${accuracy}%`, color: "text-success" },
    { icon: TrendingUp, label: "Tahmin", value: totalPredictions.toLocaleString('tr-TR'), color: "text-muted-foreground" },
    { icon: Flame, label: "Seri", value: currentStreak.toString(), color: "text-warning" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">İstatistiklerim</h3>
        <div className="text-sm text-muted-foreground" data-testid="text-rank">
          Sıralama: <span className="font-bold text-foreground">#{rank}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="flex justify-center mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="font-mono text-2xl font-medium" data-testid={`text-stat-${stat.label.toLowerCase()}`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
