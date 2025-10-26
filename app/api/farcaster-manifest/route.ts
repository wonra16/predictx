import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://predictx-gilt.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjMzOTk3MiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxMUNGMzAwNjFDNTIyZDc0MjgzOGQzODc2ZEY2NTk3NzExQ0NCRTMifQ",
      payload: "eyJkb21haW4iOiJwcmVkaWN0eC1naWx0LnZlcmNlbC5hcHAifQ",
      signature: "fFDUq2/mKSDhalp829LzSmlwISfqAhxNHOt++ICVjaJs7ESj3JzPyRXoP9c1s0A5bfPLYC+LOiG08E89bo+8dBs="
    },
    miniapp: {
      version: "1",
      name: "PredictX Beta",
      iconUrl: `${baseUrl}/api/icon`, // 200x200 PNG
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/api/og-embed`,
      buttonTitle: "🎯 Start Predicting",
      splashImageUrl: `${baseUrl}/api/splash`, // 200x200 PNG
      splashBackgroundColor: "#0a0e1a",
      webhookUrl: `${baseUrl}/api/webhook`,
      description: "Predict Bitcoin and Ethereum prices in quick 5-min or 24-hour challenges. Win points and climb the leaderboard!",
      subtitle: "Crypto Price Prediction Game"
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
