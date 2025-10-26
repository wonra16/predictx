import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Prediction } from "@shared/schema";

interface ActivePredictionProps {
  prediction: Prediction | null;
}

export function ActivePrediction({ prediction }: ActivePredictionProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  useEffect(() => {
    if (!prediction) return;
    
    const updateTime = () => {
      const now = Date.now();
      const remaining = prediction.expiresAt - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Settling...');
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [prediction]);
  
  if (!prediction) {
    return null;
  }
  
  const coinName = prediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
  const coinSymbol = prediction.coinId === 'bitcoin' ? 'BTC' : 'ETH';
  const isUp = prediction.direction === 'up';
  
  return (
    <Card className="border-primary/50" data-testid="card-active-prediction">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            Active Prediction
          </span>
          <Badge variant="outline" className="font-mono">
            {timeRemaining}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Crypto</p>
            <p className="text-lg font-bold" data-testid="text-active-coin">
              {coinName} ({coinSymbol})
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Prediction</p>
            <Badge 
              variant={isUp ? 'default' : 'destructive'}
              className="gap-1"
              data-testid="badge-active-direction"
            >
              {isUp ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {isUp ? 'UP' : 'DOWN'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Start Price</p>
            <p className="text-sm font-mono font-bold" data-testid="text-active-start-price">
              ${prediction.startPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-bold">
              {prediction.challengeType === 'quick' ? '5 minutes' : '24 hours'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
