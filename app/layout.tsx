import type { Metadata } from 'next';
import './globals.css';

const baseUrl = 'https://predictx-gilt.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'PredictX - Crypto Prediction Game',
  description: 'Predict crypto prices and win on Farcaster',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'PredictX',
    description: 'Predict crypto prices and win rewards',
    images: [`${baseUrl}/opengraph-image`],
    url: baseUrl,
    siteName: 'PredictX',
    type: 'website',
  },
  other: {
    'fc:frame': '1',
    'fc:frame:image': `${baseUrl}/opengraph-image`,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🎯 Start Predicting',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': baseUrl,
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
