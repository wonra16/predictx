import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PredictionButtonsProps {
  coin: "BTC" | "ETH";
  onPredict?: (direction: "up" | "down", timeframe: string) => void;
}

const timeframes = [
  { label: "5dk", value: "5m" },
  { label: "15dk", value: "15m" },
  { label: "1s", value: "1h" },
  { label: "4s", value: "4h" },
  { label: "24s", value: "24h" },
];

export default function PredictionButtons({ coin, onPredict }: PredictionButtonsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("5m");
  const [selectedDirection, setSelectedDirection] = useState<"up" | "down" | null>(null);

  const handlePredict = (direction: "up" | "down") => {
    setSelectedDirection(direction);
    console.log(`Tahmin gönderiliyor: ${coin} ${direction === "up" ? "YÜKSELİR" : "DÜŞERİR"} - ${selectedTimeframe}`);
    onPredict?.(direction, selectedTimeframe);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">{coin} Tahmin Et</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Zaman Aralığı</label>
          <div className="flex gap-2 flex-wrap">
            {timeframes.map((tf) => (
              <Badge
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "outline"}
                className="cursor-pointer hover-elevate active-elevate-2"
                onClick={() => setSelectedTimeframe(tf.value)}
                data-testid={`button-timeframe-${tf.value}`}
              >
                {tf.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant={selectedDirection === "up" ? "default" : "outline"}
            className="py-6 text-lg font-bold bg-success hover:bg-success/90 border-success text-white"
            onClick={() => handlePredict("up")}
            data-testid="button-predict-up"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            YÜKSELİR
          </Button>
          
          <Button
            size="lg"
            variant={selectedDirection === "down" ? "default" : "outline"}
            className="py-6 text-lg font-bold bg-error hover:bg-error/90 border-error text-white"
            onClick={() => handlePredict("down")}
            data-testid="button-predict-down"
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            DÜŞERİR
          </Button>
        </div>
      </div>
    </Card>
  );
}
