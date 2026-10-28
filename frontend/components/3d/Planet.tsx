"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  CanvasTexture,
  LinearFilter,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import type { Group, Object3D, Sprite } from "three";
import {
  ACTOR_SVG_DATA_URL,
  HEIST_PHASE_DURATIONS,
  useHideAndSeek,
  type HideAndSeekPhase,
  type StarPosition,
} from "@/components/HideAndSeekShow";

type NullableRef<T> = { current: T | null };

function ResponsiveCamera() {
  const [fieldOfView, setFieldOfView] = useState(38);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 700px)");
    const tablet = window.matchMedia("(min-width: 701px) and (max-width: 920px)");
    const updateFieldOfView = () => {
      setFieldOfView(phone.matches ? 43 : tablet.matches ? 40 : 38);
    };

    updateFieldOfView();
    phone.addEventListener("change", updateFieldOfView);
    tablet.addEventListener("change", updateFieldOfView);
    return () => {
      phone.removeEventListener("change", updateFieldOfView);
      tablet.removeEventListener("change", updateFieldOfView);
    };
  }, []);

  return <PerspectiveCamera makeDefault position={[0, 1.8, 5.6]} fov={fieldOfView} />;
}

function smoothStep(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function cubicBezier(
  start: Vector3,
  firstControl: Vector3,
  secondControl: Vector3,
  end: Vector3,
  progress: number,
  target: Vector3,
): Vector3 {
  const inverse = 1 - progress;
  return target
    .copy(start)
    .multiplyScalar(inverse * inverse * inverse)
    .addScaledVector(firstControl, 3 * inverse * inverse * progress)
    .addScaledVector(secondControl, 3 * inverse * progress * progress)
    .addScaledVector(end, progress * progress * progress);
}

function Tree({ position, scale = 1, color = "#59bb86", phase = 0, reduceMotion }: { position: [number, number, number]; scale?: number; color?: string; phase?: number; reduceMotion: boolean }) {
  const treeRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const tree = treeRef.current;
    if (!tree) return;

    tree.rotation.z = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.72 + phase) * 0.035;
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.5, 6]} />
        <meshStandardMaterial color="#9b684a" flatShading />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <icosahedronGeometry args={[0.31, 1]} />
        <meshStandardMaterial color={color} flatShading roughness={0.82} />
      </mesh>
      <mesh position={[0.15, 0.48, 0.08]} castShadow>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color="#82d492" flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}

function Cottage() {
  return (
    <group position={[-0.66, 0.34, -0.1]} scale={0.47}>
      <mesh castShadow>
        <boxGeometry args={[0.68, 0.54, 0.56]} />
        <meshStandardMaterial color="#fff0bd" flatShading roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.37, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.57, 0.48, 4]} />
        <meshStandardMaterial color="#f08070" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0.13, -0.1, 0.29]}>
        <boxGeometry args={[0.15, 0.31, 0.035]} />
        <meshStandardMaterial color="#bb8254" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, 0.04, 0.29]}>
        <boxGeometry args={[0.12, 0.14, 0.035]} />
        <meshStandardMaterial color="#86c9e7" roughness={0.45} />
      </mesh>
    </group>
  );
}

