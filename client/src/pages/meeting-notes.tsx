import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus,
  Calendar,
  Users,
  Share2,
  Trash2,
  FileText,
  Edit,
  Clock
} from "lucide-react";
import type { MeetingNote, User as UserType, MeetingNoteShare } from "@shared/schema";

const categories = [
  "1-on-1",
  "Team Meeting",
  "Interview",
  "Lecture",
  "Office Hours",
  "Project Review",
  "Brainstorming",
  "Other"
];

export default function MeetingNotes() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [shareDialogNoteId, setShareDialogNoteId] = useState<number | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<string>("view");
  const [newNote, setNewNote] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 16),
    category: "1-on-1",
    attendees: "",
    summary: "",
    comments: "",
    agenda: "",
    questions: "",
    notes: "",
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  });

  const { data: notes = [], isLoading } = useQuery<MeetingNote[]>({
    queryKey: ["/api/meeting-notes"],
  });

  const { data: noteWithShares } = useQuery<MeetingNote & { shares: MeetingNoteShare[] }>({
    queryKey: ["/api/meeting-notes", shareDialogNoteId],
    enabled: !!shareDialogNoteId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newNote) => {
      await apiRequest("POST", "/api/meeting-notes", {
        ...data,
        date: new Date(data.date).toISOString(),
        lastUpdatedBy: user?.fullName || user?.username || "User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] });
      setIsCreateDialogOpen(false);
      setNewNote({
        title: "",
        date: new Date().toISOString().slice(0, 16),
        category: "1-on-1",
        attendees: "",
        summary: "",
        comments: "",
        agenda: "",
        questions: "",
        notes: "",
      });
      toast({ title: "Meeting note created" });
    },
    onError: (error) => {
      console.error("Create meeting note error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to create meeting note. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MeetingNote> }) => {
      return apiRequest("PATCH", `/api/meeting-notes/${id}`, {
        ...data,
        lastUpdatedBy: user?.fullName || user?.username || "User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] });
      setEditingNote(null);
      toast({ title: "Meeting note updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/meeting-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] });
      toast({ title: "Meeting note deleted" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async ({ noteId, email, permission }: { noteId: number; email: string; permission: string }) => {
      return apiRequest("POST", `/api/meeting-notes/${noteId}/share`, { email, permission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes", shareDialogNoteId] });
      setShareEmail("");
      toast({ title: "Invitation sent", description: "An email will be sent with viewing instructions." });
    },
  });

  const removeShareMutation = useMutation({
    mutationFn: async ({ noteId, shareId }: { noteId: number; shareId: number }) => {
      return apiRequest("DELETE", `/api/meeting-notes/${noteId}/share/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes", shareDialogNoteId] });
      toast({ title: "Access removed" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading meeting notes...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">Meeting Notes</h1>
          <p className="text-muted-foreground mt-1">Record and organize your 1-1 meetings and sessions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-new-meeting-note">
              <Plus className="h-4 w-4 mr-2" />
              New Meeting Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Meeting Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="e.g., Weekly 1-1 with Manager"
                    data-testid="input-note-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newNote.category} onValueChange={(v) => setNewNote({ ...newNote, category: v })}>
                    <SelectTrigger data-testid="select-note-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newNote.date}
                    onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                    data-testid="input-note-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <Input
                    value={newNote.attendees}
                    onChange={(e) => setNewNote({ ...newNote, attendees: e.target.value })}
                    placeholder="e.g., John, Jane"
                    data-testid="input-note-attendees"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={newNote.summary}
                  onChange={(e) => setNewNote({ ...newNote, summary: e.target.value })}
                  placeholder="Brief summary of the meeting..."
                  className="min-h-[80px]"
                  data-testid="input-note-summary"
                />
              </div>
              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  value={newNote.agenda}
                  onChange={(e) => setNewNote({ ...newNote, agenda: e.target.value })}
                  placeholder="Meeting agenda items..."
                  className="min-h-[80px]"
                  data-testid="input-note-agenda"
                />
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                <Textarea
                  value={newNote.questions}
                  onChange={(e) => setNewNote({ ...newNote, questions: e.target.value })}
                  placeholder="Questions to discuss..."
                  className="min-h-[80px]"
                  data-testid="input-note-questions"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newNote.notes}
                  onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                  placeholder="Detailed notes from the meeting..."
                  className="min-h-[120px]"
                  data-testid="input-note-notes"
                />
              </div>
              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  value={newNote.comments}
                  onChange={(e) => setNewNote({ ...newNote, comments: e.target.value })}
                  placeholder="Additional comments..."
                  className="min-h-[60px]"
                  data-testid="input-note-comments"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => createMutation.mutate(newNote)}
                disabled={!newNote.title || createMutation.isPending}
                className="w-full"
                data-testid="button-submit-note"
              >
                {createMutation.isPending ? "Creating..." : "Create Meeting Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No meeting notes yet</h3>
          <p className="text-muted-foreground mb-4">Start recording your 1-1 meetings and sessions</p>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Note
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-6" data-testid={`meeting-note-${note.id}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    Last updated by {note.lastUpdatedBy || "Unknown"}
                  </div>
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="secondary">{note.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {note.attendees && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {note.attendees}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShareDialogNoteId(note.id)}
                    data-testid={`button-share-note-${note.id}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingNote(note)}
                    data-testid={`button-edit-note-${note.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Meeting Note?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this meeting note and all its content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(note.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid={`button-confirm-delete-note-${note.id}`}
                        >
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {note.summary && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{note.summary}</p>
                </div>
              )}

              {note.agenda && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Agenda</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.agenda}</p>
                </div>
              )}

              {note.questions && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Questions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.questions}</p>
                </div>
              )}

              {note.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.notes}</p>
                </div>
              )}

              {note.comments && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Comments</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.comments}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!shareDialogNoteId} onOpenChange={(open) => !open && setShareDialogNoteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Meeting Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="colleague@email.com"
                data-testid="input-share-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={sharePermission} onValueChange={setSharePermission}>
                <SelectTrigger data-testid="select-share-permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can View</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                if (shareDialogNoteId && shareEmail) {
                  shareMutation.mutate({
                    noteId: shareDialogNoteId,
                    email: shareEmail,
                    permission: sharePermission,
                  });
                }
              }}
              disabled={!shareEmail || shareMutation.isPending}
              className="w-full"
              data-testid="button-send-invite"
            >
              {shareMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>

            {noteWithShares?.shares && noteWithShares.shares.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Shared With</h4>
                <div className="space-y-2">
                  {noteWithShares.shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div>
                        <p className="text-sm">{share.email}</p>
                        <Badge variant="outline" className="text-xs">{share.permission}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShareMutation.mutate({ noteId: shareDialogNoteId!, shareId: share.id })}
                        data-testid={`button-remove-share-${share.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meeting Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    data-testid="input-edit-note-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingNote.category} onValueChange={(v) => setEditingNote({ ...editingNote, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={new Date(editingNote.date).toISOString().slice(0, 16)}
                    onChange={(e) => setEditingNote({ ...editingNote, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <Input
                    value={editingNote.attendees || ""}
                    onChange={(e) => setEditingNote({ ...editingNote, attendees: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={editingNote.summary || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, summary: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  value={editingNote.agenda || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, agenda: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                <Textarea
                  value={editingNote.questions || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, questions: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editingNote.notes || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, notes: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  value={editingNote.comments || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, comments: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>
              <Button
                onClick={() => updateMutation.mutate({ id: editingNote.id, data: editingNote })}
                disabled={updateMutation.isPending}
                className="w-full"
                data-testid="button-save-edit-note"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
