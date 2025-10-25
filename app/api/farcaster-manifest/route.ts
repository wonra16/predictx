import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjMzOTk3MiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxMUNGMzAwNjFDNTIyZDc0MjgzOGQzODc2ZEY2NTk3NzExQ0NCRTMifQ",
      payload: "eyJkb21haW4iOiJwcmVkaWN0eC1naWx0LnZlcmNlbC5hcHAifQ",
      signature: "fFDUq2/mKSDhalp829LzSmlwISfqAhxNHOt++ICVjaJs7ESj3JzPyRXoP9c1s0A5bfPLYC+LOiG08E89bo+8dBs="
    },
    frame: {
      version: "next",
      name: "PredictX",
      iconUrl: "https://predictx-gilt.vercel.app/icon.png",
      homeUrl: "https://predictx-gilt.vercel.app",
      imageUrl: "https://predictx-gilt.vercel.app/splash.png",
      buttonTitle: "Play Now",
      splashImageUrl: "https://predictx-gilt.vercel.app/splash.png",
      splashBackgroundColor: "#0a0e1a",
      webhookUrl: "https://predictx-gilt.vercel.app/api/webhook"
    }
  };

  return NextResponse.json(manifest);
}
