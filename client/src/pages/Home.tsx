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
import { Play, ArrowRight, Tv, Lock, Sparkles, Trophy, Newspaper, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const { user } = useAuth();
  const typedUser = user as User | undefined;

  const [selectedGroup, setSelectedGroup] = useState<ChannelGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleChannelClick = (channelId: string, channelName: string) => {
    if (!typedUser) {
      toast({
        title: "تسجيل الدخول مطلوب 🔐",
        description: "يرجى تسجيل الدخول أولاً للمشاهدة",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/login"), 800);
      return;
    }

    if (!typedUser.isSubscribed) {
      toast({
        title: "اشتراك مطلوب ⭐",
        description: "للمشاهدة يرجى التواصل مع @mohmmed على تيليجرام لتفعيل الاشتراك",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/player/${channelId}`);
  };

  const handleGroupClick = (group: ChannelGroup) => {
    if (group.channels.length === 1) {
      handleChannelClick(group.channels[0].id, group.channels[0].name);
    } else {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground animate-pulse">جاري التحميل...</p>
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

      {/* Hero Section with animated gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Logo animation */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                <Trophy className="relative w-20 h-20 text-primary animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            {/* Animated title */}
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-fade-in">
              AlAli Sport
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground font-medium animate-fade-in-delay">
              شاهد أفضل القنوات الرياضية والإخبارية بجودة عالية 
            </p>

            {/* Feature badges with stagger animation */}
            <div className="flex flex-wrap gap-3 justify-center items-center pt-4">
              <Badge variant="secondary" className="text-base px-5 py-2.5 animate-slide-up hover-elevate cursor-default transition-all">
                <Play className="w-4 h-4 ml-2" />
                بث مباشر
              </Badge>
              <Badge variant="secondary" className="text-base px-5 py-2.5 animate-slide-up animation-delay-100 hover-elevate cursor-default transition-all">
                <Tv className="w-4 h-4 ml-2" />
                جودة عالية
              </Badge>
              <Badge variant="secondary" className="text-base px-5 py-2.5 animate-slide-up animation-delay-200 hover-elevate cursor-default transition-all">
                <Zap className="w-4 h-4 ml-2" />
                روابط بديلة
              </Badge>
            </div>

            {/* CTA Buttons */}
            {!typedUser && (
              <div className="flex gap-4 justify-center pt-6 animate-fade-in-delay-2">
                <Button
                  size="lg"
                  onClick={() => setLocation("/login")}
                  data-testid="button-hero-login"
                  className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Lock className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/register")}
                  data-testid="button-hero-register"
                  className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <Sparkles className="w-5 h-5 ml-2" />
                  إنشاء حساب جديد
                </Button>
              </div>
            )}

            {/* Subscription message */}
            {typedUser && !typedUser.isSubscribed && (
              <div className="pt-6 animate-fade-in-delay-2">
                <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 shadow-lg backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <p className="text-lg flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      للاشتراك والمشاهدة، تواصل مع{" "}
                      <a
                        href="https://t.me/mohmmed"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-bold transition-all hover:scale-105 inline-block"
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

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-4 py-10">
          {/* Section header with animation */}
          <div className="mb-8 text-center md:text-right animate-fade-in">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
              <Tv className="w-8 h-8 text-primary" />
              تصفح القنوات
            </h2>
            <p className="text-muted-foreground text-lg">
              اختر من بين مئات القنوات الرياضية والإخبارية المميزة
            </p>
          </div>

          {/* Tabs with smooth transitions */}
          <Tabs defaultValue={categories[0]?.id || ""} className="w-full" dir="rtl">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 h-14 bg-muted/50 backdrop-blur-sm" data-testid="category-tabs">
              {categories.map((category, idx) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-lg font-semibold transition-all data-[state=active]:shadow-lg data-[state=active]:scale-105"
                  data-testid={`tab-${category.name}`}
                >
                  {category.name === "رياضة" && <Trophy className="w-5 h-5 ml-2" />}
                  {category.name === "أخبار" && <Newspaper className="w-5 h-5 ml-2" />}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent 
                key={category.id} 
                value={category.id} 
                className="mt-0 animate-fade-in"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.groups.map((group, idx) => (
                    <Card
                      key={group.id}
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 overflow-hidden relative group border-2 hover:border-primary/50 hover:shadow-2xl animate-scale-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => handleGroupClick(group)}
                      data-testid={`group-card-${group.name}`}
                    >
                      {/* Lock badge with glow effect */}
                      {!typedUser && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="secondary" className="bg-primary/30 backdrop-blur-md shadow-lg">
                            <Lock className="w-3 h-3 ml-1" />
                            مغلق
                          </Badge>
                        </div>
                      )}
                      {typedUser && !typedUser.isSubscribed && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="secondary" className="bg-destructive/30 backdrop-blur-md shadow-lg">
                            <Lock className="w-3 h-3 ml-1" />
                            اشتراك
                          </Badge>
                        </div>
                      )}

                      {/* Hover overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300"></div>

                      <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="flex items-center justify-between text-xl group-hover:text-primary transition-colors">
                          <span className="flex items-center gap-2">
                            <Tv className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            {group.name}
                          </span>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className="font-semibold">
                            {group.channels.length} قناة
                          </Badge>
                        </div>
                        
                        {group.channels.length <= 4 && (
                          <div className="space-y-1.5">
                            {group.channels.slice(0, 4).map((channel) => (
                              <div
                                key={channel.id}
                                className="text-sm text-muted-foreground flex items-center gap-2 group-hover:text-foreground transition-colors"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform"></div>
                                <span className="truncate">{channel.name}</span>
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

      {/* Enhanced Channels Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto backdrop-blur-xl bg-background/95 border-2" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tv className="w-7 h-7 text-primary" />
              </div>
              {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              اختر القناة للمشاهدة المباشرة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {selectedGroup?.channels.map((channel, idx) => (
              <Card
                key={channel.id}
                className="hover-elevate active-elevate-2 cursor-pointer relative group border-2 hover:border-primary/50 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => {
                  setIsGroupDialogOpen(false);
                  handleChannelClick(channel.id, channel.name);
                }}
                data-testid={`channel-card-${channel.name}`}
              >
                {!typedUser && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="p-1.5 bg-background/80 backdrop-blur-sm rounded-full">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
                {typedUser && !typedUser.isSubscribed && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="p-1.5 bg-destructive/20 backdrop-blur-sm rounded-full">
                      <Lock className="w-4 h-4 text-destructive" />
                    </div>
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                      {channel.name}
                    </h3>
                    <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {channel.streams.map((stream, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs font-semibold"
                        data-testid={`quality-badge-${stream.quality}`}
                      >
                        {stream.quality || "AUTO"}
                        {stream.hasBackup && (
                          <Zap className="w-3 h-3 mr-1 inline text-yellow-500" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom animations in style tag */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
}