function LittleFriend({ reduceMotion }: { reduceMotion: boolean }) {
  const friendRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const friend = friendRef.current;
    if (!friend) return;

    if (reduceMotion) {
      friend.position.y = 0.5;
      friend.rotation.z = 0;
      return;
    }

    friend.position.y = 0.5 + Math.sin(clock.elapsedTime * 1.1) * 0.018;
    friend.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.018;
  });

  return (
    <group ref={friendRef} position={[0.15, 0.5, 0.38]}>
      <mesh position={[0, 0.2, 0]} scale={[0.27, 0.31, 0.24]} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#ffac72" roughness={0.56} />
      </mesh>
      <mesh position={[-0.09, 0.25, 0.205]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#314463" roughness={0.5} />
      </mesh>
      <mesh position={[0.09, 0.25, 0.205]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#314463" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.12, 0.215]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e98268" roughness={0.7} />
      </mesh>
      <mesh position={[-0.12, -0.09, 0.02]} rotation={[0, 0, -0.18]} castShadow>
        <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
        <meshStandardMaterial color="#f08d66" roughness={0.68} />
      </mesh>
      <mesh position={[0.12, -0.09, 0.02]} rotation={[0, 0, 0.18]} castShadow>
        <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
        <meshStandardMaterial color="#f08d66" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[0.2, 0, -0.32]}>
        <coneGeometry args={[0.09, 0.26, 5]} />
        <meshStandardMaterial color="#61c895" flatShading />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.19, 0, 0]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[0.08, 0.08, 0]}>
        <sphereGeometry args={[0.31, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[0.34, -0.01, 0]}>
        <sphereGeometry args={[0.21, 12, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
}

function DriftingCloud({
  cloudRef,
  position,
  scale = 1,
  phase = 0,
  speed = 0.14,
  reduceMotion,
}: {
  cloudRef: NullableRef<Group>;
  position: [number, number, number];
  scale?: number;
  phase?: number;
  speed?: number;
  reduceMotion: boolean;
}) {
  useFrame(({ clock }) => {
    const cloud = cloudRef.current;
    if (!cloud) return;

    if (reduceMotion) {
      cloud.position.set(...position);
      cloud.rotation.z = 0;
      return;
    }

    const time = clock.elapsedTime * speed + phase;
    cloud.position.x = position[0] + Math.sin(time) * 0.07;
    cloud.position.y = position[1] + Math.sin(time * 1.35) * 0.025;
    cloud.rotation.z = Math.sin(time) * 0.018;
  });

  return (
    <group ref={cloudRef} position={position}>
      <Cloud position={[0, 0, 0]} scale={scale} />
    </group>
  );
}

function Pebble({ position, color = "#dbbd9a" }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} scale={[0.12, 0.055, 0.1]} rotation={[0, 0.3, -0.2]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} flatShading roughness={1} />
    </mesh>
  );
}

