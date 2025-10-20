import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const handleTelegramClick = () => {
    window.open('https://t.me/mohmmed', '_blank');
  };

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-card-foreground">AlAli Sport</h3>
            <p className="text-sm text-muted-foreground">
              منصة البث المباشر لقنوات كرة القدم بجودة عالية
            </p>
          </div>
          
          <div className="text-right">
            <h3 className="font-bold text-lg mb-4 text-card-foreground">تواصل معنا</h3>
            <Button 
              variant="outline" 
              onClick={handleTelegramClick}
              data-testid="button-footer-telegram"
            >
              <Send className="ml-2 h-4 w-4" />
              التيليجرام
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 AlAli Sport. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
