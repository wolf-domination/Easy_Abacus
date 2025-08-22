import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import configureStore from "./redux/store";
import * as sessionActions from "./redux/session";
import "./index.css";

import Layout from "./Layout";
import ProjectLayout from "./ProjectLayout";   // <-- new
import AbacusBox from "./components/AbacusBox/AbacusBox.jsx";
import Notes from "./pages/Notes.jsx";
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
      // Project root with sub-tabs
      {
        path: "/project",
        element: <ProjectLayout />,
        children: [
          { index: true, element: <Navigate to="abacus" replace /> },
          { path: "abacus", element: <AbacusBox /> },
          { path: "notes", element: <Notes /> },
        ],
      },

      // Back-compat redirects
      { path: "/abacus", element: <Navigate to="/project/abacus" replace /> },
      { path: "/notes", element: <Navigate to="/project/notes" replace /> },

      // Auth
      { path: "/login", element: <LoginFormPage /> },
      { path: "/signup", element: <SignupFormPage /> },

      // Root → Project
      { path: "/", element: <Navigate to="/project" replace /> },
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