function FloatingIsland({
  reduceMotion,
  starAnchorRef,
  hidingAnchorRef,
}: {
  reduceMotion: boolean;
  starAnchorRef: NullableRef<Group>;
  hidingAnchorRef: NullableRef<Group>;
}) {
  const islandRef = useRef<Group>(null);
  const goldOrbitRef = useRef<Group>(null);
  const whiteOrbitRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const island = islandRef.current;
    const goldOrbit = goldOrbitRef.current;
    const whiteOrbit = whiteOrbitRef.current;
    const time = clock.elapsedTime;

    if (island) {
      if (reduceMotion) {
        island.position.y = 0;
        island.rotation.y = -0.28;
      } else {
        island.position.y = Math.sin(time * 0.82) * 0.045;
        island.rotation.y += delta * 0.09;
      }
    }

    if (goldOrbit) goldOrbit.rotation.z = reduceMotion ? -0.08 : -0.08 + time * 0.12;
    if (whiteOrbit) whiteOrbit.rotation.z = reduceMotion ? 0.14 : 0.14 - time * 0.1;
  });

  return (
    <group ref={islandRef} rotation={[-0.08, -0.28, -0.04]}>
      <mesh position={[0, -0.34, 0]} scale={[1.17, 0.59, 0.99]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#9c745c" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 0.95, 0.36, 10]} />
        <meshStandardMaterial color="#85ca85" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <cylinderGeometry args={[1.24, 1.24, 0.09, 10]} />
        <meshStandardMaterial color="#70bd78" flatShading roughness={1} />
      </mesh>

      <Cottage />
      <Tree position={[-0.96, 0.03, -0.08]} scale={0.8} color="#78ce91" phase={0.3} reduceMotion={reduceMotion} />
      <Tree position={[0.87, 0.04, -0.13]} scale={0.92} color="#46ad82" phase={1.5} reduceMotion={reduceMotion} />
      <Tree position={[0.9, 0.03, 0.5]} scale={0.62} color="#83d390" phase={2.6} reduceMotion={reduceMotion} />
      <LittleFriend reduceMotion={reduceMotion} />

      <Pebble position={[-0.47, 0.09, 0.59]} color="#f4d389" />
      <Pebble position={[-0.23, 0.094, 0.73]} color="#ead09c" />
      <Pebble position={[0.03, 0.096, 0.79]} color="#f4d389" />
      <Pebble position={[0.31, 0.094, 0.74]} color="#ead09c" />
      <Pebble position={[0.55, 0.09, 0.61]} color="#f4d389" />
      <mesh position={[0.93, -0.22, 0.36]} rotation={[0, 0, 0.22]}>
        <coneGeometry args={[0.12, 0.52, 5]} />
        <meshStandardMaterial color="#71cae3" flatShading roughness={0.35} />
      </mesh>
      <group ref={starAnchorRef} position={[0.58, 0.46, 0.83]} />
      <group ref={hidingAnchorRef} position={[0, -0.34, -0.35]} />

      <group ref={goldOrbitRef} position={[0, 0.08, 0]} rotation={[1.2, 0, -0.08]}>
        <mesh>
          <torusGeometry args={[1.66, 0.014, 8, 96]} />
          <meshBasicMaterial color="#ffe36b" transparent opacity={0.94} toneMapped={false} />
        </mesh>
      </group>
      <group ref={whiteOrbitRef} position={[0, 0.08, 0]} rotation={[1.2, 0, 0.14]}>
        <mesh>
          <torusGeometry args={[1.48, 0.01, 8, 96]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.86} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function FloatingDetails({
  reduceMotion,
  leftCloudRef,
  rightCloudRef,
}: {
  reduceMotion: boolean;
  leftCloudRef: NullableRef<Group>;
  rightCloudRef: NullableRef<Group>;
}) {
  return (
    <>
      <DriftingCloud cloudRef={leftCloudRef} position={[-1.7, -0.2, -0.35]} scale={0.82} phase={0.4} speed={0.13} reduceMotion={reduceMotion} />
      <DriftingCloud cloudRef={rightCloudRef} position={[1.72, 0.46, -0.45]} scale={0.66} phase={2.1} speed={0.17} reduceMotion={reduceMotion} />
      <mesh position={[-1.04, 1.25, -0.1]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#ffd15e" emissive="#ffb83d" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[1.3, 1.03, -0.25]} rotation={[0, 0, 0.2]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#ff9f8c" emissive="#ff8b77" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.95, -0.98, 0.25]} rotation={[0, 0, 0.3]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#a18bf2" emissive="#927bf0" emissiveIntensity={0.18} />
      </mesh>
    </>
  );
}

function useThiefTexture(): CanvasTexture | null {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 432;
    canvas.height = 448;
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    let isDisposed = false;
    let loadedTexture: CanvasTexture | null = null;
    image.onload = () => {
      if (isDisposed) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      loadedTexture = new CanvasTexture(canvas);
      loadedTexture.colorSpace = SRGBColorSpace;
      loadedTexture.minFilter = LinearFilter;
      loadedTexture.magFilter = LinearFilter;
      loadedTexture.needsUpdate = true;
      setTexture(loadedTexture);
    };
    image.src = ACTOR_SVG_DATA_URL;

    return () => {
      isDisposed = true;
      image.onload = null;
      image.onerror = null;
      loadedTexture?.dispose();
    };
  }, []);

  return texture;
}

function StarThiefScene({
  phase,
  cycle,
  isSmallScreen,
  reduceMotion,
  starPosition,
  texture,
  stageRef,
  leftCloudRef,
  rightCloudRef,
  starAnchorRef,
  hidingAnchorRef,
}: {
  phase: HideAndSeekPhase;
  cycle: number;
  isSmallScreen: boolean;
  reduceMotion: boolean;
  starPosition: StarPosition;
  texture: CanvasTexture | null;
  stageRef: NullableRef<HTMLDivElement>;
  leftCloudRef: NullableRef<Group>;
  rightCloudRef: NullableRef<Group>;
  starAnchorRef: NullableRef<Group>;
  hidingAnchorRef: NullableRef<Group>;
}) {
  const actorRef = useRef<Sprite>(null);
  const phaseKeyRef = useRef("");
  const phaseStartTimeRef = useRef(0);
  const lastCarryPositionRef = useRef(new Vector3());
  const cloudTargetsRef = useRef<Object3D[]>([]);
  const raycasterRef = useRef(new Raycaster());
  const scratch = useRef({
    left: new Vector3(),
    right: new Vector3(),
    home: new Vector3(),
    start: new Vector3(),
    end: new Vector3(),
    controlA: new Vector3(),
    controlB: new Vector3(),
    hand: new Vector3(),
    starWorld: new Vector3(),
    rightAxis: new Vector3(),
    upAxis: new Vector3(),
    forwardAxis: new Vector3(),
    projected: new Vector3(),
    ndc: new Vector2(),
  }).current;
  const actorStartRef = useRef(new Vector3());
  const { camera, size } = useThree();

  useFrame(({ clock }) => {
    const actor = actorRef.current;
    const stage = stageRef.current;
    const anchor = starAnchorRef.current;
    if (!actor || !stage || !anchor) return;

    const leftCloud = leftCloudRef.current;
    const rightCloud = rightCloudRef.current;
    if (leftCloud) leftCloud.getWorldPosition(scratch.left);
    if (rightCloud) rightCloud.getWorldPosition(scratch.right);
    anchor.getWorldPosition(scratch.home);
    scratch.rightAxis.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    scratch.upAxis.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    camera.getWorldDirection(scratch.forwardAxis);
    // Move the sprite deeper than the cloud so the cloud's depth-tested
    // geometry can cover it when it ducks behind the puff.
    const cloudDepthOffset = 0.22;

    const phaseKey = `${cycle}:${phase}`;
    if (phaseKeyRef.current !== phaseKey) {
      phaseKeyRef.current = phaseKey;
      phaseStartTimeRef.current = clock.elapsedTime;
      if (phase === "peeking-left") {
        actor.position.copy(scratch.left).addScaledVector(scratch.forwardAxis, cloudDepthOffset).addScaledVector(scratch.upAxis, -0.5);
      } else if (phase === "peeking-right") {
        actor.position.copy(scratch.right).addScaledVector(scratch.forwardAxis, cloudDepthOffset).addScaledVector(scratch.upAxis, -0.5);
      }
      actorStartRef.current.copy(actor.position);
    }

    const duration = (phase === "waiting" ? 1 : HEIST_PHASE_DURATIONS[phase]) / 1000;
    const progress = smoothStep((clock.elapsedTime - phaseStartTimeRef.current) / duration);
    const starIsMoving = starPosition !== "home";
    const isActorVisible = phase === "peeking-left"
      || phase === "hiding-left"
      || phase === "peeking-right"
      || phase === "hiding-right"
      || phase === "sneaking-in"
      || phase === "taking-star"
      || phase === "escaping"
      || phase === "hiding-island";
    actor.visible = Boolean(texture) && !reduceMotion && isActorVisible;
    actor.scale.set(isSmallScreen ? -0.72 : -0.86, isSmallScreen ? 0.75 : 0.9, 1);

    if (phase === "peeking-left" || phase === "hiding-left") {
      const from = scratch.start.copy(scratch.left)
        .addScaledVector(scratch.forwardAxis, cloudDepthOffset)
        .addScaledVector(scratch.upAxis, phase === "peeking-left" ? -0.5 : 0.25);
      const to = scratch.end.copy(scratch.left)
        .addScaledVector(scratch.forwardAxis, cloudDepthOffset)
        .addScaledVector(scratch.upAxis, phase === "peeking-left" ? 0.25 : -0.5);
      actor.position.lerpVectors(from, to, progress);
    } else if (phase === "peeking-right" || phase === "hiding-right") {
      const from = scratch.start.copy(scratch.right)
        .addScaledVector(scratch.forwardAxis, cloudDepthOffset)
        .addScaledVector(scratch.upAxis, phase === "peeking-right" ? -0.48 : 0.24);
      const to = scratch.end.copy(scratch.right)
        .addScaledVector(scratch.forwardAxis, cloudDepthOffset)
        .addScaledVector(scratch.upAxis, phase === "peeking-right" ? 0.24 : -0.48);
      actor.position.lerpVectors(from, to, progress);
    } else if (phase === "sneaking-in") {
      scratch.start.copy(actorStartRef.current);
      scratch.end.copy(scratch.home)
        .addScaledVector(scratch.rightAxis, 0.35)
        .addScaledVector(scratch.upAxis, -0.16);
      scratch.controlA.copy(scratch.start).addScaledVector(scratch.upAxis, 0.65).addScaledVector(scratch.rightAxis, -0.3);
      scratch.controlB.copy(scratch.end).addScaledVector(scratch.upAxis, 0.52).addScaledVector(scratch.rightAxis, 0.36);
      cubicBezier(scratch.start, scratch.controlA, scratch.controlB, scratch.end, progress, actor.position);
    } else if (phase === "taking-star") {
      actor.position.copy(scratch.home)
        .addScaledVector(scratch.rightAxis, 0.35)
        .addScaledVector(scratch.upAxis, -0.16);
      actor.position.y += Math.sin(progress * Math.PI) * 0.025;
    } else if (phase === "escaping") {
      scratch.start.copy(actorStartRef.current);
      scratch.end.copy(scratch.left)
        .addScaledVector(scratch.forwardAxis, cloudDepthOffset)
        .addScaledVector(scratch.upAxis, -0.5);
      scratch.controlA.copy(scratch.start).addScaledVector(scratch.upAxis, 0.72).addScaledVector(scratch.rightAxis, -0.25);
      scratch.controlB.copy(scratch.end).addScaledVector(scratch.upAxis, 0.68);
      cubicBezier(scratch.start, scratch.controlA, scratch.controlB, scratch.end, progress, actor.position);
    } else if (phase === "hiding-island") {
      scratch.start.copy(actorStartRef.current);
      hidingAnchorRef.current?.getWorldPosition(scratch.end);
      scratch.controlA.copy(scratch.start)
        .addScaledVector(scratch.upAxis, 0.64)
        .addScaledVector(scratch.rightAxis, 0.2);
      scratch.controlB.copy(scratch.end)
        .addScaledVector(scratch.upAxis, 0.34)
        .addScaledVector(scratch.rightAxis, 0.36);
      cubicBezier(scratch.start, scratch.controlA, scratch.controlB, scratch.end, progress, actor.position);
    }

    actor.material.rotation = Math.sin(progress * Math.PI) * 0.06;
    scratch.hand.copy(actor.position)
      .addScaledVector(scratch.rightAxis, -0.35)
      .addScaledVector(scratch.upAxis, 0.16);
    if (phase === "escaping") lastCarryPositionRef.current.copy(scratch.hand);

    let starWorldPosition = scratch.home;
    if (starPosition === "taking") starWorldPosition = scratch.starWorld.lerpVectors(scratch.home, scratch.hand, progress);
    if (starPosition === "carried") starWorldPosition = scratch.hand;
    if (starPosition === "hidden") starWorldPosition = lastCarryPositionRef.current;
    if (starPosition === "returning") {
      starWorldPosition = scratch.starWorld.lerpVectors(lastCarryPositionRef.current, scratch.home, progress);
    }

    if (starPosition === "hidden") {
      stage.style.visibility = "hidden";
      stage.style.opacity = "0";
      return;
    }

    scratch.projected.copy(starWorldPosition).project(camera);
    const screenX = (scratch.projected.x + 1) * 0.5 * size.width;
    const screenY = (1 - scratch.projected.y) * 0.5 * size.height;
    stage.style.transform = `translate3d(${screenX - 24}px, ${screenY - 24}px, 0)`;
    stage.style.visibility = "visible";

    let isOccluded = false;
    if (starIsMoving && leftCloud && rightCloud) {
      scratch.ndc.set((screenX / size.width) * 2 - 1, 1 - (screenY / size.height) * 2);
      raycasterRef.current.setFromCamera(scratch.ndc, camera);
      cloudTargetsRef.current[0] = leftCloud;
      cloudTargetsRef.current[1] = rightCloud;
      const intersections = raycasterRef.current.intersectObjects(cloudTargetsRef.current, true);
      isOccluded = Boolean(intersections[0] && intersections[0].distance < camera.position.distanceTo(starWorldPosition) - 0.08);
    }
    stage.style.opacity = isOccluded ? "0" : "1";
  });

  return (
    <>
      <sprite ref={actorRef} visible={false}>
        <spriteMaterial
          map={texture ?? undefined}
          transparent
          alphaTest={0.02}
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </>
  );
}

function AdventureTip({
  stageRef,
  cycle,
  starPosition,
  reduceMotion,
}: {
  stageRef: NullableRef<HTMLDivElement>;
  cycle: number;
  starPosition: StarPosition;
  reduceMotion: boolean;
}) {
  const [tipState, setTipState] = useState({ cycle: -1, open: false, closing: false });
  const isHome = starPosition === "home";
  const isCurrentCycle = tipState.cycle === cycle;
  const showTip = isHome && isCurrentCycle && tipState.open;
  const isTipClosing = isHome && isCurrentCycle && tipState.closing;
  const isTipMounted = showTip || isTipClosing;

  function closeTip() {
    if (!showTip) return;
    setTipState({ cycle, open: false, closing: !reduceMotion });
  }

  function openTip() {
    setTipState({ cycle, open: true, closing: false });
  }

  return (
    <div
      ref={stageRef}
      className={`adventure-tip-stage absolute left-0 top-0 z-10 ${isHome ? "" : "is-away"} ${starPosition === "returning" ? "is-returning" : ""}`}
    >
      <button
        type="button"
        aria-label={showTip ? "Adventure tip" : "Show an adventure tip"}
        aria-expanded={showTip}
        aria-controls={isTipMounted ? "adventure-tip" : undefined}
        aria-hidden={!isHome}
        disabled={!isHome}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") openTip();
        }}
        onPointerLeave={closeTip}
        onFocus={openTip}
        onBlur={closeTip}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeTip();
            event.currentTarget.blur();
          }
        }}
        onClick={openTip}
        className="adventure-tip-button flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-yellow-300 text-indigo-950 shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="adventure-tip-star-glyph h-7 w-7 fill-current">
          <path d="m12 1.8 2.8 6.1 6.7.8-5 4.5 1.4 6.6-5.9-3.3-5.9 3.3 1.4-6.6-5-4.5 6.7-.8L12 1.8Z" />
        </svg>
      </button>
      {isTipMounted && isHome && (
        <div
          id="adventure-tip"
          role="status"
          aria-live="polite"
          onAnimationEnd={(event) => {
            if (isTipClosing && event.target === event.currentTarget) {
              setTipState({ cycle, open: false, closing: false });
            }
          }}
          className={`adventure-tip-panel absolute left-1/2 top-full z-10 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-indigo-100 bg-white p-3 text-left text-indigo-950 shadow-xl ${isTipClosing ? "is-closing" : "is-open"}`}
        >
          <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-600">Little tip</p>
          <p className="mt-1 text-sm font-semibold leading-5">A few minutes of practice can help your typing feel easier.</p>
        </div>
      )}
    </div>
  );
}

