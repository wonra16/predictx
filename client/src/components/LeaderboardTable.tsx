import { Trophy, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  username: string;
  fid?: string;
  avatar?: string;
  score: number;
  accuracy: number;
  totalPredictions: number;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserFid?: string;
}

export default function LeaderboardTable({ entries, currentUserFid }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-warning/60" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8">
          {getRankIcon(rank)}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 text-muted-foreground font-bold">
        #{rank}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Liderlik Tablosu</h2>
        <Trophy className="w-6 h-6 text-primary" />
      </div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const isCurrentUser = entry.fid === currentUserFid || entry.isCurrentUser;
          
          return (
            <div
              key={`${entry.rank}-${entry.username}`}
              className={`flex items-center gap-4 p-4 rounded-md ${
                isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover-elevate'
              }`}
              data-testid={`row-leaderboard-${entry.rank}`}
            >
              <div className="flex-shrink-0">
                {getRankBadge(entry.rank)}
              </div>

              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="font-bold truncate" data-testid={`text-username-${entry.rank}`}>
                  {entry.username}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2">Sen</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {entry.totalPredictions} tahmin • {entry.accuracy}% doğruluk
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xl font-bold" data-testid={`text-score-${entry.rank}`}>
                  {entry.score.toLocaleString('tr-TR')}
                </div>
                <div className="text-sm text-muted-foreground">puan</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
