import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Banknote,
  Receipt,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { FinanceEntry } from "@shared/schema";
import { incomeTagOptions, expenseTagOptions } from "@shared/schema";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FinanceTracker() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<FinanceEntry | null>(null);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");
  
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    tag: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: entries = [], isLoading } = useQuery<FinanceEntry[]>({
    queryKey: ["/api/finance-entries"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { type: string; source: string; amount: number; tag: string; date: string }) => {
      const res = await apiRequest("POST", "/api/finance-entries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-entries"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Entry added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { source?: string; amount?: number; tag?: string; date?: string } }) => {
      const res = await apiRequest("PATCH", `/api/finance-entries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-entries"] });
      setEditingEntry(null);
      resetForm();
      toast({ title: "Entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/finance-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance-entries"] });
      setDeleteEntry(null);
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      source: "",
      amount: "",
      tag: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setEntryType("income");
  };

  const handleSubmit = () => {
    if (editingEntry) {
      updateMutation.mutate({
        id: editingEntry.id,
        data: {
          source: formData.source,
          amount: parseFloat(formData.amount),
          tag: formData.tag,
          date: new Date(formData.date).toISOString(),
        },
      });
    } else {
      createMutation.mutate({
        type: entryType,
        source: formData.source,
        amount: parseFloat(formData.amount),
        tag: formData.tag,
        date: new Date(formData.date).toISOString(),
      });
    }
  };

  const openEditDialog = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setEntryType(entry.type as "income" | "expense");
    setFormData({
      source: entry.source,
      amount: entry.amount.toString(),
      tag: entry.tag,
      date: format(new Date(entry.date), "yyyy-MM-dd"),
    });
  };

  const incomeEntries = entries.filter(e => e.type === "income");
  const expenseEntries = entries.filter(e => e.type === "expense");

  const getMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    return MONTHS.map((name, index) => {
      const monthIncome = entries
        .filter(e => e.type === "income" && new Date(e.date).getMonth() === index && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);
      const monthExpenses = entries
        .filter(e => e.type === "expense" && new Date(e.date).getMonth() === index && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name,
        monthNumber: index + 1,
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      };
    });
  };

  const monthlyData = getMonthlyData();
  const totalIncome = entries.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tagOptions = entryType === "income" ? incomeTagOptions : expenseTagOptions;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
          <p className="text-muted-foreground">Track your income and expenses by month</p>
        </div>
        <Dialog open={isAddDialogOpen || !!editingEntry} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingEntry(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-entry">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Entry" : "Add Finance Entry"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {!editingEntry && (
                <div>
                  <Label>Type</Label>
                  <Select value={entryType} onValueChange={(v) => {
                    setEntryType(v as "income" | "expense");
                    setFormData(prev => ({ ...prev, tag: "" }));
                  }}>
                    <SelectTrigger data-testid="select-entry-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Source</Label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder={entryType === "income" ? "e.g., Acme Inc., Freelance" : "e.g., Rent, Groceries"}
                  data-testid="input-entry-source"
                />
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-entry-amount"
                />
              </div>
              <div>
                <Label>Tag</Label>
                <Select
                  value={formData.tag}
                  onValueChange={(v) => setFormData({ ...formData, tag: v })}
                >
                  <SelectTrigger data-testid="select-entry-tag">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tagOptions.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="input-entry-date"
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending || !formData.source || !formData.amount || !formData.tag}
                data-testid="button-submit-entry"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingEntry ? "Save Changes" : "Add Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Banknote className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-total-income">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400" data-testid="text-total-expenses">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalSavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} data-testid="text-total-savings">
              ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Monthly Expenses</TableHead>
                  <TableHead className="text-right">Monthly Income</TableHead>
                  <TableHead className="text-right">Monthly Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month) => (
                  <TableRow key={month.name} data-testid={`row-month-${month.monthNumber}`}>
                    <TableCell className="font-medium">{month.name}</TableCell>
                    <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                      {month.expenses > 0 ? `$${month.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                      {month.income > 0 ? `$${month.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${month.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {month.income > 0 || month.expenses > 0 ? `$${month.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No income entries yet. Click "Add Entry" to start tracking.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeEntries.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-income-${entry.id}`}>
                        <TableCell className="font-medium">{entry.source}</TableCell>
                        <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                          ${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{entry.tag}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(entry)}
                              data-testid={`button-edit-income-${entry.id}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteEntry(entry)}
                              data-testid={`button-delete-income-${entry.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-500" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No expense entries yet. Click "Add Entry" to start tracking.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseEntries.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-expense-${entry.id}`}>
                        <TableCell className="font-medium">{entry.source}</TableCell>
                        <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                          ${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{entry.tag}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(entry)}
                              data-testid={`button-edit-expense-${entry.id}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteEntry(entry)}
                              data-testid={`button-delete-expense-${entry.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteEntry?.type} entry for "{deleteEntry?.source}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEntry && deleteMutation.mutate(deleteEntry.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
