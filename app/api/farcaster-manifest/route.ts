import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'PredictX',
    shortName: 'PredictX',
    description: 'Crypto prediction game on Farcaster',
    version: '2.0.0',
    author: 'PredictX Team',
    icons: {
      '512x512': 'https://predictx.vercel.app/icon.png',
    },
    splashImage: 'https://predictx.vercel.app/splash.png',
    homeUrl: 'https://predictx.vercel.app',
  };

  return NextResponse.json(manifest);
}
