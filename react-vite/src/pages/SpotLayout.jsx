import { NavLink, Outlet, useParams } from "react-router-dom";

export default function SpotLayout() {
  const { id } = useParams();

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: 12 }}>
        <NavLink to="/spots">← Back to Projects</NavLink>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <NavLink to={`/spots/${id}/abacus`} className={({isActive}) => isActive ? "tab active" : "tab"}>Abacus</NavLink>
        <NavLink to={`/spots/${id}/notes`} className={({isActive}) => isActive ? "tab active" : "tab"}>Notes</NavLink>
      </div>

      <Outlet />
    </div>
  );
}
