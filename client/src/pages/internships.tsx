import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Briefcase,
  Laptop,
  Sparkles
} from "lucide-react";
import type { Internship } from "@shared/schema";

const types = ["All", "Summer", "Fall", "Spring", "Year-round"];
const locations = ["All", "Remote Only", "On-site Only"];

export default function Internships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const { data: internships = [], isLoading } = useQuery<Internship[]>({
    queryKey: ["/api/internships"],
  });

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || internship.type === typeFilter;
    const matchesLocation =
      locationFilter === "All" ||
      (locationFilter === "Remote Only" && internship.isRemote) ||
      (locationFilter === "On-site Only" && !internship.isRemote);
    return matchesSearch && matchesType && matchesLocation;
  });

  const remoteCount = internships.filter(i => i.isRemote).length;

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Internships</h1>
        <p className="text-muted-foreground mt-1">Discover your first career opportunities</p>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="text-sm"><span className="font-bold">{internships.length}</span> opportunities</span>
        </div>
        <div className="flex items-center gap-2">
          <Laptop className="h-4 w-4 text-chart-2" />
          <span className="text-sm"><span className="font-bold">{remoteCount}</span> remote</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-chart-4" />
          <span className="text-sm">Updated daily</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or role..."
            className="pl-9 bg-muted/50 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-internships"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-muted/50 border-0" data-testid="select-type-filter">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-40 bg-muted/50 border-0" data-testid="select-location-filter">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredInternships.map((internship) => (
          <div
            key={internship.id}
            className="p-5 rounded-xl bg-card hover-elevate"
            data-testid={`card-internship-${internship.id}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold flex-shrink-0">
                {internship.company.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{internship.title}</h3>
                    <p className="text-sm text-muted-foreground">{internship.company}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline">{internship.type}</Badge>
                    {internship.isRemote && (
                      <Badge variant="secondary" className="gap-1">
                        <Laptop className="h-3 w-3" />
                        Remote
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{internship.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {internship.location}
                  </span>
                  {internship.salary && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <DollarSign className="h-3.5 w-3.5" />
                      {internship.salary}
                    </span>
                  )}
                  {internship.deadline && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Due {new Date(internship.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Requirements</p>
                  <p className="text-sm">{internship.requirements}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <a href={internship.applyUrl || "#"} target="_blank" rel="noopener noreferrer" data-testid={`button-apply-${internship.id}`}>
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline">Save</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInternships.length === 0 && !isLoading && (
        <div className="py-16 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No internships found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
