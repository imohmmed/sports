import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";

interface AuthFormProps {
  onLogin?: (email: string, password: string) => void;
  onRegister?: (email: string, password: string) => void;
}

export default function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin?.(email, password);
      console.log('Login:', email);
    } else {
      onRegister?.(email, password);
      console.log('Register:', email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-700 hover:shadow-primary/20 transition-all" data-testid="card-auth-form">
        <CardHeader className="text-center animate-in slide-in-from-top-5 duration-500">
          <CardTitle className="text-2xl font-bold transition-colors duration-300">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription className="transition-colors duration-300">
            {isLogin 
              ? "أدخل بريدك الإلكتروني وكلمة المرور للدخول"
              : "سجل الآن للحصول على اشتراك مميز"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 animate-in slide-in-from-right-5 duration-500 delay-100">
              <Label htmlFor="email" className="transition-colors duration-300">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2 animate-in slide-in-from-right-5 duration-500 delay-200">
              <Label htmlFor="password" className="transition-colors duration-300">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 animate-in zoom-in duration-500 delay-300"
              data-testid={isLogin ? "button-login" : "button-register"}
            >
              {isLogin ? (
                <>
                  <LogIn className="ml-2 h-4 w-4" />
                  تسجيل الدخول
                </>
              ) : (
                <>
                  <UserPlus className="ml-2 h-4 w-4" />
                  إنشاء حساب
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                data-testid="button-toggle-auth-mode"
              >
                {isLogin 
                  ? "ليس لديك حساب؟ سجل الآن"
                  : "لديك حساب؟ سجل الدخول"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
