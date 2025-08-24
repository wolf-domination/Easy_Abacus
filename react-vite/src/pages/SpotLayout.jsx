import { NavLink, Outlet, useLoaderData } from "react-router-dom";

export async function spotLoader({ params }) {
  const r = await fetch(`/api/spots/${params.spotId}`, { credentials: "same-origin" });
  if (!r.ok) throw new Response("Not found", { status: 404 });
  return r.json();
}

export default function SpotLayout() {
  const spot = useLoaderData(); // { id, name, ... }

  const tab = ({ isActive }) => ({
    padding: "6px 10px",
    borderRadius: 6,
    textDecoration: "none",
    color: isActive ? "white" : "#333",
    background: isActive ? "#333" : "transparent",
  });

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{spot.name}</h2>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <NavLink to="abacus" style={tab}>Abacus</NavLink>
        <NavLink to="notes" style={tab}>Notes</NavLink>
      </div>
      <Outlet context={{ spot }} />
    </div>
  );
}
