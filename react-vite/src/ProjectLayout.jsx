


import { NavLink, Outlet } from "react-router-dom";

export default function ProjectLayout() {
  const tabStyle = ({ isActive }) => ({
    padding: "6px 10px",
    borderRadius: 6,
    textDecoration: "none",
    color: isActive ? "white" : "#333",
    background: isActive ? "#333" : "transparent",
  });

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <NavLink to="abacus" style={tabStyle}>Abacus</NavLink>
        <NavLink to="notes" style={tabStyle}>Notes</NavLink>
      </div>
      <Outlet />
    </div>
  );
}