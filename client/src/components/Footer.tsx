import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const handleTelegramClick = () => {
    window.open('https://t.me/mohmmed', '_blank');
  };

  return (
    <footer className="bg-card border-t mt-auto transition-all duration-500">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-in slide-in-from-right-5 duration-700">
            <h3 className="font-bold text-lg mb-4 text-card-foreground transition-colors duration-300">AlAli Sport</h3>
            <p className="text-sm text-muted-foreground transition-colors duration-300">
              منصة البث المباشر لقنوات كرة القدم بجودة عالية
            </p>
          </div>
          
          <div className="text-right animate-in slide-in-from-left-5 duration-700 delay-200">
            <h3 className="font-bold text-lg mb-4 text-card-foreground transition-colors duration-300">تواصل معنا</h3>
            <Button 
              variant="outline" 
              onClick={handleTelegramClick}
              className="transition-all duration-300 hover:scale-110 hover:shadow-lg group"
              data-testid="button-footer-telegram"
            >
              <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              التيليجرام
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground transition-colors duration-300 animate-in fade-in duration-700 delay-400">
          <p>© 2025 AlAli Sport. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
