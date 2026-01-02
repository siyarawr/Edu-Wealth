import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Target,
  Calendar,
  ArrowRight,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Internship, Seminar } from "@shared/schema";

const monthlyData = [
  { month: "Aug", spending: 1200, budget: 1500 },
  { month: "Sep", spending: 1350, budget: 1500 },
  { month: "Oct", spending: 1100, budget: 1500 },
  { month: "Nov", spending: 1450, budget: 1500 },
  { month: "Dec", spending: 1280, budget: 1500 },
  { month: "Jan", spending: 1150, budget: 1500 },
];

const budgetCategories = [
  { name: "Housing", spent: 800, limit: 900, color: "bg-chart-1" },
  { name: "Food", spent: 320, limit: 400, color: "bg-chart-2" },
  { name: "Transportation", spent: 150, limit: 200, color: "bg-chart-3" },
  { name: "Entertainment", spent: 80, limit: 100, color: "bg-chart-4" },
];

interface DashboardStats {
  totalSpent: number;
  expenseCount: number;
  upcomingSeminarsCount: number;
  internshipCount: number;
  scholarshipCount: number;
  upcomingSeminars: Seminar[];
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: internships = [], isLoading: internshipsLoading } = useQuery<Internship[]>({
    queryKey: ["/api/internships"],
  });

  const totalSpent = stats?.totalSpent || 1350;
  const budgetLimit = 2000;
  const budgetRemaining = budgetLimit - totalSpent;
  const avgDaily = Math.round(totalSpent / 30);
  const savingsProgress = Math.round((budgetRemaining / budgetLimit) * 100);

  const upcomingSeminars = stats?.upcomingSeminars?.slice(0, 3) || [];
  const recentInternships = internships.slice(0, 2);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (statsLoading || internshipsLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          January 2026
        </Badge>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-monthly-spending">${totalSpent.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-chart-2" />
              <span className="text-xs text-chart-2">12% less than last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Remaining
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-budget-remaining">${budgetRemaining.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-chart-2" />
              <span className="text-xs text-muted-foreground">{Math.round((budgetRemaining / budgetLimit) * 100)}% of budget left</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Daily Expense
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-daily-expense">${avgDaily}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">Based on this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Goal
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-savings-goal">{savingsProgress}%</div>
            <Progress value={savingsProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Spending Overview</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">6 Months</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorSpending)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-mono text-muted-foreground">
                    ${category.spent} / ${category.limit}
                  </span>
                </div>
                <Progress
                  value={(category.spent / category.limit) * 100}
                  className="h-2"
                />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/expenses">
                View All Expenses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Seminars */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Seminars
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seminars">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSeminars.length > 0 ? (
              upcomingSeminars.map((seminar) => (
                <div
                  key={seminar.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
                  data-testid={`card-seminar-${seminar.id}`}
                >
                  <div>
                    <p className="font-medium text-sm">{seminar.title}</p>
                    <p className="text-xs text-muted-foreground">{seminar.speaker}</p>
                  </div>
                  <Badge variant="outline">{formatDate(seminar.date)}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming seminars
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Internships */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              New Internships
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/internships">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInternships.length > 0 ? (
              recentInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
                  data-testid={`card-internship-${internship.id}`}
                >
                  <div>
                    <p className="font-medium text-sm">{internship.title}</p>
                    <p className="text-xs text-muted-foreground">{internship.company}</p>
                  </div>
                  <Badge variant="secondary">{internship.location}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No internships available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/expenses">
                <DollarSign className="h-5 w-5" />
                <span>Add Expense</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/scholarships">
                <GraduationCap className="h-5 w-5" />
                <span>Find Scholarships</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/acceptance">
                <Target className="h-5 w-5" />
                <span>Calculate Rate</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
              <Link href="/seminars">
                <Calendar className="h-5 w-5" />
                <span>Browse Seminars</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
