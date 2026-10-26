
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login/Login";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import SDGTracker from "./pages/SDGTracker/SDGTracker";
import Reports from "./pages/Analytics/Reports";
import DataManagement from "./pages/DataManagement/DataManagement";
import EventsProjects from "./pages/EventsProjects/EventsProjects";
import UserManagement from "./pages/UserManagement/UserManagement";
import ProjectShowcase from "./pages/ProjectShowcase/ProjectShowcase";
import KnowledgeHub from "./pages/KnowledgeHub/KnowledgeHub";
import AIClassifier from "./pages/AIClassifier/AIClassifier";
import CompletionReports from "./pages/CompletionReports";

function AdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    user = null;
  }

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="completion-reports"element={<CompletionReports />}/>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sdg-tracker" element={<SDGTracker />} />
          <Route path="analytics" element={<Reports />} />
          <Route path="data-management" element={<DataManagement />} />
          <Route path="events-projects" element={<EventsProjects />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="project-showcase" element={<ProjectShowcase />} />
          <Route path="knowledge-hub" element={<KnowledgeHub />} />
          <Route path="ai-classifier" element={<AIClassifier />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
