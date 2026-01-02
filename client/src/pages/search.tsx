import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import {
  Search as SearchIcon,
  Calendar,
  FileText,
  BookOpen,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Loader2
} from "lucide-react";
import type { Seminar, SeminarNote, MeetingNote, Scholarship, Internship, EntrepreneurContent } from "@shared/schema";

interface SearchResults {
  seminars: Seminar[];
  seminarNotes: SeminarNote[];
  meetingNotes: MeetingNote[];
  scholarships: Scholarship[];
  internships: Internship[];
  entrepreneurContent: EntrepreneurContent[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchQuery]);

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const hasResults = results && (
    results.seminars?.length > 0 ||
    results.seminarNotes?.length > 0 ||
    results.meetingNotes?.length > 0 ||
    results.scholarships?.length > 0 ||
    results.internships?.length > 0 ||
    results.entrepreneurContent?.length > 0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Find seminars, notes, scholarships, and more</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for seminars, meeting notes, scholarships..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-12 text-lg"
          autoFocus
          data-testid="input-global-search"
        />
      </div>

      {searchQuery.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search across all your content</p>
        </div>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Type at least 2 characters to search</p>
        </div>
      )}

      {isLoading && debouncedQuery.length >= 2 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {debouncedQuery.length >= 2 && !isLoading && !hasResults && (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "{debouncedQuery}"</p>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6">
          {results?.seminars && results.seminars.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                Seminars
                <Badge variant="secondary">{results.seminars.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.seminars.map((seminar) => (
                  <Link key={seminar.id} href="/seminars">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-seminar-${seminar.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{seminar.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{seminar.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {seminar.speaker} - {new Date(seminar.date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results?.meetingNotes && results.meetingNotes.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <FileText className="h-5 w-5 text-primary" />
                Meeting Notes
                <Badge variant="secondary">{results.meetingNotes.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.meetingNotes.map((note) => (
                  <Link key={note.id} href="/meeting-notes">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-meeting-note-${note.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{note.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{note.summary || note.notes || ""}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results?.seminarNotes && results.seminarNotes.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Seminar Notes
                <Badge variant="secondary">{results.seminarNotes.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.seminarNotes.map((note) => (
                  <Link key={note.id} href="/notes">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-seminar-note-${note.id}`}>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results?.scholarships && results.scholarships.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                Scholarships
                <Badge variant="secondary">{results.scholarships.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.scholarships.map((scholarship) => (
                  <Link key={scholarship.id} href="/scholarships">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-scholarship-${scholarship.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{scholarship.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{scholarship.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {scholarship.amount}{scholarship.deadline && ` - Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results?.internships && results.internships.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Briefcase className="h-5 w-5 text-primary" />
                Internships
                <Badge variant="secondary">{results.internships.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.internships.map((internship) => (
                  <Link key={internship.id} href="/internships">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-internship-${internship.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{internship.title}</h3>
                        <p className="text-sm text-muted-foreground">{internship.company} - {internship.location}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{internship.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results?.entrepreneurContent && results.entrepreneurContent.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                Entrepreneurship Resources
                <Badge variant="secondary">{results.entrepreneurContent.length}</Badge>
              </h2>
              <div className="space-y-2">
                {results.entrepreneurContent.map((content) => (
                  <Link key={content.id} href="/entrepreneurship">
                    <Card className="hover-elevate cursor-pointer" data-testid={`search-result-entrepreneur-${content.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{content.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{content.content}</p>
                        {content.category && (
                          <Badge variant="outline" className="mt-2">{content.category}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
