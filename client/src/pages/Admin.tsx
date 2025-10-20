import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"activate" | "deactivate">("activate");
  const [durationMonths, setDurationMonths] = useState("1");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مصرح",
        description: "أنت غير مسجل. جاري تسجيل الدخول...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && !typedUser?.isAdmin) {
      toast({
        title: "الوصول محظور",
        description: "ليس لديك صلاحيات الإدارة",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  }, [isAuthenticated, isLoading, typedUser, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!typedUser?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!typedUser?.isAdmin,
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({
      userId,
      isSubscribed,
      durationMonths,
    }: {
      userId: string;
      isSubscribed: boolean;
      durationMonths?: number;
    }) => {
      await apiRequest("POST", "/api/admin/subscription", {
        userId,
        isSubscribed,
        durationMonths,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الاشتراك بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowDialog(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث الاشتراك",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (user: User, actionType: "activate" | "deactivate") => {
    setSelectedUser(user);
    setAction(actionType);
    setDurationMonths("1");
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (!selectedUser) return;

    updateSubscriptionMutation.mutate({
      userId: selectedUser.id,
      isSubscribed: action === "activate",
      durationMonths: action === "activate" ? parseInt(durationMonths) : undefined,
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getSubscriptionStatus = (user: User) => {
    if (!user.isSubscribed) {
      return { text: "غير مشترك", variant: "secondary" as const };
    }
    
    if (!user.subscriptionExpiresAt) {
      return { text: "مشترك", variant: "default" as const };
    }

    const now = new Date();
    const expiresAt = new Date(user.subscriptionExpiresAt);
    
    if (expiresAt <= now) {
      return { text: "منتهي", variant: "destructive" as const };
    }

    return { text: "نشط", variant: "default" as const };
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ar });
    } catch {
      return "-";
    }
  };

  if (isLoading || !typedUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
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
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-foreground" data-testid="text-admin-title">
              لوحة التحكم - الإدارة
            </h1>
            <p className="text-muted-foreground mb-8">إدارة اشتراكات المستخدمين</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-users">
                    {stats?.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المشتركون النشطون</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="stat-active-subscribers">
                    {stats?.activeSubscribers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الاشتراكات المنتهية</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600" data-testid="stat-expired-subscribers">
                    {stats?.expiredSubscribers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">غير المشتركين</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-inactive-users">
                    {stats?.inactiveUsers || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">جاري التحميل...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الاسم</TableHead>
                          <TableHead className="text-right">البريد الإلكتروني</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                          <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => {
                          const status = getSubscriptionStatus(user);
                          return (
                            <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                              <TableCell className="font-medium">
                                {user.firstName} {user.lastName}
                                {user.isAdmin && (
                                  <Badge className="mr-2" variant="outline">
                                    مدير
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={status.variant} data-testid={`status-${user.id}`}>
                                  {status.text}
                                </Badge>
                              </TableCell>
                              <TableCell data-testid={`expiry-${user.id}`}>
                                {formatDate(user.subscriptionExpiresAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {!user.isSubscribed || (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) <= new Date()) ? (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleOpenDialog(user, "activate")}
                                      data-testid={`button-activate-${user.id}`}
                                    >
                                      تفعيل
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleOpenDialog(user, "deactivate")}
                                      data-testid={`button-deactivate-${user.id}`}
                                    >
                                      إلغاء
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Subscription Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "activate" ? "تفعيل الاشتراك" : "إلغاء الاشتراك"}
            </DialogTitle>
            <DialogDescription>
              {action === "activate"
                ? `تفعيل اشتراك المستخدم: ${selectedUser?.email}`
                : `إلغاء اشتراك المستخدم: ${selectedUser?.email}`}
            </DialogDescription>
          </DialogHeader>

          {action === "activate" && (
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">مدة الاشتراك</label>
              <Select value={durationMonths} onValueChange={setDurationMonths}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="اختر المدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">شهر واحد</SelectItem>
                  <SelectItem value="2">شهرين</SelectItem>
                  <SelectItem value="3">3 أشهر</SelectItem>
                  <SelectItem value="6">6 أشهر</SelectItem>
                  <SelectItem value="12">سنة كاملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-testid="button-cancel-dialog"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={updateSubscriptionMutation.isPending}
              data-testid="button-confirm-dialog"
            >
              {updateSubscriptionMutation.isPending ? "جاري التحديث..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
