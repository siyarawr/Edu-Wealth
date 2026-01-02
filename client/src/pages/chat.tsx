import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Plus,
  Send,
  Heart,
  ThumbsUp,
  Mail,
  MessageCircle,
  Reply,
  X,
  Trash2
} from "lucide-react";
import type { Conversation, Message, MessageReaction, ConversationParticipant, User as UserType } from "@shared/schema";

type ConversationWithParticipants = Conversation & {
  participants: ConversationParticipant[];
};

type ConversationWithMessages = Conversation & {
  participants: ConversationParticipant[];
  messages: (Message & { reactions: MessageReaction[] })[];
};

export default function Chat() {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  });

  const { data: conversations = [] } = useQuery<ConversationWithParticipants[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: currentConversation, refetch: refetchConversation } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/conversations", {
        email: user?.email || "",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (data && typeof data === 'object' && 'id' in data) {
        setSelectedConversation((data as { id: number }).id);
      }
      toast({ title: "New conversation started" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ conversationId, email }: { conversationId: number; email: string }) => {
      return apiRequest("POST", `/api/conversations/${conversationId}/invite`, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation] });
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      toast({ title: "Invitation sent", description: "They will receive an email to join this chat." });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, replyToId }: { conversationId: number; content: string; replyToId?: number }) => {
      return apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
        senderName: user?.fullName || user?.username || "You",
        replyToId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation] });
      setNewMessage("");
      setReplyingTo(null);
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: number; reaction: string }) => {
      return apiRequest("POST", `/api/messages/${messageId}/reactions/toggle`, { reaction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return apiRequest("DELETE", `/api/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(null);
      toast({ title: "Chat deleted", description: "The conversation has been permanently deleted." });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      replyToId: replyingTo?.id,
    });
  };

  const getOtherParticipant = (conv: ConversationWithParticipants) => {
    const other = conv.participants.find(p => p.userId !== "default-user");
    return other?.email || "New Chat";
  };

  const getReplyMessage = (replyToId: number) => {
    return currentConversation?.messages.find(m => m.id === replyToId);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r flex flex-col bg-sidebar">
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <h2 className="font-semibold">Messages</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => createConversationMutation.mutate()}
            data-testid="button-new-conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to message someone</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 rounded-lg text-left hover-elevate ${
                    selectedConversation === conv.id ? "bg-sidebar-accent" : ""
                  }`}
                  data-testid={`conversation-${conv.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getOtherParticipant(conv).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getOtherParticipant(conv)}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.participants.length} participant{conv.participants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-sm mb-4">Choose a chat or start a new conversation</p>
              <Button onClick={() => createConversationMutation.mutate()}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {currentConversation?.participants?.[0]?.email?.charAt(0)?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {currentConversation?.participants?.length === 1
                      ? "Waiting for participant..."
                      : currentConversation?.participants?.map(p => p.email).join(", ") || "Chat"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentConversation?.participants?.length || 0} participant(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-invite-to-chat">
                      <Mail className="h-4 w-4 mr-2" />
                      Invite via Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite to Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground">
                        Send an email invitation to start a secure 1-1 conversation.
                      </p>
                      <Input
                        type="email"
                        placeholder="colleague@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        data-testid="input-invite-email"
                      />
                      <Button
                        onClick={() => {
                          if (selectedConversation && inviteEmail) {
                            inviteMutation.mutate({ conversationId: selectedConversation, email: inviteEmail });
                          }
                        }}
                        disabled={!inviteEmail || inviteMutation.isPending}
                        className="w-full"
                        data-testid="button-send-chat-invite"
                      >
                        {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-chat">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the entire conversation including all messages, reactions, and shared content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (selectedConversation) {
                            deleteConversationMutation.mutate(selectedConversation);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-delete-chat"
                      >
                        Yes, Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation?.messages?.map((message) => {
                  const isOwnMessage = message.senderId === "default-user";
                  const replyMessage = message.replyToId ? getReplyMessage(message.replyToId) : null;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
                        {replyMessage && (
                          <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-muted">
                            <span className="font-medium">{replyMessage.senderName}</span>: {replyMessage.content.slice(0, 50)}...
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-medium mb-1">{message.senderName || "User"}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {message.isEdited && " (edited)"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {message.reactions && message.reactions.filter(r => r.reaction === "heart").length > 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              <Heart className="h-3 w-3 text-red-500 fill-red-500 mr-1" />
                              {message.reactions.filter(r => r.reaction === "heart").length}
                            </Badge>
                          )}
                          {message.reactions && message.reactions.filter(r => r.reaction === "thumbs_up").length > 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              <ThumbsUp className="h-3 w-3 text-blue-500 fill-blue-500 mr-1" />
                              {message.reactions.filter(r => r.reaction === "thumbs_up").length}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleReactionMutation.mutate({ messageId: message.id, reaction: "heart" })}
                            data-testid={`button-react-heart-${message.id}`}
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleReactionMutation.mutate({ messageId: message.id, reaction: "thumbs_up" })}
                            data-testid={`button-react-thumbsup-${message.id}`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setReplyingTo(message)}
                            data-testid={`button-reply-${message.id}`}
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 p-2 rounded-md bg-muted text-sm">
                  <Reply className="h-4 w-4" />
                  <span className="flex-1 truncate">
                    Replying to <span className="font-medium">{replyingTo.senderName}</span>: {replyingTo.content.slice(0, 40)}...
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
