"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";

type SceneMode = "hero" | "feature";

function FramePulse({ reduceMotion }: { reduceMotion: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    if (reduceMotion) return;
    const timer = window.setInterval(invalidate, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [invalidate, reduceMotion]);

  return null;
}

export default function GamesWorldScene({ mode }: { mode: SceneMode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 700px)");
    const updatePreferences = () => {
      setReduceMotion(motion.matches);
      setCompact(smallScreen.matches);
    };
    updatePreferences();
    motion.addEventListener("change", updatePreferences);
    smallScreen.addEventListener("change", updatePreferences);

    if (!host || !("IntersectionObserver" in window)) {
      setVisible(true);
      return () => {
        motion.removeEventListener("change", updatePreferences);
        smallScreen.removeEventListener("change", updatePreferences);
      };
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(host);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updatePreferences);
      smallScreen.removeEventListener("change", updatePreferences);
    };
  }, []);

  return (
    <div ref={hostRef} className={`games-3d games-3d--${mode}`} aria-hidden="true">
      {visible ? (
        <Canvas
          camera={{ position: [0, 0, 14], fov: mode === "hero" ? 24 : 12 }}
          dpr={compact ? 1 : [1, 1.3]}
          frameloop="demand"
          gl={{ alpha: true, antialias: !compact, powerPreference: "low-power" }}
          fallback={<div className="games-3d-fallback" />}
        >
          <FramePulse reduceMotion={reduceMotion} />
          <ambientLight intensity={1.8} color="#f5f8ff" />
          <directionalLight position={[-4, 7, 8]} intensity={2.3} color="#fff2d4" />
          <directionalLight position={[5, 3, -5]} intensity={1.1} color="#a9f4f0" />
          {mode === "hero" ? <HeroScene reduceMotion={reduceMotion} /> : <FeatureScene reduceMotion={reduceMotion} />}
        </Canvas>
      ) : (
        <div className="games-3d-fallback" />
      )}
    </div>
  );
}

function HeroScene({ reduceMotion }: { reduceMotion: boolean }) {
  const { viewport } = useThree();
  const narrow = viewport.width < 12;
  const scale = narrow ? 0.55 : Math.min(1.42, viewport.width / 23);
  const side = Math.min(viewport.width * 0.32, 8.5);
  const y = narrow ? -0.85 : -0.62;

  return (
    <>
      <group position={[-side, y, 0]} scale={scale}>
        <IdleGroup reduceMotion={reduceMotion} phase={0.4}>
          <KidGamer />
          {!narrow && <Puppy position={[2.05, -0.34, 0.28]} scale={0.7} />}
        </IdleGroup>
      </group>
      <group position={[side, y - 0.05, -0.25]} scale={scale}>
        <IdleGroup reduceMotion={reduceMotion} phase={2.1}>
          <FloatingPlayIsland />
        </IdleGroup>
      </group>
      {!narrow && <MiniIsland position={[-13, 1.35, -2]} scale={0.37} reduceMotion={reduceMotion} />}
      {!narrow && <MiniIsland position={[13.5, 1.55, -2.5]} scale={0.31} reduceMotion={reduceMotion} />}
      <Cloud position={[-5.8, 1.7, -3]} scale={1.05} phase={1} reduceMotion={reduceMotion} />
      <Cloud position={[5.9, 1.78, -3.5]} scale={0.8} phase={2.5} reduceMotion={reduceMotion} />
      <Sparkle position={[-2.8, 1.8, 0]} phase={0.2} reduceMotion={reduceMotion} color="#fff18c" />
      <Sparkle position={[2.9, 1.55, 0.2]} phase={1.6} reduceMotion={reduceMotion} color="#ffffff" />
      <Sparkle position={[0, -1.45, 0]} phase={2.3} reduceMotion={reduceMotion} color="#ffbd65" />
    </>
  );
}

function IdleGroup({ children, reduceMotion, phase = 0 }: { children: React.ReactNode; reduceMotion: boolean; phase?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.8 + phase) * 0.11;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.48 + phase) * 0.018;
  });
  return <group ref={ref}>{children}</group>;
}

