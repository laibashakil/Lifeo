import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

import AppHeader from "./components/AppHeader";
import Routines from "./pages/Routines";
import Habits from "./pages/Habits";
import CalendarPage from "./pages/Calendar";
import Settings from "./pages/Settings";

function AppLayout() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/calendar" element={<CalendarPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
