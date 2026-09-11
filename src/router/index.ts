import { createElement } from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import DashboardView from "../views/dashboard/DashboardView";

const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(App),
    children: [{ index: true, element: createElement(DashboardView) }],
  },
]);

export default router;
