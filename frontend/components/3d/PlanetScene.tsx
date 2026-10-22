"use client";

import dynamic from "next/dynamic";

const Planet = dynamic(() => import("./Planet"), {
  ssr: false,
  loading: () => (
    <div className="planet-loading" role="status" aria-live="polite">
      <span className="planet-loading-island" aria-hidden="true">✦</span>
      <span>Preparing your little world…</span>
    </div>
  ),
});

export default function PlanetScene() {
  return <Planet />;
}
