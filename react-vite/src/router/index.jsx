import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout";
import ProjectsIndex from "../pages/ProjectsIndex";
import MyProjects from "../pages/MyProjects";
import AbacusBox from "../components/AbacusBox/AbacusBox";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ProjectsIndex /> },
      { path: "projects", element: <ProjectsIndex /> },
      { path: "my-projects", element: <MyProjects /> },
      { path: "projects/:id/abacus", element: <AbacusBox /> },
    ],
  },
]);

export default router;
