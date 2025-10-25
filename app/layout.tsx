import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PredictX - Crypto Prediction Game',
  description: 'Predict crypto prices and compete on Farcaster',
  icons: {
    icon: '/icon.png',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/splash.png',
    'fc:frame:button:1': 'Start Predicting',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://predictx.vercel.app',
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
