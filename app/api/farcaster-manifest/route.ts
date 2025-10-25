import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjMzOTk3MiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxMUNGMzAwNjFDNTIyZDc0MjgzOGQzODc2ZEY2NTk3NzExQ0NCRTMifQ",
      payload: "eyJkb21haW4iOiJwcmVkaWN0eC1naWx0LnZlcmNlbC5hcHAifQ",
      signature: "fFDUq2/mKSDhalp829LzSmlwISfqAhxNHOt++ICVjaJs7ESj3JzPyRXoP9c1s0A5bfPLYC+LOiG08E89bo+8dBs="
    },
    miniapp: {
      version: "1",
      name: "PredictX",
      iconUrl: "https://predictx-gilt.vercel.app/icon.png",
      homeUrl: "https://predictx-gilt.vercel.app",
      imageUrl: "https://predictx-gilt.vercel.app/image.png",
      buttonTitle: "🎯 Start Predicting",
      splashImageUrl: "https://predictx-gilt.vercel.app/splash.png",
      splashBackgroundColor: "#0a0e1a",
      webhookUrl: "https://predictx-gilt.vercel.app/api/webhook"
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
