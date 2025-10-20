import { Link } from "wouter";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import logoImage from "@assets/generated_images/AlAli_Sport_logo_icon_49a0452b.png";

interface HeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  isSubscribed?: boolean;
  onLogout?: () => void;
}

export default function Header({ isAuthenticated, userEmail, isSubscribed, onLogout }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-all cursor-pointer">
            <img src={logoImage} alt="AlAli Sport" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">AlAli Sport</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && userEmail && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
                {userEmail}
              </span>
              <Badge 
                variant={isSubscribed ? "default" : "secondary"}
                data-testid={`badge-subscription-${isSubscribed ? 'active' : 'inactive'}`}
              >
                {isSubscribed ? "مشترك" : "غير مشترك"}
              </Badge>
            </div>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsDark(!isDark)}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && (
            <Button
              size="sm"
              variant="outline"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
