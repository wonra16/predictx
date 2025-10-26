import PriceCard from '../PriceCard';
import btcLogo from '@assets/generated_images/Bitcoin_logo_coin_e6db54f4.png';

export default function PriceCardExample() {
  return (
    <div className="w-full max-w-md">
      <PriceCard
        coin="BTC"
        price={67842.50}
        change24h={3.45}
        logoUrl={btcLogo}
        isLive={true}
      />
    </div>
  );
}
