import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon, Clock, Trophy, Target } from "lucide-react";
import type { Prediction } from "@shared/schema";

interface PredictionHistoryProps {
  predictions: Prediction[];
  loading?: boolean;
}

export function PredictionHistory({ predictions, loading }: PredictionHistoryProps) {
  if (loading) {
    return (
      <Card data-testid="card-history-loading">
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (predictions.length === 0) {
    return (
      <Card data-testid="card-history-empty">
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No predictions yet
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="card-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Prediction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <PredictionItem key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function PredictionItem({ prediction }: { prediction: Prediction }) {
  const coinName = prediction.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
  const coinSymbol = prediction.coinId === 'bitcoin' ? 'BTC' : 'ETH';
  const isUp = prediction.direction === 'up';
  const isWon = prediction.status === 'won';
  const isPending = prediction.status === 'pending';
  
  const statusConfig = {
    won: { variant: 'default' as const, label: 'Won', color: 'text-success' },
    lost: { variant: 'destructive' as const, label: 'Lost', color: 'text-destructive' },
    pending: { variant: 'outline' as const, label: 'Pending', color: 'text-muted-foreground' },
    expired: { variant: 'secondary' as const, label: 'Expired', color: 'text-muted-foreground' },
    active: { variant: 'outline' as const, label: 'Active', color: 'text-primary' },
  };
  
  const status = statusConfig[prediction.status as keyof typeof statusConfig] || statusConfig.pending;
  
  return (
    <div 
      className="border rounded-lg p-4 hover-elevate"
      data-testid={`item-prediction-${prediction.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {coinSymbol}
          </span>
          <Badge variant={isUp ? 'default' : 'destructive'} className="gap-1">
            {isUp ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {isUp ? 'UP' : 'DOWN'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {prediction.challengeType === 'quick' ? '5m' : '24h'}
          </Badge>
        </div>
        
        <Badge variant={status.variant} data-testid={`badge-status-${prediction.id}`}>
          {status.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Start</p>
          <p className="font-mono font-bold">
            ${prediction.startPrice.toFixed(2)}
          </p>
        </div>
        
        {prediction.endPrice && (
          <div className="text-right">
            <p className="text-muted-foreground text-xs">End</p>
            <p className="font-mono font-bold">
              ${prediction.endPrice.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      
      {isWon && prediction.score && prediction.score > 0 && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-success">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">+{prediction.score} Points</span>
          </div>
          
          {prediction.accuracy && prediction.accuracy > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Target className="w-3 h-3" />
              {prediction.accuracy.toFixed(1)}% accuracy
            </Badge>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        {new Date(prediction.timestamp).toLocaleString('en-US')}
      </p>
    </div>
  );
}
