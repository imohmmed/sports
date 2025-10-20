import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/Stadium_night_hero_background_d1503244.png";

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="mb-6 inline-block animate-in zoom-in duration-700 delay-300">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-in slide-in-from-bottom-5 duration-700 delay-150">
          شاهد جميع قنوات كرة القدم
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-300">
          بث مباشر بجودة عالية لقنوات بي إن سبورت
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 animate-in zoom-in duration-700 delay-500 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary/50 group"
          onClick={onGetStarted}
          data-testid="button-get-started"
        >
          <Play className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          ابدأ المشاهدة الآن
        </Button>
      </div>
    </div>
  );
}
