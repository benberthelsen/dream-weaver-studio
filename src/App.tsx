import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InspirationPage from "./pages/InspirationPage";
import FlatlaysPage from "./pages/FlatlaysPage";
import CollectionsPage from "./pages/CollectionsPage";
import BoardPage from "./pages/BoardPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InspirationPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/inspiration/flatlays" element={<FlatlaysPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
