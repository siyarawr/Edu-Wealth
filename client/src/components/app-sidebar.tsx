import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Calculator,
  BookOpen,
  ChevronRight,
  Search,
  Sparkles,
  User,
  Settings,
  MessageCircle,
  FileText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const workspaceItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "My Profile", url: "/profile", icon: User },
];

const financeItems = [
  { title: "Expenses", url: "/expenses", icon: Wallet },
  { title: "Internships", url: "/internships", icon: Briefcase },
  { title: "Scholarships", url: "/scholarships", icon: GraduationCap },
  { title: "Acceptance Rate", url: "/acceptance", icon: Calculator },
];

const academicsItems = [
  { title: "Seminars", url: "/seminars", icon: Calendar },
  { title: "My Notes", url: "/notes", icon: BookOpen },
  { title: "Meeting Notes", url: "/meeting-notes", icon: FileText },
  { title: "Entrepreneurship", url: "/entrepreneurship", icon: Lightbulb },
];

const communicationItems = [
  { title: "Messages", url: "/chat", icon: MessageCircle },
];

interface NavSectionProps {
  title: string;
  items: { title: string; url: string; icon: React.ElementType }[];
  location: string;
  defaultOpen?: boolean;
}

function NavSection({ title, items, location, defaultOpen = true }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger 
        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover-elevate rounded-md group"
        data-testid={`button-toggle-${sectionId}`}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenu className="mt-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location === item.url}
                className="pl-6"
              >
                <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">StudentHub</h1>
          </div>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
            data-testid="input-search"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-2">
          <SidebarGroupContent className="space-y-1">
            <NavSection
              title="Finances"
              items={financeItems}
              location={location}
            />
            <NavSection
              title="Academics"
              items={academicsItems}
              location={location}
            />
            <NavSection
              title="Communication"
              items={communicationItems}
              location={location}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Student</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
