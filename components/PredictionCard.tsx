'use client';

import { useState, useEffect } from 'react';
import { CryptoPrice, CryptoId } from '@/lib/types';
import { formatPrice, formatPriceChange } from '@/lib/coingecko';

interface PredictionCardProps {
  price: CryptoPrice;
  onSubmit: (coinId: CryptoId, predictedPrice: number) => Promise<void>;
  disabled?: boolean;
}

export default function PredictionCard({ price, onSubmit, disabled }: PredictionCardProps) {
  const [predictedPrice, setPredictedPrice] = useState(price.currentPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPredictedPrice(price.currentPrice.toString());
  }, [price.currentPrice]);

  const handleSubmit = async () => {
    setError('');
    const predicted = parseFloat(predictedPrice);

    if (isNaN(predicted) || predicted <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(price.id, predicted);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difference = parseFloat(predictedPrice) - price.currentPrice;
  const percentage = ((difference / price.currentPrice) * 100).toFixed(2);
  const isIncrease = difference > 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
        {/* Coin Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            {price.id === 'bitcoin' ? '₿' : 'Ξ'}
          </div>
          <h2 className="text-2xl font-black text-white mb-1">
            {price.name}
          </h2>
          <p className="text-lg text-white/80">
            Current: {formatPrice(price.currentPrice)}
          </p>
          <div className={`text-sm font-bold ${
            price.priceChangePercentage24h >= 0 
              ? 'text-success' 
              : 'text-error'
          }`}>
            {formatPriceChange(price.priceChangePercentage24h)} (24h)
          </div>
        </div>

        {/* Prediction Input */}
        <div className="mb-6">
          <label className="block text-white font-bold mb-2 text-center">
            🔮 Your Prediction (24h)
          </label>
          <input
            type="number"
            value={predictedPrice}
            onChange={(e) => setPredictedPrice(e.target.value)}
            disabled={disabled || isSubmitting}
            className="w-full px-4 py-4 text-2xl font-bold text-center rounded-2xl bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-accent focus:bg-white/30 transition-all disabled:opacity-50"
            placeholder="Enter price..."
            step="0.01"
          />
          
          {/* Prediction Preview */}
          {predictedPrice && !isNaN(parseFloat(predictedPrice)) && (
            <div className="mt-3 text-center">
              <div className={`text-lg font-bold ${
                isIncrease ? 'text-success' : 'text-error'
              }`}>
                {isIncrease ? '📈' : '📉'} {isIncrease ? '+' : ''}{formatPrice(difference)}
                <span className="text-sm ml-2">
                  ({isIncrease ? '+' : ''}{percentage}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error/20 border border-error/30 text-error text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || !predictedPrice}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </span>
          ) : (
            '🎯 MAKE PREDICTION'
          )}
        </button>

        {/* Info */}
        <p className="text-center text-white/60 text-xs mt-4">
          ✨ Results in 24 hours • Score up to 100 points
        </p>
      </div>
    </div>
  );
}
