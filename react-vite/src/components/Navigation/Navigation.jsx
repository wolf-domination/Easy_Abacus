import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import ProfileButton from "./ProfileButton";

import { thunkLogin } from "../../redux/session";
import "./Navigation.css";

export default function Navigation({ onSearch }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const isHomePage = location.pathname === "/" || location.pathname === "/projects";

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const demoLogin = async () => {
    try {
      await dispatch(thunkLogin({
        email: "demo@aa.io",
        password: "password"
      }));
    } catch (error) {
      console.error("Demo login failed:", error);
      alert("Demo login failed. Please make sure the demo user exists in the database.");
    }
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <NavLink to="/" className="brand">Easy Abacus</NavLink>
        <NavLink to="/" className="nav-link">All Projects</NavLink>
        {user && (
          <NavLink to="/my-projects" className="nav-link">My Projects</NavLink>
        )}
      </div>

      {isHomePage && (
        <div className="nav-center">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      )}

      <div className="nav-right">
        {user ? (
          <ProfileButton user={user} />
        ) : (
          <>
            <OpenModalButton
              buttonText="Log In"
              modalComponent={<LoginFormModal />}
              className="btn"
            />
            <OpenModalButton
              buttonText="Sign Up"
              modalComponent={<SignupFormModal />}
              className="btn btn-primary"
            />
            <button className="btn btn-ghost" onClick={demoLogin}>
              Demo User
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
