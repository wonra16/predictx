'use client';

import { CryptoPrice } from '@/lib/types';
import { formatPrice, formatPriceChange } from '@/lib/coingecko';

interface PriceDisplayProps {
  prices: CryptoPrice[];
}

export default function PriceDisplay({ prices }: PriceDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="grid grid-cols-2 gap-3">
        {prices.map((price) => (
          <div
            key={price.id}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-1">
                  {price.id === 'bitcoin' ? '₿' : 'Ξ'}
                </div>
                <div className="text-sm text-white/70 font-bold">
                  {price.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-white">
                  {formatPrice(price.currentPrice)}
                </div>
                <div
                  className={`text-xs font-bold ${
                    price.priceChangePercentage24h >= 0
                      ? 'text-success'
                      : 'text-error'
                  }`}
                >
                  {formatPriceChange(price.priceChangePercentage24h)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
