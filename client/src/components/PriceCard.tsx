import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriceCardProps {
  coin: "BTC" | "ETH";
  price: number;
  change24h: number;
  logoUrl: string;
  isLive?: boolean;
}

export default function PriceCard({ coin, price, change24h, logoUrl, isLive = true }: PriceCardProps) {
  const isPositive = change24h >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={coin} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="text-xl font-bold">{coin}</h3>
            <p className="text-sm text-muted-foreground">
              {coin === "BTC" ? "Bitcoin" : "Ethereum"}
            </p>
          </div>
        </div>
        {isLive && (
          <Badge variant="outline" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            CANLI
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="font-mono text-3xl font-medium" data-testid={`text-price-${coin.toLowerCase()}`}>
          ${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-error" />
          )}
          <span 
            className={`font-medium ${isPositive ? 'text-success' : 'text-error'}`}
            data-testid={`text-change-${coin.toLowerCase()}`}
          >
            {isPositive ? '+' : ''}{change24h.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">24s</span>
        </div>
      </div>
    </Card>
  );
}
