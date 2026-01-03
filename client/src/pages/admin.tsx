import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, LogIn, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminStats {
  totalUsers: number;
  todaySignups: number;
  todayLogins: number;
  weeklyActive: number;
}

interface UserEvent {
  id: number;
  userId: string | null;
  eventType: string;
  userEmail: string | null;
  userName: string | null;
  createdAt: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();

  const { data: adminCheck, isLoading: checkLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: adminCheck?.isAdmin,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<UserEvent[]>({
    queryKey: ["/api/admin/events"],
    enabled: adminCheck?.isAdmin,
  });

  useEffect(() => {
    if (!checkLoading && !adminCheck?.isAdmin) {
      setLocation("/");
    }
  }, [adminCheck, checkLoading, setLocation]);

  if (checkLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Activity Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track sign-ups and logins</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Users</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono" data-testid="text-total-users">
                {stats?.totalUsers || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Today's Sign-ups</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono" data-testid="text-today-signups">
                {stats?.todaySignups || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <LogIn className="h-4 w-4" />
              <span className="text-sm">Today's Logins</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono" data-testid="text-today-logins">
                {stats?.todayLogins || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Weekly Active</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono" data-testid="text-weekly-active">
                {stats?.weeklyActive || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity yet. Events will appear here when users sign up or log in.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`event-${event.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={event.eventType === "signup" ? "default" : "secondary"}
                      className="min-w-[70px] justify-center"
                    >
                      {event.eventType === "signup" ? "Sign Up" : "Login"}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {event.userName || event.userEmail || "Anonymous"}
                      </p>
                      {event.userEmail && event.userName && (
                        <p className="text-xs text-muted-foreground">{event.userEmail}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
