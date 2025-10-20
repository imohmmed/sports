import { Link } from "wouter";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import logoImage from "@assets/bisht 2-08_1760963584338.png";

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-all duration-300 cursor-pointer group">
            <img src={logoImage} alt="AlAli Sport" className="h-10 w-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span className="text-xl font-bold text-foreground transition-colors duration-300">AlAli Sport</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && userEmail && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-500">
              <span className="text-sm text-muted-foreground hidden sm:inline transition-all duration-300" data-testid="text-user-email">
                {userEmail}
              </span>
              <Badge 
                variant={isSubscribed ? "default" : "secondary"}
                className="transition-all duration-300 hover:scale-105"
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
            className="transition-all duration-300 hover:rotate-180"
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-5 w-5 transition-transform duration-300" /> : <Moon className="h-5 w-5 transition-transform duration-300" />}
          </Button>

          {isAuthenticated && (
            <Button
              size="sm"
              variant="outline"
              onClick={onLogout}
              className="transition-all duration-300 hover:scale-105"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              تسجيل الخروج
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
