import { useState, useCallback } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import { getToken, setToken } from "../api";

function AdminPortal() {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()));

  const handleLogout = useCallback(() => {
    setToken(null);
    setLoggedIn(false);
  }, []);

  return loggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={() => setLoggedIn(true)} />
  );
}

export default AdminPortal;
