import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
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

const mockExpenses = [
  { id: 1, category: "Housing", amount: 800, description: "Monthly rent", date: "2026-01-01" },
  { id: 2, category: "Food", amount: 45.50, description: "Grocery shopping", date: "2026-01-02" },
  { id: 3, category: "Transportation", amount: 50, description: "Monthly bus pass", date: "2026-01-03" },
  { id: 4, category: "Education", amount: 120, description: "Textbooks", date: "2026-01-05" },
  { id: 5, category: "Entertainment", amount: 15, description: "Movie tickets", date: "2026-01-07" },
  { id: 6, category: "Food", amount: 32, description: "Restaurant dinner", date: "2026-01-08" },
  { id: 7, category: "Utilities", amount: 85, description: "Internet bill", date: "2026-01-10" },
  { id: 8, category: "Healthcare", amount: 25, description: "Pharmacy", date: "2026-01-12" },
];

const pieData = [
  { name: "Housing", value: 800, color: "hsl(var(--chart-1))" },
  { name: "Food", value: 320, color: "hsl(var(--chart-2))" },
  { name: "Transportation", value: 150, color: "hsl(var(--chart-3))" },
  { name: "Education", value: 120, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 125, color: "hsl(var(--chart-5))" },
];

const budgetCategories = [
  { name: "Housing", spent: 800, limit: 900 },
  { name: "Food", spent: 320, limit: 400 },
  { name: "Transportation", spent: 150, limit: 200 },
  { name: "Education", spent: 120, limit: 150 },
  { name: "Entertainment", spent: 80, limit: 100 },
];

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);

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
                <Input id="amount" type="number" placeholder="0.00" data-testid="input-expense-amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
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
                <Input id="description" placeholder="What was this expense for?" data-testid="input-expense-description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" data-testid="input-expense-date" />
              </div>
              <Button className="w-full" data-testid="button-save-expense">
                Save Expense
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
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.limit) * 100;
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
                        ${category.spent} / ${category.limit}
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
            })}
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
          {filteredExpenses.map((expense) => (
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
                <span>${expense.amount.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
