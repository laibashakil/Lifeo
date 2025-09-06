import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { MoodThemeProvider } from "./hooks/useMoodTheme";
import { useFontSettings } from "./hooks/useFontSettings";
import { useAppSettings } from "./hooks/useAnalyticsSettings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppHeader from "./components/AppHeader";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Routines from "./pages/Routines";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import CalendarPage from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MoodThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </MoodThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

function AppLayout() {
  useFontSettings(); // Apply font changes automatically
  const { appSettings } = useAppSettings();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
          {appSettings.showHabitsPage && (
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          )}
          {appSettings.showGoalsPage && (
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          )}
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
