import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors ${
      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold">Lifeo</a>
        <nav className="flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={linkCls}>Dashboard</NavLink>
          <NavLink to="/routines" className={linkCls}>Routines</NavLink>
          <NavLink to="/habits" className={linkCls}>Habits</NavLink>
          <NavLink to="/calendar" className={linkCls}>Calendar</NavLink>
          <NavLink to="/settings" className={linkCls}>Settings</NavLink>
        </nav>
      </div>
    </header>
  );
}
