import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import type { CryptoPrice } from "@shared/schema";

interface PriceCardProps {
  price: CryptoPrice;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PriceCard({ price, isSelected, onClick }: PriceCardProps) {
  const isPositive = price.priceChangePercentage24h >= 0;
  const bgColor = price.id === 'bitcoin' 
    ? 'from-orange-500/10 to-orange-600/5' 
    : 'from-blue-500/10 to-blue-600/5';
  
  const iconColor = price.id === 'bitcoin' ? 'text-orange-500' : 'text-blue-500';
  const CryptoIcon = price.id === 'bitcoin' ? SiBitcoin : SiEthereum;
  
  return (
    <Card
      className={`
        cursor-pointer transition-all hover-elevate active-elevate-2
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
      `}
      onClick={onClick}
      data-testid={`card-price-${price.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
              <CryptoIcon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold" data-testid={`text-crypto-name-${price.id}`}>
                {price.name}
              </h3>
              <p className="text-sm text-muted-foreground">{price.symbol}</p>
            </div>
          </div>
          
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className="gap-1"
            data-testid={`badge-change-${price.id}`}
          >
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(price.priceChangePercentage24h).toFixed(2)}%
          </Badge>
        </div>
        
        <div>
          <p 
            className="text-3xl font-mono font-bold mb-1"
            data-testid={`text-price-${price.id}`}
          >
            ${price.currentPrice.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            24h: {isPositive ? '+' : ''}
            ${price.priceChange24h.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
