import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Search,
  Home,
  Utensils,
  Car,
  Book,
  Gamepad2,
  Heart,
  Zap,
  Shirt,
  User,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { Expense, Budget } from "@shared/schema";

const categoryIcons: Record<string, React.ReactNode> = {
  Housing: <Home className="h-4 w-4" />,
  Food: <Utensils className="h-4 w-4" />,
  Transportation: <Car className="h-4 w-4" />,
  Education: <Book className="h-4 w-4" />,
  Entertainment: <Gamepad2 className="h-4 w-4" />,
  Healthcare: <Heart className="h-4 w-4" />,
  Utilities: <Zap className="h-4 w-4" />,
  Clothing: <Shirt className="h-4 w-4" />,
  Personal: <User className="h-4 w-4" />,
  Other: <MoreHorizontal className="h-4 w-4" />,
};

const categories = [
  "Housing", "Food", "Transportation", "Education", "Entertainment",
  "Healthcare", "Utilities", "Clothing", "Personal", "Other"
];

const categoryColors: Record<string, string> = {
  Housing: "hsl(var(--chart-1))",
  Food: "hsl(var(--chart-2))",
  Transportation: "hsl(var(--chart-3))",
  Education: "hsl(var(--chart-4))",
  Entertainment: "hsl(var(--chart-5))",
  Healthcare: "hsl(var(--chart-1))",
  Utilities: "hsl(var(--chart-2))",
  Clothing: "hsl(var(--chart-3))",
  Personal: "hsl(var(--chart-4))",
  Other: "hsl(var(--chart-5))",
};

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: { amount: number; category: string; description: string; date: string }) => {
      const response = await apiRequest("POST", "/api/expenses", {
        ...data,
        userId: "default-user",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsAddDialogOpen(false);
      setNewExpense({ amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] });
      toast({
        title: "Expense added",
        description: "Your expense has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      });
    },
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    addExpenseMutation.mutate({
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date,
    });
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const pieData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "hsl(var(--chart-5))",
  }));

  const budgetProgress = budgets.map((budget) => {
    const spent = expenses
      .filter((e) => e.category === budget.category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: budget.category,
      spent,
      limit: Number(budget.limit),
    };
  });

  if (expensesLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your spending</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-expense">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  data-testid="input-expense-amount" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger data-testid="select-expense-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[cat]}
                          {cat}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="What was this expense for?" 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  data-testid="input-expense-description" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  data-testid="input-expense-date" 
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAddExpense}
                disabled={addExpenseMutation.isPending}
                data-testid="button-save-expense"
              >
                {addExpenseMutation.isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-card">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value}`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Total This Month</p>
            <p className="text-2xl font-bold font-mono">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-xl bg-card">
          <h2 className="text-lg font-semibold mb-4">Budget Progress</h2>
          <div className="space-y-4">
            {budgetProgress.length > 0 ? budgetProgress.map((category) => {
              const percentage = category.limit > 0 ? (category.spent / category.limit) * 100 : 0;
              const isOverBudget = percentage > 100;
              return (
                <div key={category.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categoryIcons[category.name]}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        ${category.spent.toFixed(2)} / ${category.limit.toFixed(2)}
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">Over</Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-1.5 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                  />
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-4">No budgets set. Add budgets to track your spending.</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-card">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-48 h-9 bg-muted/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-expenses"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36 h-9 bg-muted/50 border-0" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-4 py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2">Date</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-12 gap-4 py-3 px-3 rounded-lg hover-elevate group items-center"
              data-testid={`row-expense-${expense.id}`}
            >
              <div className="col-span-2 font-mono text-sm text-muted-foreground">
                {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="col-span-5 text-sm">{expense.description}</div>
              <div className="col-span-3">
                <Badge variant="secondary" className="gap-1 font-normal">
                  {categoryIcons[expense.category]}
                  {expense.category}
                </Badge>
              </div>
              <div className="col-span-2 text-right font-mono font-medium flex items-center justify-end gap-2">
                <span>${Number(expense.amount).toFixed(2)}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-delete-expense-${expense.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this expense? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteExpenseMutation.mutate(expense.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No expenses recorded yet. Add your first expense above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
