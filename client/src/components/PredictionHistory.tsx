import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prediction {
  id: string;
  coin: "BTC" | "ETH";
  direction: "up" | "down";
  timeframe: string;
  timestamp: string;
  result?: "win" | "loss" | "pending";
  points?: number;
  entryPrice: number;
}

interface PredictionHistoryProps {
  predictions: Prediction[];
}

export default function PredictionHistory({ predictions }: PredictionHistoryProps) {
  const getResultBadge = (result?: "win" | "loss" | "pending") => {
    if (!result || result === "pending") {
      return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Bekliyor</Badge>;
    }
    if (result === "win") {
      return <Badge className="bg-success hover:bg-success/90 text-white">Kazandı</Badge>;
    }
    return <Badge variant="destructive">Kaybetti</Badge>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Son Tahminlerim</h3>

      {predictions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Henüz tahmin yapmadınız
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
              data-testid={`prediction-${prediction.id}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-md ${
                  prediction.direction === "up" ? "bg-success/10" : "bg-error/10"
                }`}>
                  {prediction.direction === "up" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {prediction.coin} {prediction.direction === "up" ? "YÜKSELİR" : "DÜŞERİR"}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({prediction.timeframe})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {prediction.timestamp} • ${prediction.entryPrice.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {prediction.points && prediction.result === "win" && (
                  <div className="font-mono font-bold text-success">
                    +{prediction.points}
                  </div>
                )}
                {getResultBadge(prediction.result)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