function PlanetCanvasFallback({ onUnavailable }: { onUnavailable: () => void }) {
  useEffect(() => {
    onUnavailable();
  }, [onUnavailable]);

  return (
    <div className="planet-loading">
      <span className="planet-loading-island" aria-hidden="true">✦</span>
      <span>Your 3D world is not available here.</span>
    </div>
  );
}

export default function Planet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCloudRef = useRef<Group>(null);
  const rightCloudRef = useRef<Group>(null);
  const starAnchorRef = useRef<Group>(null);
  const hidingAnchorRef = useRef<Group>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  const { phase, cycle, starPosition, reduceMotion, isSmallScreen } = useHideAndSeek();
  const thiefTexture = useThiefTexture();
  const markCanvasUnavailable = useCallback(() => setCanvasUnavailable(true), []);

  useEffect(() => {
    const container = containerRef.current;
    const observer = container && "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "120px" })
      : null;
    observer?.observe(container!);

    return () => {
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[350px] w-full sm:h-[410px]">
      <Canvas
        aria-label={canvasUnavailable ? "The 3D island could not load" : "A tiny floating island with a cottage, trees, and a friendly character"}
        role={canvasUnavailable ? "status" : "img"}
        camera={{ position: [0, 1.8, 5.6], fov: 38 }}
        dpr={isSmallScreen ? 1 : [1, 1.4]}
        frameloop={isVisible ? (reduceMotion ? "demand" : "always") : "never"}
        shadows={!isSmallScreen}
        gl={{ antialias: true, powerPreference: "low-power" }}
        fallback={<PlanetCanvasFallback onUnavailable={markCanvasUnavailable} />}
      >
        <ResponsiveCamera />
        <ambientLight intensity={1.65} color="#eef9ff" />
        <directionalLight position={[-3, 5, 4]} color="#fff0c7" intensity={2.1} castShadow />
        <directionalLight position={[4, 2, -3]} color="#bcecf0" intensity={0.9} />
        <FloatingDetails reduceMotion={reduceMotion} leftCloudRef={leftCloudRef} rightCloudRef={rightCloudRef} />
        <FloatingIsland reduceMotion={reduceMotion} starAnchorRef={starAnchorRef} hidingAnchorRef={hidingAnchorRef} />
        <StarThiefScene
          phase={phase}
          cycle={cycle}
          isSmallScreen={isSmallScreen}
          reduceMotion={reduceMotion}
          starPosition={starPosition}
          texture={thiefTexture}
          stageRef={stageRef}
          leftCloudRef={leftCloudRef}
          rightCloudRef={rightCloudRef}
          starAnchorRef={starAnchorRef}
          hidingAnchorRef={hidingAnchorRef}
        />
        <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} minPolarAngle={1.15} maxPolarAngle={1.8} />
      </Canvas>
      {!canvasUnavailable && (
        <AdventureTip stageRef={stageRef} cycle={cycle} starPosition={starPosition} reduceMotion={reduceMotion} />
      )}
    </div>
  );
}
