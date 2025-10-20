import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Tv, Lock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Stream {
  quality: string;
  hasBackup: boolean;
}

interface Channel {
  id: string;
  name: string;
  displayOrder: number;
  streams: Stream[];
}

interface ChannelGroup {
  id: string;
  name: string;
  logo: string | null;
  displayOrder: number;
  channels: Channel[];
}

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  groups: ChannelGroup[];
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const typedUser = user as User | undefined;

  const [selectedGroup, setSelectedGroup] = useState<ChannelGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  // Fetch categories without authentication requirement
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleChannelClick = (channelId: string, channelName: string) => {
    // Check if user is authenticated
    if (!typedUser) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول أولاً للمشاهدة",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/login"), 500);
      return;
    }

    // Check if user has active subscription
    if (!typedUser.isSubscribed) {
      toast({
        title: "اشتراك مطلوب",
        description: "للمشاهدة يرجى التواصل مع @mohmmed على تيليجرام لتفعيل الاشتراك",
        variant: "destructive",
      });
      return;
    }

    // User is authenticated and subscribed, proceed to player
    setLocation(`/player/${channelId}`);
  };

  const handleGroupClick = (group: ChannelGroup) => {
    if (group.channels.length === 1) {
      // If only one channel, open it directly
      handleChannelClick(group.channels[0].id, group.channels[0].name);
    } else {
      // Show channels dialog
      setSelectedGroup(group);
      setIsGroupDialogOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (categoriesLoading) {
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
        isAuthenticated={!!typedUser}
        userEmail={typedUser?.email || ""}
        isSubscribed={typedUser?.isSubscribed || false}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              AlAli Sport
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              شاهد أفضل القنوات الرياضية والإخبارية بجودة عالية
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  🎥 بث مباشر
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  📺 جودة عالية
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  ⚡ روابط بديلة
                </Badge>
              </div>
            </div>
            {!typedUser && (
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/login")}
                  data-testid="button-hero-login"
                  className="text-lg px-8"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/register")}
                  data-testid="button-hero-register"
                  className="text-lg px-8"
                >
                  إنشاء حساب جديد
                </Button>
              </div>
            )}
            {typedUser && !typedUser.isSubscribed && (
              <div className="pt-4">
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardContent className="pt-6">
                    <p className="text-lg">
                      للاشتراك والمشاهدة، تواصل مع{" "}
                      <a
                        href="https://t.me/mohmmed"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-bold"
                      >
                        @mohmmed
                      </a>{" "}
                      على تيليجرام
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">تصفح القنوات</h2>
            <p className="text-muted-foreground">
              اختر من بين مئات القنوات الرياضية والإخبارية
            </p>
          </div>

          <Tabs defaultValue={categories[0]?.id || ""} className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="category-tabs">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-lg"
                  data-testid={`tab-${category.name}`}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.groups.map((group) => (
                    <Card
                      key={group.id}
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all overflow-hidden relative"
                      onClick={() => handleGroupClick(group)}
                      data-testid={`group-card-${group.name}`}
                    >
                      {!typedUser && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="secondary" className="bg-primary/20 backdrop-blur-sm">
                            <Lock className="w-3 h-3 ml-1" />
                            مغلق
                          </Badge>
                        </div>
                      )}
                      {typedUser && !typedUser.isSubscribed && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="secondary" className="bg-destructive/20 backdrop-blur-sm">
                            <Lock className="w-3 h-3 ml-1" />
                            اشتراك
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-xl">
                          <span className="flex items-center gap-2">
                            <Tv className="w-5 h-5 text-primary" />
                            {group.name}
                          </span>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{group.channels.length} قناة</span>
                        </div>
                        {group.channels.length <= 3 && (
                          <div className="space-y-1">
                            {group.channels.map((channel) => (
                              <div
                                key={channel.id}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                {channel.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Channels Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Tv className="w-6 h-6 text-primary" />
              {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {selectedGroup?.channels.map((channel) => (
              <Card
                key={channel.id}
                className="hover-elevate active-elevate-2 cursor-pointer relative"
                onClick={() => {
                  setIsGroupDialogOpen(false);
                  handleChannelClick(channel.id, channel.name);
                }}
                data-testid={`channel-card-${channel.name}`}
              >
                {!typedUser && (
                  <div className="absolute top-2 left-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {typedUser && !typedUser.isSubscribed && (
                  <div className="absolute top-2 left-2">
                    <Lock className="w-4 h-4 text-destructive" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{channel.name}</h3>
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {channel.streams.map((stream, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`quality-badge-${stream.quality}`}
                      >
                        {stream.quality || "AUTO"}
                        {stream.hasBackup && " ⚡"}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
