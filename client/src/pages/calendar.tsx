import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  CheckCircle,
  Circle
} from "lucide-react";
import type { CalendarEvent, Seminar } from "@shared/schema";

const eventColors: Record<string, string> = {
  task: "bg-blue-500",
  seminar: "bg-purple-500",
  reminder: "bg-yellow-500",
  deadline: "bg-red-500",
};

const eventLabels: Record<string, string> = {
  task: "Task",
  seminar: "Seminar",
  reminder: "Reminder",
  deadline: "Deadline",
};

function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    week.push(day);
  }
  return week;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function parseEventDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const date = new Date(dateStr);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export default function Calendar() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showSeminars, setShowSeminars] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewDays, setViewDays] = useState<4 | 7>(7);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "task" as string,
    date: toLocalDateString(new Date()),
    time: "09:00",
  });

  const weekDates = getWeekDates(currentWeek);
  const displayDates = viewDays === 4 ? weekDates.slice(0, 4) : weekDates;
  const startOfWeek = displayDates[0];
  const endOfWeek = displayDates[displayDates.length - 1];

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar", { start: startOfWeek.toISOString(), end: endOfWeek.toISOString() }],
    queryFn: async () => {
      const response = await fetch(`/api/calendar?start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const { data: seminars = [] } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
  });

  const createMutation = useMutation({
    mutationFn: async (event: { title: string; type: string; dateString: string }) => {
      await apiRequest("POST", "/api/calendar", {
        title: event.title,
        type: event.type,
        dateString: event.dateString,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/calendar" });
      setIsAddDialogOpen(false);
      setNewEvent({ title: "", type: "task", date: toLocalDateString(new Date()), time: "09:00" });
      toast({ title: "Event created" });
    },
    onError: (error) => {
      console.error("Create event error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to create event. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/calendar/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/calendar" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/calendar" });
      toast({ title: "Event deleted" });
    },
  });

  const handleAddEvent = () => {
    const dateString = `${newEvent.date}T${newEvent.time}:00`;
    createMutation.mutate({
      title: newEvent.title,
      type: newEvent.type,
      dateString: dateString,
    });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const getEventsForDay = (date: Date) => {
    const targetDateStr = toLocalDateString(date);
    const dayEvents = events.filter(e => {
      const dateValue = e.date as unknown as string | Date;
      const eventDateStr = typeof dateValue === 'string' ? dateValue.split('T')[0] : toLocalDateString(new Date(dateValue));
      return eventDateStr === targetDateStr;
    });
    
    if (showSeminars) {
      const daySeminars = seminars
        .filter(s => {
          const dateValue = s.date as unknown as string | Date;
          const seminarDateStr = typeof dateValue === 'string' ? dateValue.split('T')[0] : toLocalDateString(new Date(dateValue));
          return seminarDateStr === targetDateStr;
        })
        .map(s => ({
          id: -s.id,
          title: s.title,
          type: "seminar",
          date: s.date,
          isCompleted: false,
          isSeminar: true,
          signupUrl: s.signupUrl,
        }));
      return [...dayEvents, ...daySeminars];
    }
    
    return dayEvents;
  };

  const today = new Date();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">Weekly Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks and upcoming events</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={showSeminars}
              onCheckedChange={setShowSeminars}
              data-testid="switch-show-seminars"
            />
            <Label className="text-sm">Show Seminars</Label>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-event">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    data-testid="input-event-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                  >
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      data-testid="input-event-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      data-testid="input-event-time"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title || createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-event"
                >
                  {createMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-card gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek(-1)}
          data-testid="button-prev-week"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">
            {displayDates[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
            data-testid="button-today"
          >
            Today
          </Button>
          <div className="flex items-center gap-1 border rounded-md p-0.5">
            <Button
              size="sm"
              variant={viewDays === 4 ? "secondary" : "ghost"}
              onClick={() => setViewDays(4)}
              data-testid="button-4day-view"
            >
              4 Days
            </Button>
            <Button
              size="sm"
              variant={viewDays === 7 ? "secondary" : "ghost"}
              onClick={() => setViewDays(7)}
              data-testid="button-7day-view"
            >
              7 Days
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek(1)}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className={`grid gap-3 ${viewDays === 4 ? "grid-cols-4" : "grid-cols-7"}`}>
        {displayDates.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isToday = isSameDay(date, today);

          const handleDayClick = () => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            setNewEvent({ ...newEvent, date: dateStr });
            setIsAddDialogOpen(true);
          };

          return (
            <div
              key={date.toISOString()}
              className={`rounded-xl p-3 ${viewDays === 4 ? "min-h-[450px]" : "min-h-[350px]"} ${isToday ? "bg-primary/5 ring-2 ring-primary/20" : "bg-card"}`}
            >
              <div 
                className={`text-center pb-2 mb-2 border-b cursor-pointer hover-elevate rounded-lg ${isToday ? "border-primary/20" : "border-border/50"}`}
                onClick={handleDayClick}
                data-testid={`day-header-${date.toISOString().split("T")[0]}`}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                  {date.getDate()}
                </p>
              </div>
              <div className="space-y-2">
                {dayEvents.map((event: any) => (
                  <div
                    key={`${event.type}-${event.id}`}
                    className={`p-2 rounded-lg text-xs ${event.isCompleted ? "opacity-50" : ""} ${
                      event.isSeminar ? "bg-purple-500/10" : "bg-muted/50"
                    }`}
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-start gap-1.5">
                      {!event.isSeminar && (
                        <button
                          onClick={() => toggleMutation.mutate({ id: event.id, isCompleted: !event.isCompleted })}
                          className="mt-0.5 flex-shrink-0"
                          data-testid={`button-toggle-event-${event.id}`}
                        >
                          {event.isCompleted ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${event.isCompleted ? "line-through" : ""}`}>
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`w-2 h-2 rounded-full ${eventColors[event.type]}`} />
                          <span className="text-muted-foreground">{eventLabels[event.type]}</span>
                        </div>
                      </div>
                      {!event.isSeminar && (
                        <button
                          onClick={() => deleteMutation.mutate(event.id)}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          data-testid={`button-delete-event-${event.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {event.isSeminar && event.signupUrl && (
                      <a
                        href={event.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-1 block"
                        data-testid={`link-seminar-${event.id}`}
                      >
                        Sign up
                      </a>
                    )}
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No events</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        {Object.entries(eventLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${eventColors[type]}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
