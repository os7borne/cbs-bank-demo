"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  ArrowLeftRight,
  Receipt,
  FileText,
  Settings,
  Landmark,
  Calculator,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  items?: { title: string; href: string }[];
  requiredResource?: string;
  requiredAction?: string;
}

interface Permission {
  resource: string;
  action: string;
}

function hasPermission(userPermissions: Permission[], resource: string, action: string): boolean {
  // Admin has all permissions
  if (userPermissions.some(p => p.resource === '*' && p.action === '*')) {
    return true;
  }
  // Check specific permission
  return userPermissions.some(p => 
    (p.resource === resource || p.resource === '*') && 
    (p.action === action || p.action === '*')
  );
}

function canAccessItem(item: NavItem, userPermissions: Permission[]): boolean {
  if (!item.requiredResource) return true;
  return hasPermission(userPermissions, item.requiredResource, item.requiredAction || 'read');
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", href: "/customers", icon: Users, requiredResource: "customer", requiredAction: "read" },
  {
    title: "Products",
    href: "/products",
    icon: Building2,
    requiredResource: "account",
    requiredAction: "read",
    items: [
      { title: "All Products", href: "/products" },
      { title: "GL Accounts", href: "/admin/gl-accounts" },
    ],
  },
  { title: "Accounts", href: "/accounts", icon: Wallet, requiredResource: "account", requiredAction: "read" },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight, requiredResource: "transaction", requiredAction: "read" },
  { title: "Loans", href: "/loans", icon: Receipt, requiredResource: "loan", requiredAction: "read" },
  {
    title: "Operations",
    href: "/operations",
    icon: Calculator,
    requiredResource: "workflow",
    requiredAction: "read",
    items: [
      { title: "EOD Processing", href: "/operations/eod" },
      { title: "Batch Jobs", href: "/operations/batch" },
      { title: "Workflows", href: "/operations/workflows" },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    requiredResource: "report",
    requiredAction: "read",
    items: [
      { title: "Statements", href: "/reports/statements" },
      { title: "Trial Balance", href: "/reports/trial-balance" },
      { title: "Audit Trail", href: "/reports/audit" },
    ],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    requiredResource: "*",
    requiredAction: "*",
    items: [
      { title: "Users", href: "/admin/users" },
      { title: "Branches", href: "/admin/branches" },
    ],
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
  const hasSubItems = item.items && item.items.length > 0;

  if (hasSubItems) {
    const isSubActive = item.items?.some(
      (sub) => pathname === sub.href || pathname?.startsWith(sub.href + "/")
    );

    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive || isSubActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l pl-3">
            {item.items?.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === subItem.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  );
}

function SidebarContent({ userPermissions, userRoles = [] }: { userPermissions: Permission[]; userRoles?: string[] }) {
  // Filter nav items based on permissions
  const visibleItems = navItems.filter(item => canAccessItem(item, userPermissions));
  
  // Get primary role color for app icon
  const primaryRole = userRoles[0] || 'ADMIN';
  const roleColor = getRoleColor(primaryRole);
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${roleColor.bg}`}>
          <Landmark className={`h-5 w-5 ${roleColor.text}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">India Bank</span>
          <span className="text-xs text-muted-foreground">Demo System</span>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3 overflow-auto">
        {visibleItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>
      <Separator />
      <div className="p-3">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 India Bank Demo
        </p>
      </div>
    </div>
  );
}

export function AppSidebar({ userPermissions = [], userRoles = [] }: { userPermissions?: Permission[]; userRoles?: string[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background h-screen sticky top-0">
        <SidebarContent userPermissions={userPermissions} userRoles={userRoles} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent userPermissions={userPermissions} userRoles={userRoles} />
        </SheetContent>
      </Sheet>
    </>
  );
}

// Role color mapping
const roleColors: Record<string, { bg: string; text: string }> = {
  'ADMIN': { bg: 'bg-blue-600', text: 'text-white' },
  'TELLER': { bg: 'bg-green-600', text: 'text-white' },
  'CUSTOMER_SERVICE': { bg: 'bg-purple-600', text: 'text-white' },
  'OPERATIONS': { bg: 'bg-amber-600', text: 'text-white' },
  'CREDIT_OFFICER': { bg: 'bg-pink-600', text: 'text-white' },
  'FINANCE': { bg: 'bg-cyan-600', text: 'text-white' },
};

function getRoleColor(roleName: string): { bg: string; text: string } {
  return roleColors[roleName] || { bg: 'bg-primary', text: 'text-primary-foreground' };
}

interface TopBarProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    roles: { name: string; permissions: Permission[] }[];
  };
}

export function TopBar({ user }: TopBarProps) {
  // Aggregate all permissions from user's roles
  const userPermissions = user.roles.flatMap(role => role.permissions);
  const userRoleNames = user.roles.map(r => r.name);
  
  // Get primary role color for avatar
  const primaryRole = userRoleNames[0] || 'ADMIN';
  const roleColor = getRoleColor(primaryRole);
  
  return (
    <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
      <div className="flex items-center lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent userPermissions={userPermissions} userRoles={userRoleNames} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {userRoleNames.join(", ")}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${roleColor.bg} ${roleColor.text} text-xs`}>
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground">
                ID: {user.employeeId || "N/A"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: TopBarProps["user"];
}) {
  // Aggregate all permissions from user's roles
  const userPermissions = user.roles.flatMap(role => role.permissions);
  const userRoleNames = user.roles.map(r => r.name);
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar userPermissions={userPermissions} userRoles={userRoleNames} />
      <div className="flex flex-1 flex-col">
        <TopBar user={user} />
        <main className="flex-1 p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
