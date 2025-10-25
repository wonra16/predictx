import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'PredictX';
  const subtitle = searchParams.get('subtitle') || 'Predict Crypto Prices & Win';
  const emoji = searchParams.get('emoji') || '🎯';

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
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '250px',
            height: '250px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            fontSize: '70px',
          }}
        >
          {emoji}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 38,
            color: '#94a3b8',
            marginBottom: 40,
          }}
        >
          {subtitle}
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: 24,
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>⚡</span> Quick Predictions
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>🏆</span> Win Rewards
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>📊</span> Live Prices
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800, // 3:2 aspect ratio
    }
  );
}
