import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ModalProvider, Modal } from "./context/Modal";
import { thunkAuthenticate } from "./redux/session";
import Navigation from "./components/Navigation/Navigation";
import ProjectsIndex from "./pages/ProjectsIndex";
import MyProjects from "./pages/MyProjects";

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  
  const isHomePage = location.pathname === "/" || location.pathname === "/projects";
  const isMyProjectsPage = location.pathname === "/my-projects";

  useEffect(() => {
    dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <ModalProvider>
      <Navigation onSearch={handleSearch} />
      {isLoaded && (
        isHomePage ? 
        <ProjectsIndex searchQuery={searchQuery} /> :
        isMyProjectsPage ?
        <MyProjects /> :
        <Outlet />
      )}
      <Modal />
    </ModalProvider>
  );
}
