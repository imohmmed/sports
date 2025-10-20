import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Send } from "lucide-react";

export default function SubscriptionBanner() {
  const handleTelegramClick = () => {
    window.open('https://t.me/mohmmed', '_blank');
  };

  return (
    <Alert className="border-chart-2 bg-chart-2/10" data-testid="alert-subscription-required">
      <AlertCircle className="h-5 w-5 text-chart-2" />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground mb-1">
            أنت غير مشترك حالياً
          </p>
          <p className="text-sm text-muted-foreground">
            للاستمتاع بمشاهدة جميع القنوات، يرجى التواصل معنا للاشتراك
          </p>
        </div>
        <Button 
          onClick={handleTelegramClick}
          className="shrink-0"
          data-testid="button-contact-telegram"
        >
          <Send className="ml-2 h-4 w-4" />
          راسلنا على التيليجرام
        </Button>
      </AlertDescription>
    </Alert>
  );
}
