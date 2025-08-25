

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const api = async (path, opts = {}) => {
  const r = await fetch(`/api/spots${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "same-origin",
    ...opts,
  });
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
};

export default function ProjectNotes() {
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get("spot");
  const [spot, setSpot] = useState(null);

  useEffect(() => {
    if (!spotId) return;
    api(`/${spotId}`).then(setSpot).catch(() => setSpot(null));
  }, [spotId]);

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <Link to="/spots">← Back to Projects</Link>
      </div>

      {!spotId && <div>No project selected.</div>}

      {spotId && !spot && <div>Loading…</div>}

      {spot && (
        <>
          <h2 style={{ marginBottom: 6 }}>{spot.name}</h2>
          <div style={{ color: "#666", marginBottom: 16 }}>
            Spot ID: {spot.id}
          </div>

          {spot.thumbnail_url ? (
            <img
              src={spot.thumbnail_url}
              alt={`${spot.name} thumbnail`}
              style={{
                width: "100%",
                maxWidth: 480,
                height: "auto",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 16,
              }}
            />
          ) : (
            <div
              style={{
                width: 240,
                height: 160,
                border: "1px dashed #bbb",
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                marginBottom: 16,
                color: "#888",
              }}
            >
              No image
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Description</div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {spot.description || "No description"}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Notes</div>
            <div style={{ color: "#666" }}>
              This is a placeholder page. We can wire persistent, per-spot notes
              next.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
