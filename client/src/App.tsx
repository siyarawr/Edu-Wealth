import { useState, useEffect, useCallback } from "react";
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

const SIDEBAR_WIDTH_KEY = "studenthub-sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 240;
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 400;

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (stored) {
        setSidebarWidth(parseInt(stored, 10));
      }
    }
  }, []);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, e.clientX));
    setSidebarWidth(newWidth);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(newWidth));
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const style = {
    "--sidebar-width": `${sidebarWidth}px`,
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full bg-background">
              <AppSidebar />
              <div
                className="w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors"
                onMouseDown={handleMouseDown}
                data-testid="sidebar-resize-handle"
              />
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
