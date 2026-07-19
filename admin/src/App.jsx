import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="sdg-tracker"     element={<SDGTracker />} />
          <Route path="analytics" element={<Reports />} />
          <Route path="data-management" element={<DataManagement />} />n
          <Route path="events-projects" element={<EventsProjects />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="project-showcase" element={<ProjectShowcase />} />
          <Route path="knowledge-hub"   element={<KnowledgeHub />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;