import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Trash2,
  Tag
} from "lucide-react";
import type { SeminarNote, Seminar } from "@shared/schema";
import jsPDF from "jspdf";

const noteCategories = ["General", "Career", "Technology", "Finance", "Personal Development", "Business"];

interface NoteWithParsed extends SeminarNote {
  parsedKeyPoints?: string[];
  parsedActionItems?: string[];
}

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading: notesLoading } = useQuery<SeminarNote[]>({
    queryKey: ["/api/notes"],
  });

  const { data: seminars = [] } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
  });

  const generateNotesMutation = useMutation({
    mutationFn: async (data: { transcript: string; title: string; category: string }) => {
      const response = await apiRequest("POST", "/api/notes/generate", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setAiInput("");
      setNoteTitle("");
      setNoteCategory("General");
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
    .filter((note) => {
      const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.title?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !categoryFilter || note.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

  const getSeminarTitle = (seminarId: number | null) => {
    if (!seminarId) return "General Notes";
    const seminar = seminars.find(s => s.id === seminarId);
    return seminar?.title || "General Notes";
  };

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const downloadAsPdf = (note: NoteWithParsed) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      const bottomMargin = pageHeight - 20;
      let yPosition = 20;

      const checkPageBreak = (neededSpace: number) => {
        if (yPosition + neededSpace > bottomMargin) {
          doc.addPage();
          yPosition = 20;
        }
      };

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const title = note.title || getSeminarTitle(note.seminarId);
      doc.text(title, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(formatDate(note.createdAt), margin, yPosition);
      if (note.category) {
        doc.text(`Category: ${note.category}`, pageWidth - margin - 40, yPosition);
      }
      yPosition += 15;
      doc.setTextColor(0, 0, 0);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const summaryLines = doc.splitTextToSize(note.content, maxWidth);
      summaryLines.forEach((line: string) => {
        checkPageBreak(7);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      if (note.parsedKeyPoints && note.parsedKeyPoints.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Key Points", margin, yPosition);
        yPosition += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        note.parsedKeyPoints.forEach((point, idx) => {
          const pointLines = doc.splitTextToSize(`${idx + 1}. ${point}`, maxWidth - 5);
          pointLines.forEach((line: string) => {
            checkPageBreak(7);
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
          yPosition += 2;
        });
        yPosition += 7;
      }

      if (note.parsedActionItems && note.parsedActionItems.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Action Items", margin, yPosition);
        yPosition += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        note.parsedActionItems.forEach((item) => {
          const itemLines = doc.splitTextToSize(`- ${item}`, maxWidth - 5);
          itemLines.forEach((line: string) => {
            checkPageBreak(7);
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
          yPosition += 2;
        });
      }

      const fileName = `${(note.title || "notes").replace(/[^a-z0-9]/gi, "_")}_${formatDate(note.createdAt).replace(/[^a-z0-9]/gi, "_")}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: `${fileName} has been saved.`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const upcomingSeminars = seminars.filter(s => new Date(s.date) > new Date()).slice(0, 3);

  if (notesLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">My Notes</h1>
        <p className="text-muted-foreground mt-1">AI-powered notes from your seminars</p>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm"><span className="font-bold">{notes.length}</span> notes</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-chart-2" />
          <span className="text-sm">
            <span className="font-bold">
              {filteredNotes.reduce((sum, note) => sum + (note.parsedActionItems?.length || 0), 0)}
            </span> action items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-chart-4" />
          <span className="text-sm"><span className="font-bold">{upcomingSeminars.length}</span> upcoming</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-9 bg-muted/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-notes"
              />
            </div>
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px] bg-muted/50 border-0" data-testid="select-category-filter">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {noteCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div key={note.id} className="p-5 rounded-xl bg-card hover-elevate" data-testid={`card-note-${note.id}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold">{note.title || getSeminarTitle(note.seminarId)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {note.category && (
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {note.content}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {note.parsedKeyPoints && note.parsedKeyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5 text-chart-4" />
                        Key Points
                      </h4>
                      <ul className="text-sm space-y-1">
                        {note.parsedKeyPoints.slice(0, 2).map((point, idx) => (
                          <li key={idx} className="line-clamp-1 text-muted-foreground">{point}</li>
                        ))}
                        {note.parsedKeyPoints.length > 2 && (
                          <li className="text-xs text-muted-foreground">+{note.parsedKeyPoints.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {note.parsedActionItems && note.parsedActionItems.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                        <ListTodo className="h-3.5 w-3.5 text-chart-1" />
                        Action Items
                      </h4>
                      <ul className="text-sm space-y-1">
                        {note.parsedActionItems.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-chart-2 flex-shrink-0" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                        {note.parsedActionItems.length > 2 && (
                          <li className="text-xs text-muted-foreground">+{note.parsedActionItems.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-note-${note.id}`}>
                        View Full Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{getSeminarTitle(note.seminarId)}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[65vh]">
                        <div className="space-y-5 pr-4">
                          <p className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</p>
                          
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
                            <Button variant="outline" className="flex-1" onClick={() => downloadAsPdf(note)} data-testid={`button-download-note-${note.id}`}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && !notesLoading && (
            <div className="py-16 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notes found</h3>
              <p className="text-muted-foreground">Use the AI note taker to generate notes</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">AI Note Taker</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paste your seminar transcript and AI will extract key points and action items.
            </p>
            <div className="space-y-3 mb-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  placeholder="Note title..."
                  className="mt-1 bg-muted/50 border-0"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  data-testid="input-note-title"
                />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={noteCategory} onValueChange={setNoteCategory}>
                  <SelectTrigger className="mt-1 bg-muted/50 border-0" data-testid="select-note-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Transcript</Label>
                <Textarea
                  placeholder="Paste transcript here..."
                  className="mt-1 min-h-28 bg-muted/50 border-0"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  data-testid="textarea-ai-input"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => generateNotesMutation.mutate({ 
                transcript: aiInput, 
                title: noteTitle || "Untitled Note", 
                category: noteCategory 
              })}
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
          </div>

          <div className="p-5 rounded-xl bg-card">
            <h2 className="font-semibold mb-3">Upcoming Seminars</h2>
            <div className="space-y-2">
              {upcomingSeminars.length > 0 ? (
                upcomingSeminars.map((seminar) => (
                  <div key={seminar.id} className="p-3 rounded-lg bg-muted/50 hover-elevate">
                    <p className="text-sm font-medium line-clamp-1">{seminar.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(seminar.date)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming seminars</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
