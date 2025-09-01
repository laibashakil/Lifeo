import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AppHeader() {
  const { user, signOut } = useAuth();
  
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors ${
      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
    }`;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold">Lifeo</a>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1" aria-label="Primary">
            <NavLink to="/" end className={linkCls}>Dashboard</NavLink>
            <NavLink to="/routines" className={linkCls}>Routines</NavLink>
            <NavLink to="/habits" className={linkCls}>Habits</NavLink>
            <NavLink to="/calendar" className={linkCls}>Calendar</NavLink>
            <NavLink to="/settings" className={linkCls}>Settings</NavLink>
          </nav>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
