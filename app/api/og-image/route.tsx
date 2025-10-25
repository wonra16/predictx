import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prediction = searchParams.get('prediction') || 'Bitcoin';
  const direction = searchParams.get('direction') || 'UP';
  const price = searchParams.get('price') || '$111,697';

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
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
          🎯 PredictX
        </div>
        <div style={{ fontSize: 48, color: '#10b981', marginBottom: 30 }}>
          {prediction} {direction}
        </div>
        <div style={{ fontSize: 36, color: '#94a3b8' }}>
          @ {price}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
