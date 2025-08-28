import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { thunkLogout } from "../../redux/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";

function ProfileButton() {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector((store) => store.session.user);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    closeMenu();
  };

  if (!user) {
    return null; // Don't show profile button when not logged in
  }

  return (
    <div className="profile-button-container">
      <button 
        onClick={toggleMenu}
        className="profile-button"
        aria-label="Profile menu"
        aria-expanded={showMenu}
      >
        <div className="profile-avatar">
          <FaUserCircle />
        </div>
        <span className="profile-username">{user.username}</span>
        <FaChevronDown className={`profile-chevron ${showMenu ? 'rotated' : ''}`} />
      </button>
      
      {showMenu && (
        <div className="profile-dropdown" ref={ulRef}>
          <div className="profile-dropdown-header">
            <div className="profile-avatar-large">
              <FaUserCircle />
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.username}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <ul className="profile-dropdown-menu">
            <li>
              <button className="profile-menu-item logout" onClick={logout}>
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProfileButton;
