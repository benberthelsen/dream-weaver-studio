import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PricingPage from "./pages/PricingPage";
import RoomPlannerPage from "./pages/RoomPlannerPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import InspirationPage from "./pages/InspirationPage";
import FlatlaysPage from "./pages/FlatlaysPage";
import CollectionsPage from "./pages/CollectionsPage";
import BoardPage from "./pages/BoardPage";
import AdminPage from "./pages/AdminPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/room-planner" element={<RoomPlannerPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<InspirationPage />} />
          <Route path="/gallery/flatlays" element={<FlatlaysPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
