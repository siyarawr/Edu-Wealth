import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Plus,
  Calendar,
  DollarSign,
  Bell,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { FinanceReminder } from "@shared/schema";
import { format, isPast, isToday, isTomorrow, addDays, isWithinInterval } from "date-fns";

const categories = [
  "Rent",
  "Utilities",
  "Tuition",
  "Insurance",
  "Subscriptions",
  "Loans",
  "Credit Card",
  "Phone",
  "Internet",
  "Other",
];

export default function FinanceReminders() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "",
    notes: "",
    isRecurring: false,
    recurringFrequency: "",
  });

  const { data: reminders = [], isLoading } = useQuery<FinanceReminder[]>({
    queryKey: ["/api/finance-reminders"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/finance-reminders", {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : null,
        dueDate: new Date(data.dueDate).toISOString(),
        userId: "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reminders"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        amount: "",
        dueDate: "",
        category: "",
        notes: "",
        isRecurring: false,
        recurringFrequency: "",
      });
      toast({ title: "Reminder added" });
    },
  });

  const togglePaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      return apiRequest("PATCH", `/api/finance-reminders/${id}`, { isPaid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reminders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/finance-reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-reminders"] });
      toast({ title: "Reminder deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate || !formData.category) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusBadge = (reminder: FinanceReminder) => {
    if (reminder.isPaid) {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">Paid</Badge>;
    }
    const dueDate = new Date(reminder.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isToday(dueDate)) {
      return <Badge variant="default" className="bg-orange-500">Due Today</Badge>;
    }
    if (isTomorrow(dueDate)) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Due Tomorrow</Badge>;
    }
    if (isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 7) })) {
      return <Badge variant="outline">Due Soon</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Upcoming</Badge>;
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const unpaidReminders = reminders.filter(r => !r.isPaid);
  const totalDue = unpaidReminders.reduce((sum, r) => sum + (r.amount || 0), 0);
  const overdueCount = unpaidReminders.filter(r => isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))).length;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Finance Reminders</h1>
          <p className="text-muted-foreground mt-1">Track when your bills and payments are due</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-add-reminder">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Finance Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Rent payment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-reminder-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    data-testid="input-reminder-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    data-testid="input-reminder-due-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-reminder-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="resize-none"
                  data-testid="input-reminder-notes"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: !!checked })}
                  data-testid="checkbox-recurring"
                />
                <Label htmlFor="isRecurring" className="text-sm">This is a recurring payment</Label>
              </div>
              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.recurringFrequency}
                    onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}
                  >
                    <SelectTrigger data-testid="select-recurring-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-reminder">
                {createMutation.isPending ? "Adding..." : "Add Reminder"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold font-mono" data-testid="text-total-due">${totalDue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold" data-testid="text-pending-count">{unpaidReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-500" data-testid="text-overdue-count">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedReminders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No reminders yet</p>
              <p className="text-sm mt-1">Add your first finance reminder to start tracking due dates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    reminder.isPaid ? "bg-muted/30 opacity-60" : "bg-card hover-elevate"
                  }`}
                  data-testid={`reminder-item-${reminder.id}`}
                >
                  <Checkbox
                    checked={reminder.isPaid || false}
                    onCheckedChange={(checked) =>
                      togglePaidMutation.mutate({ id: reminder.id, isPaid: !!checked })
                    }
                    data-testid={`checkbox-paid-${reminder.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${reminder.isPaid ? "line-through text-muted-foreground" : ""}`}>
                        {reminder.title}
                      </span>
                      {getStatusBadge(reminder)}
                      {reminder.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          {reminder.recurringFrequency}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{reminder.category}</span>
                      <span>Due: {format(new Date(reminder.dueDate), "MMM d, yyyy")}</span>
                    </div>
                    {reminder.notes && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{reminder.notes}</p>
                    )}
                  </div>
                  {reminder.amount && (
                    <div className="text-right">
                      <span className={`font-mono font-bold ${reminder.isPaid ? "text-muted-foreground" : ""}`}>
                        ${reminder.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(reminder.id)}
                    data-testid={`button-delete-${reminder.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
