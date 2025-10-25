import type { Metadata } from 'next';
import './globals.css';

const baseUrl = 'https://predictx-gilt.vercel.app';

// Mini App Embed Configuration
const miniAppEmbed = {
  version: "1",
  imageUrl: `${baseUrl}/api/og-embed`, // Dynamic 3:2 image
  button: {
    title: "🎯 Start Predicting",
    action: {
      type: "launch_frame",
      name: "PredictX",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/splash.png`, // 200x200px
      splashBackgroundColor: "#0a0e1a"
    }
  }
};

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
    images: [`${baseUrl}/api/og-embed`],
    url: baseUrl,
    siteName: 'PredictX',
    type: 'website',
  },
  other: {
    'fc:frame': JSON.stringify(miniAppEmbed),
    'fc:miniapp': JSON.stringify(miniAppEmbed),
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
