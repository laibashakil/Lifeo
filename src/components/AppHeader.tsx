import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
    }`;

  const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md transition-colors text-base font-medium ${
      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
    }`;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold text-lg">Lifeo</a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
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
                <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border z-50">
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border z-50">
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background">
              <div className="flex flex-col gap-4 pt-6">
                <nav className="flex flex-col gap-2" aria-label="Mobile Primary">
                  <NavLink 
                    to="/" 
                    end 
                    className={mobileLinkCls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </NavLink>
                  <NavLink 
                    to="/routines" 
                    className={mobileLinkCls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📅 Routines
                  </NavLink>
                  <NavLink 
                    to="/habits" 
                    className={mobileLinkCls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🎯 Habits
                  </NavLink>
                  <NavLink 
                    to="/calendar" 
                    className={mobileLinkCls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📋 Calendar
                  </NavLink>
                  <NavLink 
                    to="/settings" 
                    className={mobileLinkCls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⚙️ Settings
                  </NavLink>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
