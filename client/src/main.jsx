
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";
import BrandsPage from "./pages/BrandsPage.jsx";
import BrandProductsPage from "./pages/BrandProductsPage.jsx";
import ProductPage from "./pages/BrandProductsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <BrandsPage /> },
      { path: "brand/:brandId", element: <BrandProductsPage /> },
      { path: "style/:styleId", element: <ProductPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);