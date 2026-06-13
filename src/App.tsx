import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClinicPage from "@/pages/ClinicPage";
import ArchivePage from "@/pages/ArchivePage";
import StaffPage from "@/pages/StaffPage";
import FinancePage from "@/pages/FinancePage";
import { TopBar } from "@/components/TopBar";
import { NotificationToast } from "@/components/NotificationToast";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-clinic-bg">
        <TopBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ClinicPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="*" element={<ClinicPage />} />
          </Routes>
        </main>
        <NotificationToast />
      </div>
    </Router>
  );
}
