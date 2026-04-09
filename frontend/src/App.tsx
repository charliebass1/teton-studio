import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Deals from "@/pages/Deals";
import DealDetail from "@/pages/DealDetail";
import Studio from "@/pages/Studio";
import StudioBrand from "@/pages/StudioBrand";
import StudioPositioning from "@/pages/StudioPositioning";
import StudioGtm from "@/pages/StudioGtm";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/deals/:id" element={<DealDetail />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/studio/brand" element={<StudioBrand />} />
          <Route path="/studio/positioning" element={<StudioPositioning />} />
          <Route path="/studio/gtm" element={<StudioGtm />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
