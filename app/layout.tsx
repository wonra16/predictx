import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PredictX - Crypto Prediction Game',
  description: 'Predict crypto prices and win on Farcaster',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'PredictX - Crypto Prediction Game',
    description: 'Predict crypto prices and win on Farcaster',
    images: [{
      url: 'https://predictx-gilt.vercel.app/splash.png',
      width: 1200,
      height: 630,
    }],
    url: 'https://predictx-gilt.vercel.app',
    siteName: 'PredictX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PredictX - Crypto Prediction Game',
    description: 'Predict crypto prices and win on Farcaster',
    images: ['https://predictx-gilt.vercel.app/splash.png'],
  },
  other: {
    'fc:frame': '1',
    'fc:frame:image': 'https://predictx-gilt.vercel.app/splash.png',
    'fc:frame:image:aspect_ratio': '1:1',
    'fc:frame:button:1': 'Play Now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://predictx-gilt.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="PredictX - Crypto Prediction Game" />
        <meta property="og:description" content="Predict crypto prices and win on Farcaster" />
        <meta property="og:image" content="https://predictx-gilt.vercel.app/splash.png" />
        <meta property="og:url" content="https://predictx-gilt.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="fc:frame" content="1" />
        <meta property="fc:frame:image" content="https://predictx-gilt.vercel.app/splash.png" />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:button:1" content="Play Now" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://predictx-gilt.vercel.app" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
