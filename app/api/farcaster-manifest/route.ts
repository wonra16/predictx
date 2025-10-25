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
      webhookUrl: "https://predictx-gilt.vercel.app/api/webhook",
      subtitle: "Predict crypto prices and win",
      description: "Challenge yourself to predict Bitcoin and Ethereum price movements. Quick 5-minute rounds or 24-hour challenges.",
      screenshotUrls: [
        "https://predictx-gilt.vercel.app/splash.png"
      ],
      primaryCategory: "GAME",
      tags: ["crypto", "prediction", "game", "bitcoin", "ethereum"],
      heroImageUrl: "https://predictx-gilt.vercel.app/splash.png",
      tagline: "Predict crypto prices and compete",
      ogTitle: "PredictX - Crypto Prediction Game",
      ogDescription: "Predict Bitcoin and Ethereum price movements. Win rewards and climb the leaderboard!",
      ogImageUrl: "https://predictx-gilt.vercel.app/splash.png",
      castShareUrl: "https://predictx-gilt.vercel.app"
    }
  };

  return NextResponse.json(manifest);
}