function KidGamer() {
  return (
    <group position={[-0.52, -0.05, 0]}>
      <mesh position={[0, -0.82, 0]} scale={[0.62, 0.78, 0.45]} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#218fe0" roughness={0.64} />
      </mesh>
      <mesh position={[0, -0.03, 0.12]} scale={[0.79, 0.82, 0.55]} castShadow>
        <sphereGeometry args={[1, 28, 22]} />
        <meshStandardMaterial color="#1683d5" roughness={0.58} />
      </mesh>
      <mesh position={[-0.12, 0.08, 0.63]}>
        <boxGeometry args={[0.16, 0.28, 0.035]} />
        <meshStandardMaterial color="#ffd85e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.82, 0.08]} scale={[0.77, 0.88, 0.62]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#ffc48f" roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.48, 0.06]} scale={[0.8, 0.46, 0.66]} castShadow>
        <sphereGeometry args={[1, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.63]} />
        <meshStandardMaterial color="#74402d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.42, 1.42, 0.36]} scale={[0.27, 0.22, 0.3]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#8e5031" roughness={0.72} />
      </mesh>
      <mesh position={[0.16, 1.67, 0.36]} scale={[0.33, 0.25, 0.27]} rotation-z={-0.35}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#82442e" roughness={0.72} />
      </mesh>
      {[-0.27, 0.27].map((x) => (
        <group key={x} position={[x, 0.88, 0.62]}>
          <mesh scale={[0.105, 0.16, 0.075]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#fffaf2" /></mesh>
          <mesh position={[0.02, -0.015, 0.064]} scale={[0.053, 0.093, 0.05]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#443044" /></mesh>
          <mesh position={[0.036, 0.025, 0.105]} scale={0.023}><sphereGeometry args={[1, 12, 10]} /><meshBasicMaterial color="white" /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.56, 0.68]} scale={[0.16, 0.075, 0.035]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#cc5b62" roughness={0.45} />
      </mesh>
      <mesh position={[-0.78, -0.23, 0.25]} rotation-z={-0.7} scale={[0.46, 0.18, 0.18]}>
        <sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color="#ffc48f" />
      </mesh>
      <mesh position={[0.73, -0.18, 0.34]} rotation-z={0.65} scale={[0.5, 0.18, 0.18]}>
        <sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color="#ffc48f" />
      </mesh>
      <mesh position={[0, -0.37, 0.81]} rotation-x={-0.12} scale={[1, 0.48, 0.42]}>
        <sphereGeometry args={[0.47, 24, 16]} />
        <meshStandardMaterial color="#222d53" roughness={0.36} />
      </mesh>
      <mesh position={[-0.23, -0.36, 1.0]}><boxGeometry args={[0.23, 0.055, 0.025]} /><meshStandardMaterial color="#f5f2df" /></mesh>
      <mesh position={[-0.17, -0.3, 1.01]}><boxGeometry args={[0.055, 0.18, 0.025]} /><meshStandardMaterial color="#f5f2df" /></mesh>
      <mesh position={[0.19, -0.31, 1.04]}><sphereGeometry args={[0.045, 12, 10]} /><meshStandardMaterial color="#ff5f72" emissive="#87203b" /></mesh>
      <mesh position={[0.29, -0.41, 1.02]}><sphereGeometry args={[0.045, 12, 10]} /><meshStandardMaterial color="#62e7b2" emissive="#15744f" /></mesh>
    </group>
  );
}

function Puppy({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]} scale={[0.72, 0.55, 0.48]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color="#fff7e8" roughness={0.8} /></mesh>
      <mesh position={[0.32, 0.43, 0.15]} scale={[0.54, 0.52, 0.48]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color="#fff7e8" roughness={0.72} /></mesh>
      {[-0.08, 0.56].map((x) => <mesh key={x} position={[x, 0.68, 0.1]} rotation-z={x < 0 ? 0.45 : -0.45} scale={[0.2, 0.42, 0.16]}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color="#a85c39" roughness={0.76} /></mesh>)}
      {[-0.02, 0.5].map((x) => <mesh key={x} position={[x, 0.5, 0.55]} scale={[0.055, 0.085, 0.045]}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#392d35" /></mesh>)}
      <mesh position={[0.28, 0.31, 0.61]} scale={[0.12, 0.075, 0.07]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#593844" /></mesh>
      <mesh position={[-0.28, 0.34, 0.57]} scale={[0.23, 0.3, 0.06]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#b3764a" /></mesh>
    </group>
  );
}

function FloatingPlayIsland() {
  return (
    <group>
      <mesh position={[0, -0.56, 0]} scale={[1.22, 1, 0.92]} rotation-x={Math.PI} castShadow>
        <coneGeometry args={[1.9, 2.1, 8]} /><meshStandardMaterial color="#805b55" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0]} scale={[1.15, 0.23, 0.89]} castShadow>
        <cylinderGeometry args={[2.15, 2.05, 0.46, 9]} /><meshStandardMaterial color="#79c96f" flatShading roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.29, 0]} scale={[1.08, 0.1, 0.83]}>
        <cylinderGeometry args={[2.05, 2.05, 0.18, 9]} /><meshStandardMaterial color="#a6df75" flatShading roughness={0.85} />
      </mesh>
      <Castle position={[0, 0.45, -0.18]} scale={0.82} />
      <Tree position={[-1.48, 0.42, 0.44]} scale={0.8} />
      <Tree position={[1.5, 0.43, 0.32]} scale={0.72} />
      <TreasureChest position={[0.35, 0.48, 1.0]} scale={0.55} />
      <mesh position={[1.58, -0.7, 0.67]}>
        <boxGeometry args={[0.34, 1.15, 0.11]} /><meshStandardMaterial color="#4ec9ed" emissive="#12638d" emissiveIntensity={0.14} roughness={0.3} />
      </mesh>
      <mesh position={[1.62, -1.28, 0.68]} scale={[0.2, 0.12, 0.08]}>
        <sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#b9f4ff" emissive="#71dfff" emissiveIntensity={0.6} />
      </mesh>
      <GameController position={[0.15, 0.54, 1.35]} scale={0.82} />
    </group>
  );
}

function Castle({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.57, 0]}><boxGeometry args={[1.52, 1.05, 0.84]} /><meshStandardMaterial color="#fff6ea" roughness={0.68} /></mesh>
      <mesh position={[0, 0.61, 0.44]}><boxGeometry args={[0.17, 0.43, 0.035]} /><meshStandardMaterial color="#62bbed" emissive="#1d608d" emissiveIntensity={0.2} /></mesh>
      {[-0.67, 0.67].map((x, index) => (
        <group key={x} position={[x, 0.28, 0]}>
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.34, 0.37, 1.2, 8]} /><meshStandardMaterial color={index ? "#f3a2bd" : "#d9a5f4"} flatShading /></mesh>
          <mesh position={[0, 1.18, 0]}><coneGeometry args={[0.46, 0.77, 8]} /><meshStandardMaterial color={index ? "#ef728f" : "#9872e8"} flatShading /></mesh>
          <mesh position={[0, 0.38, 0.34]}><boxGeometry args={[0.12, 0.25, 0.025]} /><meshStandardMaterial color="#64b9eb" /></mesh>
        </group>
      ))}
      <mesh position={[0, 1.33, 0]}><coneGeometry args={[0.56, 0.87, 8]} /><meshStandardMaterial color="#78a5ef" flatShading /></mesh>
    </group>
  );
}

