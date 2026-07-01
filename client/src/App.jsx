import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ui/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Real pages
import Dashboard from "./pages/dashboard/Dashboard";

// Placeholder pages for routes we'll build next
const OrgPage = () => (
  <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
    <p className="text-green-400 text-xl font-mono">
      Organization page — coming next
    </p>
  </div>
);

const ProjectPage = () => (
  <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
    <p className="text-green-400 text-xl font-mono">
      Project page — coming next
    </p>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:orgId"
        element={
          <ProtectedRoute>
            <OrgPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:orgId/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default App;
