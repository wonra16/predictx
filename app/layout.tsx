import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PredictX - Crypto Prediction Game',
  description: 'Predict crypto prices and compete on Farcaster',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'PredictX - Crypto Prediction Game',
    description: 'Predict crypto prices and win on Farcaster',
    images: ['/splash.png'],
    url: 'https://predictx-gilt.vercel.app',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://predictx-gilt.vercel.app/splash.png',
    'fc:frame:image:aspect_ratio': '1:1',
    'fc:frame:button:1': 'Start Predicting',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://predictx-gilt.vercel.app',
    'fc:frame:castShareUrl': 'https://predictx-gilt.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
