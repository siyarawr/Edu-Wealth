import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  User,
  CalendarDays,
  LayoutGrid,
  List,
  Sparkles
} from "lucide-react";
import type { Seminar } from "@shared/schema";

const seminarCategories = [
  { id: "all", label: "All" },
  { id: "Career Development", label: "Career" },
  { id: "Speaker Event", label: "Speakers" },
  { id: "Student Talk", label: "Student Talks" },
  { id: "Grad Event", label: "Grad" },
  { id: "Workshop", label: "Workshops" },
];

const categoryColors: Record<string, string> = {
  "Career Development": "bg-chart-1/15 text-chart-1 border-chart-1/20",
  "Speaker Event": "bg-chart-2/15 text-chart-2 border-chart-2/20",
  "Student Talk": "bg-chart-3/15 text-chart-3 border-chart-3/20",
  "Grad Event": "bg-chart-4/15 text-chart-4 border-chart-4/20",
  "Workshop": "bg-chart-5/15 text-chart-5 border-chart-5/20",
};

export default function Seminars() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");

  const { data: seminars = [], isLoading } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
  });

  const filteredSeminars = seminars.filter((seminar) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || seminar.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getMonthDay = (dateString: string | Date) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      day: date.getDate(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const groupedSeminars = filteredSeminars.reduce((acc, seminar) => {
    const dateKey = new Date(seminar.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(seminar);
    return acc;
  }, {} as Record<string, Seminar[]>);

  const upcomingSeminars = seminars.filter(s => new Date(s.date) > new Date());

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Seminars</h1>
        <p className="text-muted-foreground mt-1">Discover upcoming university events and workshops</p>
      </div>

      <div className="flex gap-3 p-1.5 rounded-xl bg-muted/50 w-fit">
        {seminarCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              categoryFilter === cat.id
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover-elevate"
            }`}
            data-testid={`tab-category-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seminars or speakers..."
            className="pl-9 bg-muted/50 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-seminars"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{upcomingSeminars.length} upcoming</span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <Button
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("timeline")}
              data-testid="button-view-timeline"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "timeline" ? (
        <div className="space-y-6">
          {Object.entries(groupedSeminars).map(([dateKey, daySeminars]) => {
            const dateInfo = getMonthDay(dateKey);
            return (
              <div key={dateKey} className="flex gap-4">
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">{dateInfo.weekday}</span>
                  <span className="text-2xl font-bold">{dateInfo.day}</span>
                  <span className="text-xs text-muted-foreground">{dateInfo.month}</span>
                </div>
                <div className="flex-1 space-y-3">
                  {daySeminars.map((seminar) => (
                    <div
                      key={seminar.id}
                      className="p-4 rounded-xl bg-card hover-elevate group"
                      data-testid={`card-seminar-${seminar.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`${categoryColors[seminar.category] || ""} text-xs`}
                            >
                              {seminar.category}
                            </Badge>
                            {seminar.isVirtual && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Video className="h-3 w-3" />
                                Virtual
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{seminar.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{seminar.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {seminar.speaker}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(seminar.date)} ({seminar.duration}min)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {seminar.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`button-details-${seminar.id}`}>
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>{seminar.title}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh]">
                                <div className="space-y-4 pr-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={`${categoryColors[seminar.category] || ""}`}>
                                      {seminar.category}
                                    </Badge>
                                    {seminar.isVirtual && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Video className="h-3 w-3" />
                                        Virtual
                                      </Badge>
                                    )}
                                    {seminar.university && (
                                      <Badge variant="outline">{seminar.university}</Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground">{seminar.description}</p>
                                  <div className="p-4 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {seminar.speaker.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{seminar.speaker}</p>
                                        {seminar.speakerBio && (
                                          <p className="text-sm text-muted-foreground">{seminar.speakerBio}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium mb-1">Date & Time</p>
                                      <p className="text-muted-foreground">
                                        {formatDate(seminar.date)} at {formatTime(seminar.date)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium mb-1">Duration</p>
                                      <p className="text-muted-foreground">{seminar.duration} minutes</p>
                                    </div>
                                    <div>
                                      <p className="font-medium mb-1">Location</p>
                                      <p className="text-muted-foreground">{seminar.location}</p>
                                    </div>
                                    {seminar.university && (
                                      <div>
                                        <p className="font-medium mb-1">University</p>
                                        <p className="text-muted-foreground">{seminar.university}</p>
                                      </div>
                                    )}
                                  </div>
                                  <Button className="w-full" asChild>
                                    <a href={seminar.signupUrl || "#"} target="_blank" rel="noopener noreferrer">
                                      Sign Up Now
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" asChild>
                            <a href={seminar.signupUrl || "#"} target="_blank" rel="noopener noreferrer" data-testid={`button-signup-${seminar.id}`}>
                              Sign Up
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSeminars.map((seminar) => (
            <div
              key={seminar.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card hover-elevate"
              data-testid={`card-seminar-${seminar.id}`}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary text-center flex-shrink-0">
                <span className="text-xs font-medium">{getMonthDay(seminar.date).month}</span>
                <span className="text-lg font-bold leading-none">{getMonthDay(seminar.date).day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{seminar.title}</h3>
                  <Badge variant="outline" className={`${categoryColors[seminar.category] || ""} text-xs flex-shrink-0`}>
                    {seminar.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{seminar.speaker}</span>
                  <span>{formatTime(seminar.date)}</span>
                  <span>{seminar.duration}min</span>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={seminar.signupUrl || "#"} target="_blank" rel="noopener noreferrer">
                  Sign Up
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}

      {filteredSeminars.length === 0 && !isLoading && (
        <div className="py-16 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No seminars found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
