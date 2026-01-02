import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Briefcase,
  GraduationCap
} from "lucide-react";
import type { Seminar } from "@shared/schema";

const seminarCategories = [
  { id: "all", label: "All Events" },
  { id: "Career Development", label: "Career" },
  { id: "Speaker Event", label: "Speakers" },
  { id: "Student Talk", label: "Student Talks" },
  { id: "Grad Event", label: "Grad Events" },
  { id: "Workshop", label: "Workshops" },
];

const categoryColors: Record<string, string> = {
  "Career Development": "bg-chart-1/10 text-chart-1",
  "Speaker Event": "bg-chart-2/10 text-chart-2",
  "Student Talk": "bg-chart-3/10 text-chart-3",
  "Grad Event": "bg-chart-4/10 text-chart-4",
  "Workshop": "bg-chart-5/10 text-chart-5",
};

export default function Seminars() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const upcomingSeminars = seminars.filter(s => new Date(s.date) > new Date());

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Seminars</h1>
          <p className="text-muted-foreground">Discover upcoming university events and workshops</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{upcomingSeminars.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{seminars.filter(s => s.isVirtual).length}</p>
                <p className="text-xs text-muted-foreground">Virtual Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{seminars.filter(s => s.category === "Career Development").length}</p>
                <p className="text-xs text-muted-foreground">Career Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{[...new Set(seminars.map(s => s.university))].length}</p>
                <p className="text-xs text-muted-foreground">Universities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seminars or speakers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-seminars"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          {seminarCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} data-testid={`tab-category-${cat.id}`}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={categoryFilter} className="mt-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeminars.map((seminar) => (
                <Card key={seminar.id} className="flex flex-col" data-testid={`card-seminar-${seminar.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className={`${categoryColors[seminar.category] || ""} border-0`}>
                        {seminar.category}
                      </Badge>
                      {seminar.isVirtual && (
                        <Badge variant="secondary" className="gap-1">
                          <Video className="h-3 w-3" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <h3 className="font-semibold line-clamp-2">{seminar.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {seminar.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{seminar.speaker}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(seminar.date)} at {formatTime(seminar.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{seminar.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{seminar.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" data-testid={`button-details-${seminar.id}`}>
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{seminar.title}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                          <div className="space-y-4 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`${categoryColors[seminar.category] || ""} border-0`}>
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
                            <div className="p-4 rounded-md bg-muted/50 space-y-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{seminar.speaker.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{seminar.speaker}</p>
                                  {seminar.speakerBio && (
                                    <p className="text-sm text-muted-foreground">{seminar.speakerBio}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Date & Time</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(seminar.date)} at {formatTime(seminar.date)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">{seminar.duration} minutes</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">{seminar.location}</p>
                              </div>
                              {seminar.university && (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">University</p>
                                  <p className="text-sm text-muted-foreground">{seminar.university}</p>
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
                    <Button className="flex-1" asChild>
                      <a href={seminar.signupUrl || "#"} target="_blank" rel="noopener noreferrer" data-testid={`button-signup-${seminar.id}`}>
                        Sign Up
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSeminars.map((seminar) => (
                <Card key={seminar.id} data-testid={`card-seminar-${seminar.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{seminar.title}</h3>
                          <Badge variant="outline" className={`${categoryColors[seminar.category] || ""} border-0`}>
                            {seminar.category}
                          </Badge>
                          {seminar.isVirtual && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Virtual
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{seminar.description}</p>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {seminar.speaker}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {formatDate(seminar.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatTime(seminar.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                          <a href={seminar.signupUrl || "#"} target="_blank" rel="noopener noreferrer">
                            Sign Up
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {filteredSeminars.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No seminars found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