function Tree({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.09, 0.13, 0.63, 7]} /><meshStandardMaterial color="#986344" flatShading /></mesh>
      <mesh position={[0, 0.83, 0]}><icosahedronGeometry args={[0.49, 1]} /><meshStandardMaterial color="#42b979" flatShading roughness={0.85} /></mesh>
      <mesh position={[-0.22, 0.71, 0.12]}><icosahedronGeometry args={[0.28, 1]} /><meshStandardMaterial color="#8ce184" flatShading roughness={0.82} /></mesh>
    </group>
  );
}

function TreasureChest({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.19, 0]}><boxGeometry args={[0.78, 0.48, 0.48]} /><meshStandardMaterial color="#bc6332" roughness={0.58} /></mesh>
      <mesh position={[0, 0.46, 0]} rotation-z={0.04}><boxGeometry args={[0.84, 0.18, 0.53]} /><meshStandardMaterial color="#e39443" roughness={0.46} /></mesh>
      {[-0.27, 0.27].map((x) => <mesh key={x} position={[x, 0.2, 0.25]}><boxGeometry args={[0.09, 0.51, 0.025]} /><meshStandardMaterial color="#ffd65c" metalness={0.55} roughness={0.3} /></mesh>)}
      <mesh position={[0, 0.2, 0.28]}><boxGeometry args={[0.16, 0.2, 0.045]} /><meshStandardMaterial color="#ffe28a" metalness={0.4} roughness={0.28} /></mesh>
    </group>
  );
}

