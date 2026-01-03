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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  GraduationCap,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  Award,
  BookOpen,
  ChevronDown
} from "lucide-react";
import type { Scholarship } from "@shared/schema";

const countries = ["All Countries", "United States", "United Kingdom", "Canada", "International"];

export default function Scholarships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: scholarships = [], isLoading } = useQuery<Scholarship[]>({
    queryKey: ["/api/scholarships"],
  });

  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesSearch =
      scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === "All Countries" || scholarship.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const totalAmount = scholarships.reduce((sum, s) => {
    const match = s.amount.match(/\$?([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(",", "")) : 0);
  }, 0);

  const uniqueCountries = [...new Set(scholarships.map(s => s.country))].length;
  const openDeadlines = scholarships.filter(s => s.deadline && new Date(s.deadline) > new Date()).length;

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
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
        <h1 className="text-4xl font-bold">Scholarships</h1>
        <p className="text-muted-foreground mt-1">Find funding opportunities for your education</p>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-chart-1" />
          <span className="text-sm"><span className="font-bold">${totalAmount.toLocaleString()}+</span> available</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-chart-2" />
          <span className="text-sm"><span className="font-bold">{openDeadlines}</span> open deadlines</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-chart-3" />
          <span className="text-sm"><span className="font-bold">{uniqueCountries}</span> countries</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scholarships..."
            className="pl-9 bg-muted/50 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-scholarships"
          />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-48 bg-muted/50 border-0" data-testid="select-country-filter">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredScholarships.map((scholarship) => (
          <Collapsible
            key={scholarship.id}
            open={expandedId === scholarship.id}
            onOpenChange={(open) => setExpandedId(open ? scholarship.id : null)}
          >
            <div
              className="rounded-xl bg-card hover-elevate"
              data-testid={`card-scholarship-${scholarship.id}`}
            >
              <CollapsibleTrigger asChild>
                <button 
                  className="w-full p-5 text-left"
                  data-testid={`button-expand-scholarship-${scholarship.id}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{scholarship.name}</h3>
                        <p className="text-sm text-muted-foreground">{scholarship.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="font-mono gap-1">
                        <DollarSign className="h-3 w-3" />
                        {scholarship.amount}
                      </Badge>
                      <Badge variant="secondary">{scholarship.country}</Badge>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === scholarship.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-5 pb-5 pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        Requirements
                      </h4>
                      <p className="text-sm">{scholarship.requirements}</p>
                    </div>
                    {scholarship.eligibility && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Eligibility
                        </h4>
                        <p className="text-sm">{scholarship.eligibility}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {scholarship.deadline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    )}
                    <Button variant="outline" asChild>
                      <a href={scholarship.applyUrl || "#"} target="_blank" rel="noopener noreferrer" data-testid={`button-apply-scholarship-${scholarship.id}`}>
                        Learn More
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {filteredScholarships.length === 0 && !isLoading && (
        <div className="py-16 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
          <p className="text-muted-foreground">Try adjusting your search or country filter</p>
        </div>
      )}
    </div>
  );
}
