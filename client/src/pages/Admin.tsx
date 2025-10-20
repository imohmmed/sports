// Admin page for subscription management
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && !typedUser?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  }, [isAuthenticated, isLoading, typedUser, toast]);

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, isSubscribed }: { userId: string; isSubscribed: boolean }) => {
      await apiRequest("POST", "/api/admin/subscription", { userId, isSubscribed });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const handleToggleSubscription = (userId: string, currentStatus: boolean) => {
    updateSubscriptionMutation.mutate({
      userId,
      isSubscribed: !currentStatus,
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || !typedUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true}
        userEmail={typedUser?.email || ""}
        isSubscribed={typedUser?.isSubscribed || false}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-foreground">لوحة التحكم - الإدارة</h1>
            <p className="text-muted-foreground mb-8">إدارة اشتراكات المستخدمين</p>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">معلومات المدير</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">البريد الإلكتروني:</span> {typedUser?.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">الحالة:</span>{" "}
                  <Badge variant="default">مدير</Badge>
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">تحديث حالة الاشتراك</h2>
              <p className="text-sm text-muted-foreground mb-4">
                للتفعيل أو إلغاء اشتراك مستخدم، قم بإدخال معرف المستخدم (User ID) أدناه
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    معرف المستخدم (User ID)
                  </label>
                  <Input
                    type="text"
                    placeholder="أدخل معرف المستخدم"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="max-w-md"
                    data-testid="input-user-id"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يمكن العثور على معرف المستخدم في قاعدة البيانات
                  </p>
                </div>

                {searchEmail && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleToggleSubscription(searchEmail, false)}
                      className="w-full sm:w-auto"
                      variant="default"
                      data-testid="button-activate-subscription"
                    >
                      <CheckCircle className="ml-2 h-4 w-4" />
                      تفعيل الاشتراك
                    </Button>
                    <Button
                      onClick={() => handleToggleSubscription(searchEmail, true)}
                      className="w-full sm:w-auto ml-2"
                      variant="destructive"
                      data-testid="button-deactivate-subscription"
                    >
                      <XCircle className="ml-2 h-4 w-4" />
                      إلغاء الاشتراك
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 mt-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-bold text-lg mb-2 text-yellow-900 dark:text-yellow-100">
                ملاحظة هامة
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                للحصول على اشتراك جديد، يرجى التواصل مع المسؤول عبر تيليجرام:
              </p>
              <a 
                href="https://t.me/mohmmed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                T.me/mohmmed
              </a>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
