import { Navigate, createBrowserRouter } from "react-router-dom";

import App from "../App";
import LoginView from "../views/auth/LoginView";
import CustomerDetailView from "../views/customers/CustomerDetailView";
import CustomersView from "../views/customers/CustomersView";
import DashboardView from "../views/dashboard/DashboardView";
import ProjectDetailView from "../views/projects/ProjectDetailView";
import ProjectsView from "../views/projects/ProjectsView";
import SchedulerView from "../views/scheduler/SchedulerView";
import RequireAuth from "./RequireAuth";

const router = createBrowserRouter([
  { path: "/login", element: <LoginView /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardView /> },
      { path: "projects", element: <ProjectsView /> },
      { path: "projects/:projectId", element: <ProjectDetailView /> },
      { path: "customers", element: <CustomersView /> },
      { path: "customers/:customerId", element: <CustomerDetailView /> },
      { path: "scheduler", element: <SchedulerView /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default router;
