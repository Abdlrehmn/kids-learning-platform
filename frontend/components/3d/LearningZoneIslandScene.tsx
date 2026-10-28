"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import type { LearningZoneKind } from "./LearningZoneIsland";

type IslandPalette = {
  rock: string;
  rockLight: string;
  rockDark: string;
  grass: string;
  grassLight: string;
  tree: string;
  treeLight: string;
  accent: string;
};

const islandPalettes: Record<LearningZoneKind, IslandPalette> = {
  typing: {
    rock: "#805c50", rockLight: "#a8765d", rockDark: "#684e4c",
    grass: "#55aa75", grassLight: "#7bd17d", tree: "#37a97c", treeLight: "#72d291", accent: "#ffd15e",
  },
  english: {
    rock: "#82685a", rockLight: "#af8165", rockDark: "#68534f",
    grass: "#38b98d", grassLight: "#8be0a3", tree: "#279b7c", treeLight: "#70d391", accent: "#fff08a",
  },
  games: {
    rock: "#96684c", rockLight: "#bd865b", rockDark: "#755044",
    grass: "#79b866", grassLight: "#b7dc74", tree: "#3d9a74", treeLight: "#81d281", accent: "#ff9140",
  },
  rewards: {
    rock: "#876356", rockLight: "#ae7c64", rockDark: "#694e56",
    grass: "#53b984", grassLight: "#9bdc83", tree: "#339c79", treeLight: "#7bd58c", accent: "#ffd34d",
  },
};

const fallbackIcons: Record<LearningZoneKind, string> = {
  typing: "⌨",
  english: "📖",
  games: "🎮",
  rewards: "🏆",
};

function SceneFramePacer({
  active,
  reduceMotion,
  fps,
}: {
  active: boolean;
  reduceMotion: boolean;
  fps: number;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return;

    invalidate();
    if (reduceMotion) return;

    const timerId = window.setInterval(() => invalidate(), 1000 / fps);
    return () => window.clearInterval(timerId);
  }, [active, fps, invalidate, reduceMotion]);

  return null;
}

function SwayingTree({
  position,
  scale = 1,
  phase = 0,
  reduceMotion,
  palette,
}: {
  position: [number, number, number];
  scale?: number;
  phase?: number;
  reduceMotion: boolean;
  palette: IslandPalette;
}) {
  const treeRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const tree = treeRef.current;
    if (!tree) return;

    tree.rotation.z = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.8 + phase) * 0.045;
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 0.38, 6]} />
        <meshStandardMaterial color="#966348" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color={palette.tree} flatShading roughness={0.86} />
      </mesh>
      <mesh position={[0.1, 0.43, 0.035]}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial color={palette.treeLight} flatShading roughness={0.86} />
      </mesh>
    </group>
  );
}

function Keyboard({ accent }: { accent: string }) {
  const keys = Array.from({ length: 15 }, (_, index) => {
    const row = Math.floor(index / 5);
    const column = index % 5;
    const isAccent = index === 2 || index === 12;
    return (
      <mesh key={index} position={[-0.28 + column * 0.14, 0.44, 0.31 - row * 0.105]}>
        <boxGeometry args={[0.105, 0.035, 0.07]} />
        <meshStandardMaterial color={isAccent ? accent : "#f6f5ff"} roughness={0.55} />
      </mesh>
    );
  });

  return (
    <group rotation={[-0.12, -0.1, -0.12]}>
      <mesh position={[0, 0.34, 0.22]}>
        <boxGeometry args={[0.86, 0.13, 0.46]} />
        <meshStandardMaterial color="#5948d9" flatShading roughness={0.62} />
      </mesh>
      {keys}
      <mesh position={[0, 0.43, 0.05]}>
        <boxGeometry args={[0.31, 0.035, 0.055]} />
        <meshStandardMaterial color="#a9c5ff" roughness={0.64} />
      </mesh>
    </group>
  );
}

function OpenBook({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.12, 0.14]} rotation={[-0.08, -0.1, -0.1]}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.98, 0.08, 0.62]} />
        <meshStandardMaterial color="#198d72" flatShading roughness={0.72} />
      </mesh>
      <mesh position={[-0.235, 0.145, 0]} rotation={[0, 0, -0.055]}>
        <boxGeometry args={[0.45, 0.035, 0.56]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.78} />
      </mesh>
      <mesh position={[0.235, 0.145, 0]} rotation={[0, 0, 0.055]}>
        <boxGeometry args={[0.45, 0.035, 0.56]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.78} />
      </mesh>
      {[-0.32, -0.21, -0.1, 0.1, 0.21, 0.32].map((x, index) => (
        <mesh key={x} position={[x, 0.169, index % 2 === 0 ? -0.1 : 0.02]}>
          <boxGeometry args={[0.16, 0.008, 0.012]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.025, 0.025, 0.59]} />
        <meshStandardMaterial color="#5ab99d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Gamepad({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.21, 0.15]} rotation={[-0.06, -0.08, -0.08]}>
      <mesh scale={[0.47, 0.16, 0.3]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#fff4e4" flatShading roughness={0.55} />
      </mesh>
      <mesh position={[-0.22, 0.12, 0.02]}>
        <boxGeometry args={[0.065, 0.035, 0.22]} />
        <meshStandardMaterial color="#f27628" roughness={0.48} />
      </mesh>
      <mesh position={[-0.22, 0.12, 0.02]}>
        <boxGeometry args={[0.19, 0.035, 0.065]} />
        <meshStandardMaterial color="#f27628" roughness={0.48} />
      </mesh>
      <mesh position={[0.18, 0.13, -0.045]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0.3, 0.13, 0.06]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial color="#55b77d" />
      </mesh>
      <mesh position={[0, 0.16, -0.2]}>
        <boxGeometry args={[0.25, 0.035, 0.07]} />
        <meshStandardMaterial color="#80bce9" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Trophy({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.11, 0.12]} rotation={[0, -0.08, -0.08]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.34, 0.2, 0.38, 8]} />
        <meshStandardMaterial color={accent} flatShading metalness={0.18} roughness={0.42} />
      </mesh>
      <mesh position={[-0.32, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.045, 6, 12]} />
        <meshStandardMaterial color={accent} flatShading metalness={0.16} roughness={0.42} />
      </mesh>
      <mesh position={[0.32, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.045, 6, 12]} />
        <meshStandardMaterial color={accent} flatShading metalness={0.16} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.2, 7]} />
        <meshStandardMaterial color={accent} flatShading metalness={0.12} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.43, 0.09, 0.28]} />
        <meshStandardMaterial color="#f7ad37" flatShading metalness={0.12} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ZoneLandmark({ kind, accent }: { kind: LearningZoneKind; accent: string }) {
  if (kind === "typing") return <Keyboard accent={accent} />;
  if (kind === "english") return <OpenBook accent={accent} />;
  if (kind === "games") return <Gamepad accent={accent} />;
  return <Trophy accent={accent} />;
}

