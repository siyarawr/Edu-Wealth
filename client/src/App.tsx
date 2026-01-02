import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";

import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Internships from "@/pages/internships";
import Scholarships from "@/pages/scholarships";
import AcceptanceCalculator from "@/pages/acceptance";
import Entrepreneurship from "@/pages/entrepreneurship";
import Seminars from "@/pages/seminars";
import Notes from "@/pages/notes";
import MeetingNotes from "@/pages/meeting-notes";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import Calendar from "@/pages/calendar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/internships" component={Internships} />
      <Route path="/scholarships" component={Scholarships} />
      <Route path="/acceptance" component={AcceptanceCalculator} />
      <Route path="/entrepreneurship" component={Entrepreneurship} />
      <Route path="/seminars" component={Seminars} />
      <Route path="/notes" component={Notes} />
      <Route path="/meeting-notes" component={MeetingNotes} />
      <Route path="/chat" component={Chat} />
      <Route path="/profile" component={Profile} />
      <Route path="/calendar" component={Calendar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full bg-background">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 px-4 h-12 border-b border-border/50 bg-background sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <ScrollArea className="flex-1">
                  <main className="min-h-full">
                    <Router />
                  </main>
                </ScrollArea>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
