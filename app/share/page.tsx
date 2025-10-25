'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import sdk from '@farcaster/frame-sdk';

function ShareContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] text-white p-6">
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-4xl font-bold mb-4">🎯 PredictX</h1>
        <p className="text-xl mb-8">Crypto Prediction Game</p>
        <a 
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:opacity-90 transition-opacity inline-block"
        >
          Start Predicting
        </a>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">Loading...</div>}>
      <ShareContent />
    </Suspense>
  );
}
