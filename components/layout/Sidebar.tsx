import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Calendar,
  User,
  Settings,
  FileCheck,
} from "lucide-react";
import { UserProfile } from "@/lib/firebase/auth";

interface SidebarProps {
  userProfile: UserProfile | null;
}

export function Sidebar({ userProfile }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const parentLinks = [
    {
      href: "/dashboard/parent",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/search",
      label: "Find Tutors",
      icon: Search,
    },
    {
      href: "/bookings",
      label: "Bookings",
      icon: Calendar,
    },
  ];

  const tutorLinks = [
    {
      href: "/dashboard/tutor",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tutor/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/tutor/verify",
      label: "Verification",
      icon: FileCheck,
    },
  ];

  const adminLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/verifications",
      label: "Verifications",
      icon: FileCheck,
    },
  ];

  const links =
    userProfile?.role === "parent"
      ? parentLinks
      : userProfile?.role === "tutor"
      ? tutorLinks
      : adminLinks;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16 border-r bg-background">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <Link
            to="/settings"
            className={cn(
              "flex-shrink-0 w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 active:scale-[0.98]",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}

