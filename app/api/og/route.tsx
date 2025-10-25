import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#06b6d4', marginBottom: 20 }}>
          🎯 PredictX
        </div>
        <div style={{ fontSize: 48, color: '#e2e8f0', marginBottom: 30, textAlign: 'center' }}>
          Predict Crypto Prices
        </div>
        <div style={{ fontSize: 36, color: '#94a3b8' }}>
          Win Rewards on Farcaster
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
