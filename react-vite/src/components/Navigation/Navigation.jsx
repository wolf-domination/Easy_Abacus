import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  return (
    <ul>
      {/* Optional: keep Home if you want */}
      <li>
        <NavLink to="/">Home</NavLink>
      </li>

      <li>
        <NavLink to="/abacus">Abacus</NavLink>
      </li>

      <li>
        <NavLink to="/notes">Notes</NavLink>
      </li>

      <li>
        <ProfileButton />
      </li>
    </ul>
  );
}

export default Navigation;
