import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  BookOpen,
  Sparkles,
  FileText,
  Calendar,
  CheckCircle2,
  Lightbulb,
  ListTodo,
  Loader2,
  Download,
  Trash2
} from "lucide-react";
import type { SeminarNote, Seminar } from "@shared/schema";

interface NoteWithParsed extends SeminarNote {
  parsedKeyPoints?: string[];
  parsedActionItems?: string[];
}

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInput, setAiInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading: notesLoading } = useQuery<SeminarNote[]>({
    queryKey: ["/api/notes"],
  });

  const { data: seminars = [] } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
  });

  const generateNotesMutation = useMutation({
    mutationFn: async (transcript: string) => {
      const response = await apiRequest("POST", "/api/notes/generate", { transcript });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setAiInput("");
      toast({
        title: "Notes generated!",
        description: "Your AI-powered notes have been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
    },
  });

  const parseNote = (note: SeminarNote): NoteWithParsed => {
    let parsedKeyPoints: string[] = [];
    let parsedActionItems: string[] = [];
    
    try {
      if (note.keyPoints) {
        parsedKeyPoints = JSON.parse(note.keyPoints);
      }
    } catch {
      parsedKeyPoints = note.keyPoints ? [note.keyPoints] : [];
    }
    
    try {
      if (note.actionItems) {
        parsedActionItems = JSON.parse(note.actionItems);
      }
    } catch {
      parsedActionItems = note.actionItems ? [note.actionItems] : [];
    }
    
    return { ...note, parsedKeyPoints, parsedActionItems };
  };

  const filteredNotes = notes
    .map(parseNote)
    .filter((note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getSeminarTitle = (seminarId: number) => {
    const seminar = seminars.find(s => s.id === seminarId);
    return seminar?.title || "General Notes";
  };

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const upcomingSeminars = seminars.filter(s => new Date(s.date) > new Date()).slice(0, 3);

  const totalActionItems = filteredNotes.reduce(
    (sum, note) => sum + (note.parsedActionItems?.length || 0),
    0
  );

  if (notesLoading) {
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
              <CardContent className="pt-4 pb-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">My Notes</h1>
          <p className="text-muted-foreground">AI-powered notes from your seminars</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-xs text-muted-foreground">Saved Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalActionItems}</p>
                <p className="text-xs text-muted-foreground">Action Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{upcomingSeminars.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Seminars</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-notes"
            />
          </div>

          {/* Notes Grid */}
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} data-testid={`card-note-${note.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{getSeminarTitle(note.seminarId)}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {note.parsedKeyPoints && note.parsedKeyPoints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-chart-4" />
                          Key Points ({note.parsedKeyPoints.length})
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {note.parsedKeyPoints.slice(0, 3).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-chart-2">-</span>
                              <span className="line-clamp-1">{point}</span>
                            </li>
                          ))}
                          {note.parsedKeyPoints.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{note.parsedKeyPoints.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {note.parsedActionItems && note.parsedActionItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-chart-1" />
                          Action Items ({note.parsedActionItems.length})
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {note.parsedActionItems.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 text-chart-2" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                          {note.parsedActionItems.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{note.parsedActionItems.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1" data-testid={`button-view-note-${note.id}`}>
                        View Full Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{getSeminarTitle(note.seminarId)}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh]">
                        <div className="space-y-6 pr-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(note.createdAt)}
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium">Summary</h3>
                            <p className="text-muted-foreground">{note.content}</p>
                          </div>
                          
                          {note.parsedKeyPoints && note.parsedKeyPoints.length > 0 && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h3 className="font-medium flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-chart-4" />
                                  Key Points
                                </h3>
                                <ul className="space-y-2">
                                  {note.parsedKeyPoints.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="text-chart-2 font-bold">{idx + 1}.</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                          
                          {note.parsedActionItems && note.parsedActionItems.length > 0 && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h3 className="font-medium flex items-center gap-2">
                                  <ListTodo className="h-4 w-4 text-chart-1" />
                                  Action Items
                                </h3>
                                <ul className="space-y-2">
                                  {note.parsedActionItems.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                      <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                          
                          <div className="flex gap-2 pt-4">
                            <Button variant="outline" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              className="text-destructive"
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredNotes.length === 0 && !notesLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes found</h3>
                <p className="text-muted-foreground">
                  Use the AI note taker to generate notes from seminar transcripts
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Note Taker Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Note Taker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste your seminar transcript or notes, and AI will extract key points and action items.
              </p>
              <Textarea
                placeholder="Paste seminar transcript or notes here..."
                className="min-h-32"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                data-testid="textarea-ai-input"
              />
              <Button
                className="w-full"
                onClick={() => generateNotesMutation.mutate(aiInput)}
                disabled={generateNotesMutation.isPending || !aiInput.trim()}
                data-testid="button-generate-notes"
              >
                {generateNotesMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Seminars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSeminars.length > 0 ? (
                upcomingSeminars.map((seminar) => (
                  <div
                    key={seminar.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{seminar.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(seminar.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming seminars
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
