import { Metadata } from 'next';

const baseUrl = 'https://predictx-gilt.vercel.app';

// Share-specific Mini App Embed
const shareEmbed = {
  version: "1",
  imageUrl: `${baseUrl}/api/og-embed?subtitle=Join%20the%20Game`,
  button: {
    title: "🎯 Join PredictX",
    action: {
      type: "launch_frame",
      name: "PredictX",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#0a0e1a"
    }
  }
};

export const metadata: Metadata = {
  title: 'Check out my prediction! - PredictX',
  description: 'Join me on PredictX and predict crypto prices to win rewards',
  openGraph: {
    title: 'PredictX - Crypto Prediction Game',
    description: 'I just made a prediction! Join me and compete on PredictX',
    images: [`${baseUrl}/api/og-embed?subtitle=Join%20the%20Game`],
  },
  other: {
    'fc:frame': JSON.stringify(shareEmbed),
    'fc:miniapp': JSON.stringify(shareEmbed),
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
