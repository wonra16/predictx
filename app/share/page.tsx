'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import sdk from '@farcaster/frame-sdk';

function ShareContent() {
  const searchParams = useSearchParams();
  const prediction = searchParams.get('prediction');
  const coin = searchParams.get('coin');
  const amount = searchParams.get('amount');
  
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            PredictX
          </h1>
          <p className="text-xl text-gray-400 mb-8">Crypto Prediction Game on Farcaster</p>
        </div>

        {prediction && coin && (
          <div className="bg-[#1a1f35] border border-cyan-500/30 rounded-2xl p-6 mb-8">
            <p className="text-lg text-gray-300 mb-2">
              I just predicted <span className="text-cyan-400 font-bold">{coin}</span> will go
            </p>
            <p className="text-4xl font-bold mb-2">
              {prediction === 'up' ? '📈 UP' : '📉 DOWN'}
            </p>
            {amount && (
              <p className="text-gray-400">
                Potential reward: <span className="text-cyan-400 font-bold">{amount} points</span>
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
        >
          Start Predicting
        </button>

        <p className="text-sm text-gray-500 mt-8">
          Predict Bitcoin and Ethereum prices • Win rewards • Climb the leaderboard
        </p>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">
        Loading...
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
