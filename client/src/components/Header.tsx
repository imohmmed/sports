import { Link } from "wouter";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logoImage from "@assets/bisht 2-08_1760963584338.png";

export default function Header() {
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
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsDark(!isDark)}
            className="transition-all duration-300 hover:rotate-180"
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-5 w-5 transition-transform duration-300" /> : <Moon className="h-5 w-5 transition-transform duration-300" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
