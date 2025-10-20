import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error("كلمتا المرور غير متطابقتين");
      }
      if (password.length < 6) {
        throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      }
      return await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "مرحباً بك في AlAli Sport",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "فشل التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>سجل الآن للاستمتاع بمشاهدة المباريات</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  الاسم الأول
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="محمد"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  data-testid="input-firstname"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  الاسم الأخير
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="أحمد"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  data-testid="input-lastname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                تأكيد كلمة المرور
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="input-confirm-password"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              لديك حساب؟{" "}
              <Link href="/login" data-testid="link-login">
                <span className="text-primary hover:underline cursor-pointer">سجل الدخول</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