function GameController({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale} rotation-x={-0.18}>
      <mesh scale={[1, 0.36, 0.34]}><sphereGeometry args={[0.76, 24, 16]} /><meshStandardMaterial color="#fffdf5" roughness={0.35} /></mesh>
      <mesh position={[-0.54, -0.28, 0]} rotation-z={0.24} scale={[0.3, 0.58, 0.31]}><sphereGeometry args={[0.58, 20, 14]} /><meshStandardMaterial color="#e9edfa" roughness={0.42} /></mesh>
      <mesh position={[0.54, -0.28, 0]} rotation-z={-0.24} scale={[0.3, 0.58, 0.31]}><sphereGeometry args={[0.58, 20, 14]} /><meshStandardMaterial color="#e9edfa" roughness={0.42} /></mesh>
      <mesh position={[-0.39, 0.03, 0.24]}><boxGeometry args={[0.08, 0.28, 0.06]} /><meshStandardMaterial color="#45526e" /></mesh>
      <mesh position={[-0.39, 0.03, 0.24]}><boxGeometry args={[0.28, 0.08, 0.06]} /><meshStandardMaterial color="#45526e" /></mesh>
      {[[0.35, 0.12, "#ef5b70"], [0.5, -0.02, "#5b87ef"], [0.2, -0.05, "#f5c54e"], [0.35, -0.19, "#47bd89"]].map(([x, y, color]) => (
        <mesh key={`${x}-${y}`} position={[Number(x), Number(y), 0.25]}><sphereGeometry args={[0.075, 14, 10]} /><meshStandardMaterial color={String(color)} roughness={0.32} /></mesh>
      ))}
    </group>
  );
}

function MiniIsland({ position, scale, reduceMotion }: { position: [number, number, number]; scale: number; reduceMotion: boolean }) {
  return (
    <group position={position} scale={scale}>
      <IdleGroup reduceMotion={reduceMotion} phase={1.7}>
        <mesh position={[0, -0.25, 0]} rotation-x={Math.PI}><coneGeometry args={[1.15, 1.05, 7]} /><meshStandardMaterial color="#9b7062" flatShading /></mesh>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[1.24, 1.16, 0.27, 8]} /><meshStandardMaterial color="#78c96e" flatShading /></mesh>
        <Tree position={[-0.36, 0.26, 0.12]} scale={0.46} />
        <Tree position={[0.42, 0.26, 0.06]} scale={0.36} />
      </IdleGroup>
    </group>
  );
}

function Cloud({ position, scale, phase, reduceMotion }: { position: [number, number, number]; scale: number; phase: number; reduceMotion: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return;
    ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.22 + phase) * 0.28;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.65 + phase) * 0.08;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {[[0, 0, 0, 0.58], [0.48, 0.08, 0, 0.42], [-0.42, -0.04, 0, 0.38]].map(([x, y, z, radius]) => (
        <mesh key={x} position={[x, y, z]} scale={[1.35, 0.72, 0.6]}><sphereGeometry args={[radius, 18, 12]} /><meshStandardMaterial color="#ffffff" roughness={0.94} transparent opacity={0.86} /></mesh>
      ))}
    </group>
  );
}

function Sparkle({ position, phase, reduceMotion, color }: { position: [number, number, number]; phase: number; reduceMotion: boolean; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return;
    const pulse = 0.78 + (Math.sin(clock.elapsedTime * 2 + phase) + 1) * 0.18;
    ref.current.scale.setScalar(pulse);
    ref.current.rotation.y = clock.elapsedTime * 0.45 + phase;
  });
  return <group ref={ref} position={position}><mesh><octahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.24} /></mesh></group>;
}

function FeatureScene({ reduceMotion }: { reduceMotion: boolean }) {
  const { viewport } = useThree();
  const spread = Math.min(3.05, viewport.width * 0.13);
  return (
    <>
      <FeatureCard position={[-spread, -0.06, 0]} rotation={-0.13} variant="blocks" phase={0.3} reduceMotion={reduceMotion} />
      <FeatureCard position={[0, 0.18, -0.3]} rotation={0.06} variant="apple" phase={1.5} reduceMotion={reduceMotion} />
      <FeatureCard position={[spread, -0.02, 0]} rotation={0.14} variant="car" phase={2.4} reduceMotion={reduceMotion} />
      <Sparkle position={[-spread - 1.2, 1.15, 0.3]} phase={0.1} reduceMotion={reduceMotion} color="#fff188" />
      <Sparkle position={[spread + 1.12, 1.05, 0.3]} phase={1.2} reduceMotion={reduceMotion} color="#ffffff" />
      <mesh position={[0, -1.55, -1.5]} scale={[spread + 3.4, 0.24, 0.62]}>
        <sphereGeometry args={[1, 28, 12]} /><meshStandardMaterial color="#7edb9a" roughness={0.88} />
      </mesh>
    </>
  );
}

