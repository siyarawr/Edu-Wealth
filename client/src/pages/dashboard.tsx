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
  GraduationCap,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
  { name: "Housing", spent: 800, limit: 900 },
  { name: "Food", spent: 320, limit: 400 },
  { name: "Transportation", spent: 150, limit: 200 },
  { name: "Entertainment", spent: 80, limit: 100 },
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
  const recentInternships = internships.slice(0, 3);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (statsLoading || internshipsLoading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="h-72 rounded-xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your financial overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card hover-elevate">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Monthly Spending</span>
          </div>
          <div className="text-2xl font-bold font-mono" data-testid="text-monthly-spending">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3 text-chart-2" />
            <span className="text-xs text-chart-2">12% less</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card hover-elevate">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <PiggyBank className="h-4 w-4" />
            <span className="text-sm">Budget Left</span>
          </div>
          <div className="text-2xl font-bold font-mono" data-testid="text-budget-remaining">
            ${budgetRemaining.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-chart-2" />
            <span className="text-xs text-muted-foreground">{Math.round((budgetRemaining / budgetLimit) * 100)}% remaining</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card hover-elevate">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">Daily Average</span>
          </div>
          <div className="text-2xl font-bold font-mono" data-testid="text-daily-expense">
            ${avgDaily}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">This month</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card hover-elevate">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Savings Goal</span>
          </div>
          <div className="text-2xl font-bold font-mono" data-testid="text-savings-goal">
            {savingsProgress}%
          </div>
          <Progress value={savingsProgress} className="mt-2 h-1.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 p-6 rounded-xl bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Spending Overview</h2>
            <Badge variant="secondary" className="text-xs">6 months</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
        </div>

        <div className="lg:col-span-2 p-6 rounded-xl bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Budget Tracker</h2>
          </div>
          <div className="space-y-4">
            {budgetCategories.map((category) => (
              <div key={category.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    ${category.spent} / ${category.limit}
                  </span>
                </div>
                <Progress
                  value={(category.spent / category.limit) * 100}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-sm" asChild>
            <Link href="/expenses">
              View All Expenses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Seminars
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seminars">View All</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingSeminars.length > 0 ? (
              upcomingSeminars.map((seminar) => (
                <div
                  key={seminar.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover-elevate group"
                  data-testid={`card-seminar-${seminar.id}`}
                >
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary text-center flex-shrink-0">
                    <span className="text-xs font-medium">{formatDate(seminar.date).split(" ")[0]}</span>
                    <span className="text-lg font-bold leading-none">{formatDate(seminar.date).split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{seminar.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="truncate">{seminar.speaker}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{formatTime(seminar.date)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 text-xs">
                    {seminar.category}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming seminars
              </p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              New Internships
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/internships">View All</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentInternships.length > 0 ? (
              recentInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover-elevate group"
                  data-testid={`card-internship-${internship.id}`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10 text-chart-2 text-xl font-bold flex-shrink-0">
                    {internship.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{internship.title}</p>
                    <p className="text-sm text-muted-foreground">{internship.company}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{internship.location}</span>
                    </div>
                  </div>
                  {internship.isRemote && (
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">Remote</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No internships available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
            <Link href="/expenses">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Add Expense</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
            <Link href="/scholarships">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm">Scholarships</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
            <Link href="/acceptance">
              <Target className="h-5 w-5" />
              <span className="text-sm">Acceptance Rate</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 gap-2" asChild>
            <Link href="/seminars">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Seminars</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
