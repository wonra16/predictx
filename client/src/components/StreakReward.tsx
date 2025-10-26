import { Flame, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StreakRewardProps {
  currentStreak: number;
  canClaim: boolean;
  nextRewardIn?: string;
  onClaim?: () => void;
}

export default function StreakReward({ currentStreak, canClaim, nextRewardIn, onClaim }: StreakRewardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-warning" />
          <h3 className="text-lg font-bold">Günlük Seri</h3>
        </div>
        <Badge variant="outline" className="font-mono text-lg font-bold">
          {currentStreak} gün
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {canClaim 
          ? "Günlük ödülünü talep etmeye hazırsın!" 
          : `Bir sonraki ödül: ${nextRewardIn || "Yakında"}`
        }
      </p>

      <Button
        size="lg"
        variant="default"
        className="w-full bg-warning hover:bg-warning/90 border-warning text-white"
        disabled={!canClaim}
        onClick={onClaim}
        data-testid="button-claim-reward"
      >
        <Gift className="w-5 h-5 mr-2" />
        {canClaim ? "Ödülü Talep Et" : "Talep Edildi"}
      </Button>

      {currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-success/10 rounded-md border border-success/20">
          <p className="text-sm text-success font-medium text-center">
            🎉 Harika! 7 günlük seriye ulaştın! Bonus kazandın!
          </p>
        </div>
      )}
    </Card>
  );
}
