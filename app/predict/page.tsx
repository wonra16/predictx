'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, ArrowUp, ArrowDown, Sparkles, ChevronLeft, Activity } from 'lucide-react';
import { initializeFarcaster } from '@/lib/farcaster';
import { CryptoId, ChallengeType, FarcasterContext } from '@/lib/types';
import { getCurrentRound, formatTimeRemaining, type RoundInfo } from '@/lib/rounds';
import { useBinancePrice } from '@/lib/useBinancePrice';

function PredictContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const coinId = searchParams.get('coin') as CryptoId;
  const challengeType = searchParams.get('type') as ChallengeType;
  
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [startPrice, setStartPrice] = useState<number>(0);
  const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const { price: currentPrice, change, changePercent, isConnected } = useBinancePrice(coinId);

  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await initializeFarcaster();
        setContext(ctx);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!coinId || !challengeType) {
      router.push('/');
      return;
    }

    const round = getCurrentRound(challengeType);
    setRoundInfo(round);
    init();
  }, [coinId, challengeType, router]);

  useEffect(() => {
    if (currentPrice > 0 && startPrice === 0) {
      setStartPrice(currentPrice);
    }
  }, [currentPrice, startPrice]);

  useEffect(() => {
    if (!roundInfo) return;

    const updateTimer = () => {
      const round = getCurrentRound(challengeType);
      setRoundInfo(round);
      setTimeRemaining(formatTimeRemaining(round.timeRemaining));
      
      if (round.timeRemaining <= 0) {
        window.location.reload();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [challengeType, roundInfo]);

  const handleSubmit = async () => {
    console.log('🎯 SUBMIT CLICKED!', { direction, currentPrice });
    
    if (!direction) {
      alert('Please select UP or DOWN first!');
      return;
    }

    if (currentPrice === 0) {
      alert('Waiting for price data...');
      return;
    }

    const userData = context?.user || {
      fid: Math.floor(Math.random() * 1000000),
      username: 'anonymous',
      displayName: 'Anonymous User',
      pfpUrl: ''
    };

    console.log('👤 User data:', userData);
    setSubmitting(true);
    
    try {
      console.log('📤 Sending prediction...', {
        fid: userData.fid,
        coinId,
        direction,
        challengeType,
        startPrice: currentPrice,
        roundId: roundInfo?.roundId
      });
      
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid: userData.fid,
          username: userData.username,
          displayName: userData.displayName,
          pfpUrl: userData.pfpUrl,
          cryptoId: coinId,
          coinId: coinId,
          direction,
          challengeType,
          exactPrice: 0,
          startPrice: currentPrice,
          roundId: roundInfo?.roundId,
          roundStartTime: roundInfo?.startTime,
          roundEndTime: roundInfo?.endTime,
        }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (data.success) {
        console.log('✅ SUCCESS! Redirecting to profile...');
        // Use window.location instead of router.push
        window.location.href = '/profile';
      } else {
        console.error('❌ API Error:', data.error);
        alert(data.error || 'Failed to submit prediction');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('💥 Submit error:', error);
      alert('Failed to submit prediction. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUp className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const coinName = coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
  const coinSymbol = coinId === 'bitcoin' ? 'BTC' : 'ETH';
  const challengeName = challengeType === 'quick' ? 'Quick Challenge' : 'Big Challenge';
  const duration = challengeType === 'quick' ? '5 minutes' : '24 hours';

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-[#1a1f35]/80 backdrop-blur-md border-b border-cyan-500/20 sticky top-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                // Ana sayfaya dön
                window.location.href = '/';
              }}
              className="w-10 h-10 rounded-xl bg-[#111827] border border-white/10 hover:border-cyan-500/50 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">{challengeName}</h1>
              <p className="text-xs text-gray-500">{duration}</p>
            </div>
            <div className="w-10 h-10" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f35] border border-orange-500/30 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Round #{roundInfo?.roundNumber}</div>
              <div className="text-white font-semibold">Predictions Close In</div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-500" />
              <div className="text-2xl font-bold text-orange-500">{timeRemaining}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1f35] border border-cyan-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">{coinName}</h2>
              <p className="text-gray-400">{coinSymbol}</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-xs text-gray-500">{isConnected ? 'Live' : 'Connecting...'}</span>
            </div>
          </div>

          <div className="bg-[#111827] rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-2">Current Price</div>
            <div className="text-4xl font-bold text-white mb-2">
              ${currentPrice > 0 ? currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2}) : '...'}
            </div>
            {changePercent !== 0 && (
              <div className={`flex items-center gap-2 text-sm font-bold ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {changePercent >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(changePercent).toFixed(2)}% (${Math.abs(change).toFixed(2)})
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-white font-bold text-lg mb-4">Make Your Prediction</h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => setDirection('up')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all ${
                direction === 'up'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-white/10 bg-[#111827] hover:border-green-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  direction === 'up' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-500/20'
                }`}>
                  <TrendingUp className={`w-8 h-8 ${direction === 'up' ? 'text-white' : 'text-green-500'}`} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">UP</div>
                  <div className="text-sm text-gray-400">Price will rise</div>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setDirection('down')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all ${
                direction === 'down'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-white/10 bg-[#111827] hover:border-red-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  direction === 'down' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-500/20'
                }`}>
                  <TrendingDown className={`w-8 h-8 ${direction === 'down' ? 'text-white' : 'text-red-500'}`} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">DOWN</div>
                  <div className="text-sm text-gray-400">Price will fall</div>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {direction && (
          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Confirm Prediction
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <PredictContent />
    </Suspense>
  );
}
