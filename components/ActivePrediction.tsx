'use client';

import { useEffect, useState } from 'react';
import { Prediction } from '@/lib/types';

interface ActivePredictionProps {
  prediction: Prediction;
}

export default function ActivePrediction({ prediction }: ActivePredictionProps) {
  const [currentPrice, setCurrentPrice] = useState(prediction.currentPrice);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        const coin = data.prices.find((p: any) => p.id === prediction.coinId);
        if (coin) {
          setCurrentPrice(coin.currentPrice);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [prediction.coinId]);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const remaining = prediction.expiresAt - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Checking results...');
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [prediction.expiresAt]);

  const difference = prediction.predictedPrice 
    ? currentPrice - prediction.predictedPrice 
    : 0;
  
  const percentage = prediction.predictedPrice 
    ? ((difference / prediction.predictedPrice) * 100).toFixed(2)
    : '0.00';
  
  const isWinning = Math.abs(parseFloat(percentage)) < 5;

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-400/50">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">
          {prediction.coinId === 'bitcoin' ? '₿' : 'Ξ'}
        </div>
        <div className="text-white/70">
          ⏳ {timeRemaining}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Your Prediction:</span>
          <span className="font-bold text-white">
            {prediction.predictedPrice 
              ? `$${prediction.predictedPrice.toLocaleString()}` 
              : `${prediction.direction === 'up' ? '📈 UP' : '📉 DOWN'}`}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/70">Current Price:</span>
          <span className="font-bold text-white">
            ${currentPrice.toLocaleString()}
          </span>
        </div>

        {prediction.predictedPrice && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Difference:</span>
              <span className={`font-bold ${difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {difference >= 0 ? '+' : ''}{difference.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/70">Accuracy:</span>
              <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-yellow-400'}`}>
                {percentage}%
              </span>
            </div>

            <div className="mt-4 p-3 bg-white/10 rounded-xl text-center">
              <div className={`text-sm font-bold ${isWinning ? 'text-green-400' : 'text-yellow-400'}`}>
                {isWinning ? '🎯 On Track!' : '👀 Monitoring...'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
