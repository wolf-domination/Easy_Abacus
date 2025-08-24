import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import ProfileButton from "./ProfileButton";

import { thunkLogin } from "../../redux/session";
import "./Navigation.css";

export default function Navigation() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);

  const demoLogin = async () => {
    // Adjust these if your seed uses different creds
    const creds = [
      { credential: "demo@aa.io", password: "password" },
      { credential: "Demo-lition", password: "password" },
    ];
    for (const c of creds) {
      try {
        await dispatch(thunkLogin(c));
        return;
      } catch {
        // try next
      }
    }
    // optional: you could toast an error here
    console.error("Demo login failed. Check demo seed credentials.");
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <NavLink to="/spots" className="brand">Easy Abacus</NavLink>
        <NavLink to="/spots" className="nav-link">Projects</NavLink>
      </div>

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
