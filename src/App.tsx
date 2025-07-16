
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppProviders from "@/components/AppProviders";
import Index from "./pages/Index";
import TaskAdminPage from "./components/TaskAdminPage";
import SystemTestPage from "./pages/SystemTestPage";

import SpaceAppsPage from "./components/SpaceAppsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mines" element={<Index />} />
              
              <Route path="/space-apps" element={<SpaceAppsPage />} />
              <Route path="/admin" element={<TaskAdminPage />} />
              <Route path="/system-test" element={<SystemTestPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProviders>
    </QueryClientProvider>
  );
}

export default App;
