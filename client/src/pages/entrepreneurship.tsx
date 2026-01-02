import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  PlayCircle,
  BookOpen,
  Headphones,
  FileText,
  Clock,
  User,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  Rocket,
  DollarSign,
  Target
} from "lucide-react";
import type { EntrepreneurContent } from "@shared/schema";

const contentTypes = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "Article", label: "Articles", icon: FileText },
  { id: "Video", label: "Videos", icon: PlayCircle },
  { id: "Course", label: "Courses", icon: BookOpen },
  { id: "Podcast", label: "Podcasts", icon: Headphones },
];

const categories = [
  { name: "Idea Validation", icon: Lightbulb },
  { name: "Fundraising", icon: DollarSign },
  { name: "Product Development", icon: Rocket },
  { name: "Marketing", icon: TrendingUp },
  { name: "Business Strategy", icon: Target },
];

const typeIcons: Record<string, React.ReactNode> = {
  Article: <FileText className="h-4 w-4" />,
  Video: <PlayCircle className="h-4 w-4" />,
  Course: <BookOpen className="h-4 w-4" />,
  Podcast: <Headphones className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  Article: "bg-chart-1/10 text-chart-1",
  Video: "bg-chart-2/10 text-chart-2",
  Course: "bg-chart-3/10 text-chart-3",
  Podcast: "bg-chart-4/10 text-chart-4",
};

export default function Entrepreneurship() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: content = [], isLoading } = useQuery<EntrepreneurContent[]>({
    queryKey: ["/api/entrepreneur-content"],
  });

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesType;
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCategoryCounts = () => {
    return categories.map(cat => ({
      ...cat,
      count: content.filter(c => c.category === cat.name).length
    }));
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <Skeleton className="h-16 w-full" />
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Entrepreneurship</h1>
          <p className="text-muted-foreground">Learn to build and grow your business</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {content.length} resources
        </Badge>
      </div>

      {/* Category Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {getCategoryCounts().map((category) => (
          <Card key={category.name} className="hover-elevate cursor-pointer">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-content"
          />
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {contentTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="gap-2" data-testid={`tab-${type.id}`}>
              <type.icon className="h-4 w-4" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="flex flex-col" data-testid={`card-content-${item.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={`${typeColors[item.type] || ""} border-0`}>
                      {typeIcons[item.type]}
                      <span className="ml-1">{item.type}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(item.duration)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                  {item.author && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {item.author}
                    </div>
                  )}
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" data-testid={`button-view-${item.id}`}>
                    {item.type === "Video" || item.type === "Course" ? "Watch Now" : 
                     item.type === "Podcast" ? "Listen Now" : "Read Now"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredContent.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <h4 className="font-medium">Find Your Idea</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Start with a problem you're passionate about solving.
              </p>
            </div>
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h4 className="font-medium">Validate & Build</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Test your idea with real users before building.
              </p>
            </div>
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <h4 className="font-medium">Launch & Grow</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your first customers and iterate based on feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
