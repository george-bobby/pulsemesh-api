import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import RootRedirect from "./components/RootRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import Predictive from "./pages/Predictive";
import Fallback from "./pages/Fallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/providers" element={
            <ProtectedRoute>
              <Providers />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/predictive" element={
            <ProtectedRoute>
              <Predictive />
            </ProtectedRoute>
          } />
          <Route path="/fallback" element={
            <ProtectedRoute>
              <Fallback />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
