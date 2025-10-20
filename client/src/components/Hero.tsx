import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroImage from "@assets/generated_images/Stadium_night_hero_background_d1503244.png";

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          شاهد جميع قنوات كرة القدم
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          بث مباشر بجودة عالية لقنوات بي إن سبورت
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6"
          onClick={onGetStarted}
          data-testid="button-get-started"
        >
          <Play className="ml-2 h-5 w-5" />
          ابدأ المشاهدة الآن
        </Button>
      </div>
    </div>
  );
}
