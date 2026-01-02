import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  Home,
  Utensils,
  Car,
  Book,
  Gamepad2,
  Heart,
  Zap,
  Shirt,
  User,
  MoreHorizontal
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
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
  "Housing",
  "Food",
  "Transportation",
  "Education",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Clothing",
  "Personal",
  "Other"
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your spending</p>
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
                  data-testid="input-expense-amount"
                />
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
                <Input
                  id="description"
                  placeholder="What was this expense for?"
                  data-testid="input-expense-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  data-testid="input-expense-date"
                />
              </div>
              <Button className="w-full" data-testid="button-save-expense">
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Total This Month</p>
              <p className="text-2xl font-bold font-mono">${totalSpent.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.limit) * 100;
              const isOverBudget = percentage > 100;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categoryIcons[category.name]}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        ${category.spent} / ${category.limit}
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">Over</Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-expenses"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40" data-testid="select-filter-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                  <TableCell className="font-mono text-sm">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      {categoryIcons[expense.category]}
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
