import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentPortal from "./pages/StudentPortal";
import AdminPortal from "./pages/AdminPortal";
import ThemeToggle from "./components/ThemeToggle";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<StudentPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
