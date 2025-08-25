import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import configureStore from "./redux/store";
import * as sessionActions from "./redux/session";
import "./index.css";

import Layout from "./Layout";
import SpotsIndex from "./pages/SpotsIndex.jsx";
import SpotLayout from "./pages/SpotLayout.jsx";
import AbacusBox from "./components/AbacusBox/AbacusBox.jsx";
import SpotNotes from "./pages/SpotNotes.jsx";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";

const store = configureStore();
if (import.meta.env.MODE !== "production") {
  window.store = store;
  window.sessionActions = sessionActions;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/spots" replace /> },

      { path: "/spots", element: <SpotsIndex /> },

      {
        path: "/spots/:id",
        element: <SpotLayout />,
        children: [
          { index: true, element: <Navigate to="abacus" replace /> },
          { path: "abacus", element: <AbacusBox /> },
          { path: "notes", element: <SpotNotes /> },
        ],
      },

      { path: "/login", element: <LoginFormPage /> },
      { path: "/signup", element: <SignupFormPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <RouterProvider router={router} />
    </ReduxProvider>
  </React.StrictMode>
);