function FloatingIsland({ kind, reduceMotion }: { kind: LearningZoneKind; reduceMotion: boolean }) {
  const palette = islandPalettes[kind];
  const islandRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const island = islandRef.current;
    if (island) {
      island.position.y = reduceMotion ? 0 : Math.sin(time * 0.85) * 0.045;
      island.rotation.y = reduceMotion ? -0.18 : -0.18 + Math.sin(time * 0.34) * 0.035;
    }
  });

  return (
    <group ref={islandRef} rotation={[-0.12, -0.18, -0.025]}>
      <group scale={1.26}>
        <mesh position={[0, -0.3, 0]} scale={[1.08, 0.46, 0.84]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={palette.rock} flatShading roughness={1} />
        </mesh>
        <mesh position={[-0.56, -0.33, 0.08]} scale={[0.43, 0.27, 0.42]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={palette.rockLight} flatShading roughness={1} />
        </mesh>
        <mesh position={[0.55, -0.35, -0.06]} scale={[0.4, 0.25, 0.38]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={palette.rockDark} flatShading roughness={1} />
        </mesh>
        <mesh position={[0, -0.105, 0]}>
          <cylinderGeometry args={[1.13, 0.91, 0.33, 10]} />
          <meshStandardMaterial color={palette.grass} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[1.12, 1.12, 0.08, 10]} />
          <meshStandardMaterial color={palette.grassLight} flatShading roughness={1} />
        </mesh>
        <mesh position={[-0.54, 0.11, 0.46]} scale={[0.42, 0.045, 0.2]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#b6e889" flatShading roughness={1} />
        </mesh>
        <mesh position={[0.61, 0.11, -0.34]} scale={[0.32, 0.04, 0.19]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={palette.grass} flatShading roughness={1} />
        </mesh>

        <SwayingTree position={[-0.76, 0.1, -0.2]} scale={0.76} phase={0.4} reduceMotion={reduceMotion} palette={palette} />
        <SwayingTree position={[0.8, 0.1, -0.3]} scale={0.62} phase={1.7} reduceMotion={reduceMotion} palette={palette} />
        <ZoneLandmark kind={kind} accent={palette.accent} />
      </group>
    </group>
  );
}

export default function LearningZoneIslandScene({ kind }: { kind: LearningZoneKind }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const compactScreen = window.matchMedia("(max-width: 700px)");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreferences = () => {
      setCompact(compactScreen.matches);
      setReduceMotion(motionPreference.matches);
    };

    updatePreferences();
    compactScreen.addEventListener("change", updatePreferences);
    motionPreference.addEventListener("change", updatePreferences);
    return () => {
      compactScreen.removeEventListener("change", updatePreferences);
      motionPreference.removeEventListener("change", updatePreferences);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="space-zone-island-canvas-host">
      {isVisible ? (
        <Canvas
          className="space-zone-island-canvas"
          camera={{ position: [0, 0.95, 3.15], fov: 44 }}
          dpr={compact ? 1 : [1, 1.2]}
          frameloop="demand"
          shadows={false}
          gl={{ antialias: !compact, powerPreference: "low-power", alpha: true }}
          fallback={
            <div className="space-zone-island-loading" aria-hidden="true">
              <span>{fallbackIcons[kind]}</span>
            </div>
          }
        >
          <SceneFramePacer active={isVisible} reduceMotion={reduceMotion} fps={compact ? 30 : 45} />
          <ambientLight intensity={1.7} color="#f5f9ff" />
          <directionalLight position={[-3, 4, 4]} color="#fff0c8" intensity={2.2} />
          <directionalLight position={[3, 2, -2]} color="#a7e8e3" intensity={0.85} />
          <FloatingIsland kind={kind} reduceMotion={reduceMotion} />
        </Canvas>
      ) : (
        <div className="space-zone-island-loading" aria-hidden="true">
          <span>{fallbackIcons[kind]}</span>
        </div>
      )}
    </div>
  );
}
