import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  GraduationCap,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  Award,
  BookOpen
} from "lucide-react";
import type { Scholarship } from "@shared/schema";

const countries = ["All Countries", "United States", "United Kingdom", "Canada", "International"];

export default function Scholarships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All Countries");

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <Skeleton className="h-20 w-full" />
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
          <h1 className="text-3xl font-semibold">Scholarships</h1>
          <p className="text-muted-foreground">Find funding opportunities for your education</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {scholarships.length} scholarships available
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-1/10 text-chart-1">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}+</p>
                <p className="text-sm text-muted-foreground">Total Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-2/10 text-chart-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scholarships.filter(s => s.deadline && new Date(s.deadline) > new Date()).length}</p>
                <p className="text-sm text-muted-foreground">Open Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-3/10 text-chart-3">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueCountries}</p>
                <p className="text-sm text-muted-foreground">Countries Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-scholarships"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-48" data-testid="select-country-filter">
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
        </CardContent>
      </Card>

      {/* Scholarship List */}
      <div className="space-y-4">
        {filteredScholarships.map((scholarship) => (
          <Card key={scholarship.id} data-testid={`card-scholarship-${scholarship.id}`}>
            <Accordion type="single" collapsible>
              <AccordionItem value={`item-${scholarship.id}`} className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{scholarship.name}</h3>
                        <p className="text-sm text-muted-foreground">{scholarship.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {scholarship.amount}
                      </Badge>
                      <Badge variant="secondary">
                        {scholarship.country}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Requirements
                        </h4>
                        <p className="text-sm text-muted-foreground">{scholarship.requirements}</p>
                      </div>
                      {scholarship.eligibility && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Eligibility
                          </h4>
                          <p className="text-sm text-muted-foreground">{scholarship.eligibility}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      {scholarship.deadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      <Button asChild>
                        <a href={scholarship.applyUrl || "#"} target="_blank" rel="noopener noreferrer" data-testid={`button-apply-scholarship-${scholarship.id}`}>
                          Learn More
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>

      {filteredScholarships.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or country filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
