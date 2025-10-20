import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Send } from "lucide-react";

export default function SubscriptionBanner() {
  const handleTelegramClick = () => {
    window.open('https://t.me/mohmmed', '_blank');
  };

  return (
    <Alert className="border-chart-2 bg-chart-2/10 animate-in slide-in-from-top-5 duration-700 shadow-lg hover:shadow-xl transition-all" data-testid="alert-subscription-required">
      <AlertCircle className="h-5 w-5 text-chart-2 animate-pulse" />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-in slide-in-from-right-5 duration-500 delay-200">
          <p className="font-semibold text-foreground mb-1 transition-colors duration-300">
            أنت غير مشترك حالياً
          </p>
          <p className="text-sm text-muted-foreground transition-colors duration-300">
            للاستمتاع بمشاهدة جميع القنوات، يرجى التواصل معنا للاشتراك
          </p>
        </div>
        <Button 
          onClick={handleTelegramClick}
          className="shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/50 animate-in zoom-in duration-500 delay-400 group"
          data-testid="button-contact-telegram"
        >
          <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          راسلنا على التيليجرام
        </Button>
      </AlertDescription>
    </Alert>
  );
}
