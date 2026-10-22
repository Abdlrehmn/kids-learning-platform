"use client";

import dynamic from "next/dynamic";

export type LearningZoneKind = "typing" | "english" | "games" | "rewards";

const LearningZoneIslandScene = dynamic(() => import("./LearningZoneIslandScene"), {
  ssr: false,
  loading: () => (
    <div className="space-zone-island-loading" aria-hidden="true">
      <span>⌨</span>
    </div>
  ),
});

export default function LearningZoneIsland({ kind }: { kind: LearningZoneKind }) {
  return <LearningZoneIslandScene kind={kind} />;
}
