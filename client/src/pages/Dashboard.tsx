import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Tv } from "lucide-react";
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;

  const [selectedGroup, setSelectedGroup] = useState<ChannelGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
      return;
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const handleChannelClick = (channelId: string, channelName: string) => {
    if (typedUser?.isSubscribed) {
      setLocation(`/player/${channelId}`);
    } else {
      toast({
        title: "اشتراك مطلوب",
        description: "يرجى تفعيل الاشتراك للمشاهدة",
        variant: "destructive",
      });
    }
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

  if (isLoading || categoriesLoading) {
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

      <main className="flex-1">
        {!typedUser?.isSubscribed && (
          <div className="container mx-auto px-4 pt-6">
            <SubscriptionBanner />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
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
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all overflow-hidden"
                      onClick={() => handleGroupClick(group)}
                      data-testid={`group-card-${group.name}`}
                    >
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
                          {!typedUser?.isSubscribed && (
                            <Badge variant="secondary" className="text-xs">
                              🔒 مغلق
                            </Badge>
                          )}
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
                className="hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => {
                  setIsGroupDialogOpen(false);
                  handleChannelClick(channel.id, channel.name);
                }}
                data-testid={`channel-card-${channel.name}`}
              >
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
