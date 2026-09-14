import { useAuthStore } from "../../store/authStore";
import DashboardView from "./DashboardView";
import MyDashboardView from "./MyDashboardView";

/** Routes /dashboard to the practice-wide PM view or the personal non-PM view, based on the signed-in role. */
export default function DashboardRouteView() {
  const role = useAuthStore((state) => state.currentUser?.role);
  return role === "project-manager" ? <DashboardView /> : <MyDashboardView />;
}
