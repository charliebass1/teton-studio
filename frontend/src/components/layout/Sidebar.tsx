import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Settings,
  User,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewAs } from "@/lib/viewAs";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/deals", icon: Briefcase, label: "Deals" },
  { to: "/studio", icon: Sparkles, label: "Studio" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [viewAs, setViewAs] = useViewAs();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-[var(--card)]">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold tracking-tight">Teton</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* View-as toggle */}
      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          <Eye className="h-3 w-3" />
          Viewing as
        </div>
        <div className="flex gap-1 rounded-md bg-[var(--muted)] p-1">
          <button
            onClick={() => setViewAs("founder")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
              viewAs === "founder"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <User className="h-3 w-3" />
            Founder
          </button>
          <button
            onClick={() => setViewAs("vc")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
              viewAs === "vc"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Eye className="h-3 w-3" />
            VC
          </button>
        </div>
      </div>
    </aside>
  );
}
