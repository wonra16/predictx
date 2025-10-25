import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          borderRadius: '40px',
        }}
      >
        <span style={{ fontSize: '120px' }}>🎯</span>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}
