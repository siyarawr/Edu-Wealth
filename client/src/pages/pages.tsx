import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, FileText, Trash2, Search, Edit2, Save } from "lucide-react";
import type { Page } from "@shared/schema";

const emojiOptions = ["📄", "📝", "📋", "📌", "📁", "📂", "📑", "📓", "📔", "📒", "📕", "📗", "📘", "📙"];

export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editEmoji, setEditEmoji] = useState("📄");
  const [isEditing, setIsEditing] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("📄");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: { title: string; emoji: string }) => {
      await apiRequest("POST", "/api/pages", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pages"] });
      setNewDialogOpen(false);
      setNewTitle("");
      setNewEmoji("📄");
      toast({ title: "Page created", description: "Your new page is ready." });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (data: { id: number; title: string; content: string; emoji: string }) => {
      await apiRequest("PATCH", `/api/pages/${data.id}`, {
        title: data.title,
        content: data.content,
        emoji: data.emoji,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsEditing(false);
      toast({ title: "Saved", description: "Your changes have been saved." });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/pages/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pages"] });
      setSelectedPage(null);
      toast({ title: "Deleted", description: "Page has been removed." });
    },
  });

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
    setEditTitle(page.title);
    setEditContent(page.content || "");
    setEditEmoji(page.emoji || "📄");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (selectedPage) {
      updatePageMutation.mutate({
        id: selectedPage.id,
        title: editTitle,
        content: editContent,
        emoji: editEmoji,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">Your personal documents and notes</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-new-page">
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewEmoji(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg hover-elevate ${newEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50"}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Page title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                data-testid="input-new-page-title"
              />
              <Button
                onClick={() => createPageMutation.mutate({ title: newTitle || "Untitled", emoji: newEmoji })}
                disabled={createPageMutation.isPending}
                className="w-full"
                data-testid="button-create-page"
              >
                Create Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              className="pl-9 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-pages"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 pr-4">
              {filteredPages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No pages yet</p>
                  <p className="text-sm">Create your first page to get started</p>
                </div>
              ) : (
                filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page)}
                    className={`w-full text-left p-3 rounded-lg hover-elevate ${selectedPage?.id === page.id ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"}`}
                    data-testid={`button-page-${page.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{page.emoji || "📄"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{page.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(page.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-2">
          {selectedPage ? (
            <div className="rounded-xl bg-card p-6 h-[calc(100vh-200px)] flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {isEditing ? (
                    <>
                      <div className="flex gap-1 flex-wrap">
                        {emojiOptions.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEditEmoji(emoji)}
                            className={`w-8 h-8 text-lg rounded hover-elevate ${editEmoji === emoji ? "bg-primary/20" : "bg-muted/50"}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-xl font-semibold"
                        data-testid="input-edit-page-title"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">{selectedPage.emoji || "📄"}</span>
                      <h2 className="text-2xl font-semibold">{selectedPage.title}</h2>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={updatePageMutation.isPending}
                      data-testid="button-save-page"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      data-testid="button-edit-page"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="button-delete-page">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{selectedPage.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePageMutation.mutate(selectedPage.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Last updated: {formatDate(selectedPage.updatedAt)}
              </p>

              <div className="flex-1">
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-full min-h-[400px] resize-none"
                    placeholder="Start writing..."
                    data-testid="textarea-page-content"
                  />
                ) : (
                  <ScrollArea className="h-full">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {selectedPage.content || (
                        <span className="text-muted-foreground italic">
                          Click edit to start writing...
                        </span>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-card p-6 h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a page</p>
                <p className="text-sm">or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
