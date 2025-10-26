import { Button } from "@/components/ui/button";
import { TrendingUp, Trophy, Zap } from "lucide-react";
import heroImage from '@assets/generated_images/Crypto_trading_hero_background_cd448318.png';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
      <img 
        src={heroImage} 
        alt="Crypto Trading" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      
      <div className="relative h-full flex flex-col justify-center px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          PredictX
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
          Kripto fiyat hareketlerini tahmin et, skor kazan ve liderlik tablosunda yüksel!
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            variant="default"
            className="bg-primary hover:bg-primary/90 backdrop-blur-md"
            onClick={onGetStarted}
            data-testid="button-get-started"
          >
            <Zap className="w-5 h-5 mr-2" />
            Hemen Başla
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
            data-testid="button-view-leaderboard"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Liderlik Tablosu
          </Button>
        </div>

        <div className="flex gap-8 mt-6">
          <div className="flex items-center gap-2 text-white/80">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Gerçek Zamanlı Fiyatlar</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Günlük Ödüller</span>
          </div>
        </div>
      </div>
    </div>
  );
}
