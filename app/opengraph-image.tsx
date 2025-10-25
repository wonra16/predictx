import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PredictX - Crypto Prediction Game';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#06b6d4', marginBottom: 20 }}>
          🎯 PredictX
        </div>
        <div style={{ fontSize: 48, color: '#e2e8f0', marginBottom: 30 }}>
          Predict Crypto Prices
        </div>
        <div style={{ fontSize: 36, color: '#94a3b8' }}>
          Win Rewards • Quick & Big Challenges
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
