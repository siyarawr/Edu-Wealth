import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  User,
  MessageCircle,
  FileText,
  LogOut
} from "lucide-react";
import ewIconPath from "@assets/image_1767372559290.png";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@shared/schema";
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
  { title: "Search", url: "/search", icon: Search },
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
  { title: "Lists", url: "/chat", icon: MessageCircle },
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
  
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  });

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const displayName = user?.fullName || user?.username || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img src={ewIconPath} alt="EduWealth" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-sm font-semibold">Edu Wealth</h1>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start mb-2"
          data-testid="button-sign-out"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