function FeatureCard({ position, rotation, variant, phase, reduceMotion }: {
  position: [number, number, number];
  rotation: number;
  variant: "blocks" | "apple" | "car";
  phase: number;
  reduceMotion: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.9 + phase) * 0.13;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.45 + phase) * 0.11;
  });
  return (
    <group ref={ref} position={position} rotation-z={rotation}>
      <mesh position={[0, 0, -0.1]} castShadow><boxGeometry args={[1.82, 2.32, 0.18]} /><meshStandardMaterial color="#ffffff" roughness={0.32} /></mesh>
      <mesh position={[0, 0, 0.005]}><boxGeometry args={[1.58, 2.08, 0.05]} /><meshStandardMaterial color={variant === "blocks" ? "#c9f4ff" : variant === "apple" ? "#ffe1ef" : "#fff0d5"} roughness={0.48} /></mesh>
      {variant === "blocks" ? <ColorBlocks /> : variant === "apple" ? <Apple /> : <ToyCar />}
      <mesh position={[0.63, 0.79, 0.11]}><icosahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color="#ffdc60" emissive="#dba62c" emissiveIntensity={0.18} /></mesh>
    </group>
  );
}

function ColorBlocks() {
  return <group position={[0, 0.02, 0.28]}>
    {[-0.42, 0.38].map((x, index) => <mesh key={x} position={[x, index ? -0.18 : 0.12, 0]} rotation-z={index ? 0.24 : -0.18}><boxGeometry args={[0.66, 0.66, 0.42]} /><meshStandardMaterial color={index ? "#f3a1e5" : "#379fe9"} roughness={0.4} /></mesh>)}
    <mesh position={[0.03, -0.32, 0.14]} rotation-z={0.08}><boxGeometry args={[0.62, 0.62, 0.4]} /><meshStandardMaterial color="#86d85e" roughness={0.4} /></mesh>
    <mesh position={[-0.42, 0.13, 0.23]}><octahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color="#ffdc61" emissive="#b98b23" emissiveIntensity={0.18} /></mesh>
  </group>;
}

function Apple() {
  return <group position={[0, -0.04, 0.29]}>
    <mesh scale={[0.53, 0.61, 0.39]}><sphereGeometry args={[1, 26, 20]} /><meshStandardMaterial color="#f04452" roughness={0.34} /></mesh>
    <mesh position={[0.04, 0.63, 0]} rotation-z={-0.16}><cylinderGeometry args={[0.045, 0.065, 0.31, 8]} /><meshStandardMaterial color="#82512e" roughness={0.8} /></mesh>
    <mesh position={[0.2, 0.56, 0]} rotation-z={-0.5} scale={[0.25, 0.12, 0.07]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#54bd70" roughness={0.58} /></mesh>
    <mesh position={[-0.19, 0.2, 0.31]} scale={[0.1, 0.25, 0.04]}><sphereGeometry args={[1, 12, 10]} /><meshBasicMaterial color="#ff9b9d" transparent opacity={0.6} /></mesh>
  </group>;
}

function ToyCar() {
  return <group position={[0, -0.1, 0.29]}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.04, 0.48, 0.57]} /><meshStandardMaterial color="#258ee7" roughness={0.35} /></mesh>
    <mesh position={[-0.04, 0.33, 0]}><boxGeometry args={[0.59, 0.34, 0.48]} /><meshStandardMaterial color="#63c9f6" roughness={0.3} /></mesh>
    {[-0.34, 0.34].map((x) => <mesh key={x} position={[x, -0.25, 0.24]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.17, 0.17, 0.12, 18]} /><meshStandardMaterial color="#29334e" roughness={0.82} /></mesh>)}
    <mesh position={[0.4, 0.03, 0.3]}><boxGeometry args={[0.13, 0.13, 0.045]} /><meshStandardMaterial color="#fff08b" emissive="#c9a327" emissiveIntensity={0.25} /></mesh>
  </group>;
}
