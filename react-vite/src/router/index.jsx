import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout";
import SpotsIndex from "../pages/SpotsIndex";
import SpotNotes from "../pages/SpotNotes";
import AbacusBox from "../components/AbacusBox/AbacusBox";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <SpotsIndex /> },
      { path: "spots", element: <SpotsIndex /> },
      { path: "spots/:id/notes", element: <SpotNotes /> },
      { path: "spots/:id/abacus", element: <AbacusBox /> },
    ],
  },
]);

export default router;
