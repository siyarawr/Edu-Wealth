import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface FinanceEntry {
  id: string;
  type: "income" | "expense" | "asset" | "liability";
  category: string;
  name: string;
  amount: number;
  frequency: "one-time" | "weekly" | "monthly" | "yearly";
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export default function FinanceTracker() {
  const { toast } = useToast();
  
  const [incomeEntries, setIncomeEntries] = useState<FinanceEntry[]>([
    { id: "1", type: "income", category: "Employment", name: "Part-time Job", amount: 1200, frequency: "monthly" },
    { id: "2", type: "income", category: "Allowance", name: "Parents Support", amount: 500, frequency: "monthly" },
  ]);
  
  const [expenseEntries, setExpenseEntries] = useState<FinanceEntry[]>([
    { id: "1", type: "expense", category: "Housing", name: "Rent", amount: 800, frequency: "monthly" },
    { id: "2", type: "expense", category: "Food", name: "Groceries", amount: 300, frequency: "monthly" },
    { id: "3", type: "expense", category: "Transportation", name: "Bus Pass", amount: 50, frequency: "monthly" },
    { id: "4", type: "expense", category: "Entertainment", name: "Streaming Services", amount: 30, frequency: "monthly" },
  ]);
  
  const [assetEntries, setAssetEntries] = useState<FinanceEntry[]>([
    { id: "1", type: "asset", category: "Savings", name: "Emergency Fund", amount: 2500, frequency: "one-time" },
    { id: "2", type: "asset", category: "Investment", name: "Stock Portfolio", amount: 1000, frequency: "one-time" },
  ]);
  
  const [liabilityEntries, setLiabilityEntries] = useState<FinanceEntry[]>([
    { id: "1", type: "liability", category: "Student Loan", name: "Federal Student Loan", amount: 15000, frequency: "one-time" },
  ]);
  
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: "1", name: "Emergency Fund", targetAmount: 5000, currentAmount: 2500, deadline: "2026-12-31" },
    { id: "2", name: "Summer Trip", targetAmount: 2000, currentAmount: 800, deadline: "2026-06-01" },
  ]);
  
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newEntryType, setNewEntryType] = useState<"income" | "expense" | "asset" | "liability">("income");
  
  const [newEntry, setNewEntry] = useState<Partial<FinanceEntry>>({
    category: "",
    name: "",
    amount: 0,
    frequency: "monthly",
  });
  
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    deadline: "",
  });

  const totalMonthlyIncome = incomeEntries.reduce((sum, e) => {
    if (e.frequency === "monthly") return sum + e.amount;
    if (e.frequency === "weekly") return sum + e.amount * 4;
    if (e.frequency === "yearly") return sum + e.amount / 12;
    return sum;
  }, 0);

  const totalMonthlyExpenses = expenseEntries.reduce((sum, e) => {
    if (e.frequency === "monthly") return sum + e.amount;
    if (e.frequency === "weekly") return sum + e.amount * 4;
    if (e.frequency === "yearly") return sum + e.amount / 12;
    return sum;
  }, 0);

  const totalAssets = assetEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalLiabilities = liabilityEntries.reduce((sum, e) => sum + e.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;

  const handleAddEntry = () => {
    const entry: FinanceEntry = {
      id: Date.now().toString(),
      type: newEntryType,
      category: newEntry.category || "Other",
      name: newEntry.name || "Untitled",
      amount: newEntry.amount || 0,
      frequency: newEntry.frequency || "monthly",
    };
    
    if (newEntryType === "income") {
      setIncomeEntries([...incomeEntries, entry]);
    } else if (newEntryType === "expense") {
      setExpenseEntries([...expenseEntries, entry]);
    } else if (newEntryType === "asset") {
      setAssetEntries([...assetEntries, entry]);
    } else {
      setLiabilityEntries([...liabilityEntries, entry]);
    }
    
    setNewEntry({ category: "", name: "", amount: 0, frequency: "monthly" });
    setIsAddEntryOpen(false);
    toast({ title: "Entry added successfully" });
  };

  const handleUpdateEntry = (entry: FinanceEntry) => {
    if (entry.type === "income") {
      setIncomeEntries(incomeEntries.map(e => e.id === entry.id ? entry : e));
    } else if (entry.type === "expense") {
      setExpenseEntries(expenseEntries.map(e => e.id === entry.id ? entry : e));
    } else if (entry.type === "asset") {
      setAssetEntries(assetEntries.map(e => e.id === entry.id ? entry : e));
    } else {
      setLiabilityEntries(liabilityEntries.map(e => e.id === entry.id ? entry : e));
    }
    setEditingEntry(null);
    toast({ title: "Entry updated successfully" });
  };

  const handleDeleteEntry = (entry: FinanceEntry) => {
    if (entry.type === "income") {
      setIncomeEntries(incomeEntries.filter(e => e.id !== entry.id));
    } else if (entry.type === "expense") {
      setExpenseEntries(expenseEntries.filter(e => e.id !== entry.id));
    } else if (entry.type === "asset") {
      setAssetEntries(assetEntries.filter(e => e.id !== entry.id));
    } else {
      setLiabilityEntries(liabilityEntries.filter(e => e.id !== entry.id));
    }
    toast({ title: "Entry deleted" });
  };

  const handleAddGoal = () => {
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name || "Untitled Goal",
      targetAmount: newGoal.targetAmount || 0,
      currentAmount: newGoal.currentAmount || 0,
      deadline: newGoal.deadline,
    };
    setSavingsGoals([...savingsGoals, goal]);
    setNewGoal({ name: "", targetAmount: 0, currentAmount: 0, deadline: "" });
    setIsAddGoalOpen(false);
    toast({ title: "Goal added successfully" });
  };

  const handleUpdateGoal = (goal: SavingsGoal) => {
    setSavingsGoals(savingsGoals.map(g => g.id === goal.id ? goal : g));
    setEditingGoal(null);
    toast({ title: "Goal updated successfully" });
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== goalId));
    toast({ title: "Goal deleted" });
  };

  const categoryOptions = {
    income: ["Employment", "Freelance", "Allowance", "Scholarship", "Investment", "Other"],
    expense: ["Housing", "Food", "Transportation", "Entertainment", "Education", "Healthcare", "Utilities", "Other"],
    asset: ["Savings", "Investment", "Property", "Cryptocurrency", "Other"],
    liability: ["Student Loan", "Credit Card", "Personal Loan", "Other"],
  };

  const renderEntryCard = (entry: FinanceEntry) => (
    <div
      key={entry.id}
      className="flex items-center justify-between p-3 rounded-md bg-muted/50 group"
      data-testid={`entry-${entry.type}-${entry.id}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{entry.name}</span>
          <Badge variant="outline" className="text-xs">{entry.category}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {entry.frequency !== "one-time" && `${entry.frequency} `}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-mono font-semibold ${entry.type === "income" || entry.type === "asset" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {entry.type === "expense" || entry.type === "liability" ? "-" : "+"}${entry.amount.toLocaleString()}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditingEntry(entry)}
            data-testid={`button-edit-entry-${entry.id}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteEntry(entry)}
            data-testid={`button-delete-entry-${entry.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Tracker</h1>
        <p className="text-muted-foreground">Track your income, expenses, assets, and financial goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
              ${totalMonthlyIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
              ${totalMonthlyExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${netWorth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              ${netWorth.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${savingsRate >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${monthlySavings.toLocaleString()}/month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-entry">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Finance Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Type</Label>
                <Select value={newEntryType} onValueChange={(v) => setNewEntryType(v as any)}>
                  <SelectTrigger data-testid="select-entry-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newEntry.category}
                  onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                >
                  <SelectTrigger data-testid="select-entry-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions[newEntryType].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  placeholder="e.g., Part-time Job"
                  data-testid="input-entry-name"
                />
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={newEntry.amount || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  data-testid="input-entry-amount"
                />
              </div>
              {(newEntryType === "income" || newEntryType === "expense") && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={newEntry.frequency}
                    onValueChange={(v) => setNewEntry({ ...newEntry, frequency: v as any })}
                  >
                    <SelectTrigger data-testid="select-entry-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleAddEntry} className="w-full" data-testid="button-submit-entry">
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Income Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No income entries yet</p>
            ) : (
              incomeEntries.map(renderEntryCard)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No expense entries yet</p>
            ) : (
              expenseEntries.map(renderEntryCard)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assetEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No assets yet</p>
            ) : (
              assetEntries.map(renderEntryCard)
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Assets</span>
              <span className="font-mono text-green-600 dark:text-green-400">${totalAssets.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liabilityEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No liabilities</p>
            ) : (
              liabilityEntries.map(renderEntryCard)
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Liabilities</span>
              <span className="font-mono text-red-600 dark:text-red-400">${totalLiabilities.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Savings Goals
          </CardTitle>
          <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-goal">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Goal Name</Label>
                  <Input
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    data-testid="input-goal-name"
                  />
                </div>
                <div>
                  <Label>Target Amount ($)</Label>
                  <Input
                    type="number"
                    value={newGoal.targetAmount || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    data-testid="input-goal-target"
                  />
                </div>
                <div>
                  <Label>Current Amount ($)</Label>
                  <Input
                    type="number"
                    value={newGoal.currentAmount || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    data-testid="input-goal-current"
                  />
                </div>
                <div>
                  <Label>Target Date (optional)</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    data-testid="input-goal-deadline"
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full" data-testid="button-submit-goal">
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No savings goals yet. Add one to start tracking!</p>
          ) : (
            savingsGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
                <div key={goal.id} className="space-y-2 group" data-testid={`goal-${goal.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{goal.name}</span>
                      {goal.deadline && (
                        <span className="text-sm text-muted-foreground ml-2">
                          by {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingGoal(goal)}
                          data-testid={`button-edit-goal-${goal.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteGoal(goal.id)}
                          data-testid={`button-delete-goal-${goal.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(1)}% complete
                    {goal.targetAmount > goal.currentAmount && (
                      <span> - ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining</span>
                    )}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={editingEntry.category}
                  onValueChange={(v) => setEditingEntry({ ...editingEntry, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions[editingEntry.type].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editingEntry.name}
                  onChange={(e) => setEditingEntry({ ...editingEntry, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={editingEntry.amount}
                  onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {(editingEntry.type === "income" || editingEntry.type === "expense") && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={editingEntry.frequency}
                    onValueChange={(v) => setEditingEntry({ ...editingEntry, frequency: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={() => handleUpdateEntry(editingEntry)} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Goal Name</Label>
                <Input
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Amount ($)</Label>
                <Input
                  type="number"
                  value={editingGoal.targetAmount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Current Amount ($)</Label>
                <Input
                  type="number"
                  value={editingGoal.currentAmount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={editingGoal.deadline || ""}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                />
              </div>
              <Button onClick={() => handleUpdateGoal(editingGoal)} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
