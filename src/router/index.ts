import { createElement } from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import HomeView from "../views/home/HomeView";

const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(App),
    children: [{ index: true, element: createElement(HomeView) }],
  },
]);

export default router;
