import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import StudentSearch from "./pages/StudentSearch";
import StaffDashboard from "./pages/StaffDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/buscar" element={<StudentSearch />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
