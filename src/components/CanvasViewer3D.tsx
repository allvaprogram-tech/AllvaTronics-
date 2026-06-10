import React, { useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { HighQualityMesh } from "./Meshes3D";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  Grid,
  Html,
 } from "@react-three/drei";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { useEditor } from "../store";
import { Point } from "../types";
import { simulateDC } from "../lib/simulator";
import { pinMap } from "../lib/pinmap";
import { getResistorColors } from "./Symbols";
import { BuzzerAudio } from "../lib/BuzzerAudio";

function CurvedWire({ pts, isAlive, baseColor, cyb }: { pts: Point[], isAlive: boolean, baseColor: string, cyb: number }) {
  const curvePts = useMemo(() => {
    const cp = [];
    const raise = 4; // Height of the wire curve
    for (let i = 0; i < pts.length; i++) {
        const x = Number(pts[i].x);
        const z = Number(pts[i].y);
        let y = cyb;
        if (i > 0 && i < pts.length - 1) {
            y += raise * 2;
        } else if (pts.length === 2 && i === 0) {
            cp.push(new THREE.Vector3(x, y + 2.5, z));
            cp.push(new THREE.Vector3(x, y + raise + 1, z));
            continue;
        } else if (pts.length === 2 && i === 1) {
            cp.push(new THREE.Vector3(x, y + raise + 1, z));
            cp.push(new THREE.Vector3(x, y + 2.5, z));
            continue;
        }
        cp.push(new THREE.Vector3(x, y, z));
    }
    return cp;
  }, [pts, cyb]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(curvePts, false, 'catmullrom', 0.5), [curvePts]);
  const mainWireProps = useMemo(() => ({
    color: isAlive ? "#ffeb3b" : baseColor,
    emissive: isAlive ? "#ffeb3b" : "#000000",
    emissiveIntensity: isAlive ? 2 : 0,
    roughness: 0.4,
    metalness: 0.3,
    clearcoat: 0.8,
  }), [isAlive, baseColor]);

  const shrinkTubeProps = { color: "#000000", roughness: 0.9 };
  const plugProps = { color: "#1e293b", roughness: 0.7 };
  const pinProps = { color: "#94a3b8", metalness: 0.9, roughness: 0.3 };
  const sPts = pts;

  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 32, 0.8, 8, false]} />
        <meshStandardMaterial {...mainWireProps} />
      </mesh>
      
      {/* Start Connection */}
      <group position={[Number(sPts[0].x), cyb + 2, Number(sPts[0].y)]}>
        <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.9, 0.9, 2, 12]} /><meshStandardMaterial {...shrinkTubeProps} /></mesh>
        <mesh position={[0, -2.5, 0]} castShadow><boxGeometry args={[2.5, 5.0, 2.5]} /><meshStandardMaterial {...plugProps} /></mesh>
        <mesh position={[0, -4.5, 0]} castShadow><cylinderGeometry args={[0.5, 0.5, 1, 8]} /><meshStandardMaterial {...pinProps} /></mesh>
        <mesh position={[0, -6, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 3, 8]} /><meshStandardMaterial {...pinProps} /></mesh>
      </group>

      {/* End Connection */}
      <group position={[Number(sPts[sPts.length-1].x), cyb + 2, Number(sPts[sPts.length-1].y)]}>
        <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.9, 0.9, 2, 12]} /><meshStandardMaterial {...shrinkTubeProps} /></mesh>
        <mesh position={[0, -2.5, 0]} castShadow><boxGeometry args={[2.5, 5.0, 2.5]} /><meshStandardMaterial {...plugProps} /></mesh>
        <mesh position={[0, -4.5, 0]} castShadow><cylinderGeometry args={[0.5, 0.5, 1, 8]} /><meshStandardMaterial {...pinProps} /></mesh>
        <mesh position={[0, -6, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 3, 8]} /><meshStandardMaterial {...pinProps} /></mesh>
      </group>
    </group>
  );
}

function getCapacitorCode(value: string | undefined): string {
  if (!value) return "104";
  const match = value.match(/^([\d.]+)\s*(p|n|u|m)?(?:[fF])?$/);
  if (!match) return value;

  let val = parseFloat(match[1]);
  const multStr = match[2];

  let multiplier = 1; // pf
  if (multStr === "n") multiplier = 1000;
  if (multStr === "u") multiplier = 1000000;
  if (multStr === "m") multiplier = 1000000000;

  let pf = val * multiplier;
  if (pf < 100) return Math.floor(pf).toString(); // e.g., 22 -> 22

  // Need to represent as two digits and a multiplier
  let exp = 0;
  while (pf >= 100) {
    pf /= 10;
    exp++;
  }

  const digit12 = Math.floor(pf);
  return `${digit12}${exp}`;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Canvas Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070709] text-gray-400">
          <p className="mb-4">Ocorreu um erro no renderizador 3D.</p>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
            onClick={() => this.setState({ hasError: false })}
          >
            Recarregar 3D
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CanvasViewer3D() {
  const { elements, pcbElements, isSimulating, mode } = useEditor();

  const [simTime, setSimTime] = useState(0);

  useEffect(() => {
    let frameId: number;
    let startTime = performance.now() - simTime * 1000;
    const loop = (time: number) => {
      setSimTime((time - startTime) / 1000);
      frameId = requestAnimationFrame(loop);
    };
    if (isSimulating) {
      startTime = performance.now() - simTime * 1000;
      frameId = requestAnimationFrame(loop);
    } else {
      setSimTime(0);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isSimulating]);

  const circuitState = useMemo(() => {
    if (!isSimulating)
      return {
        active: new Set<string>(),
        hasShortCircuit: false,
        readings: {} as Record<string, string>,
        pointVoltages: {} as Record<string, number>,
      };
    return simulateDC(elements, pinMap, simTime);
  }, [elements, isSimulating, simTime]);

  const boardShape = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    pcbElements.forEach((el) => {
      if (
        el.type === "pcb_component" ||
        el.type === "trace" ||
        el.type === "board"
      ) {
        if ((el as any).points) {
          (el as any).points.forEach((p: Point) => {
            minX = Math.min(minX, Number(p.x) || 0);
            minY = Math.min(minY, Number(p.y) || 0);
            maxX = Math.max(maxX, Number(p.x) || 0);
            maxY = Math.max(maxY, Number(p.y) || 0);
          });
        } else if ((el as any).x !== undefined) {
          minX = Math.min(minX, Number((el as any).x) || 0);
          minY = Math.min(minY, Number((el as any).y) || 0);
          maxX = Math.max(maxX, Number((el as any).x) || 0);
          maxY = Math.max(maxY, Number((el as any).y) || 0);
        }
      }
    });

    const boardEl = pcbElements.find((el) => el.type === "board") as any;
    if (boardEl) {
      return {
        width: Math.max(Number(boardEl.width) || 200, 200),
        height: Math.max(Number(boardEl.height) || 200, 200),
        center: {
          x: (Number(boardEl.x) || 0) + (Number(boardEl.width) || 200) / 2,
          y: (Number(boardEl.y) || 0) + (Number(boardEl.height) || 200) / 2,
        },
      };
    }

    if (minX === Infinity)
      return { width: 500, height: 500, center: { x: 0, y: 0 } };
    return {
      width: Math.max(200, maxX - minX + 100),
      height: Math.max(200, maxY - minY + 100),
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    };
  }, [pcbElements]);

  const schematicShape = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    elements.forEach((el) => {
      if (el.type === "component") {
        minX = Math.min(minX, (Number(el.x) || 0) - 50);
        minY = Math.min(minY, (Number(el.y) || 0) - 50);
        maxX = Math.max(maxX, (Number(el.x) || 0) + 50);
        maxY = Math.max(maxY, (Number(el.y) || 0) + 50);
      } else if (el.type === "wire") {
        (el as any).points.forEach((p: Point) => {
          minX = Math.min(minX, Number(p.x) || 0);
          minY = Math.min(minY, Number(p.y) || 0);
          maxX = Math.max(maxX, Number(p.x) || 0);
          maxY = Math.max(maxY, Number(p.y) || 0);
        });
      }
    });
    if (minX === Infinity)
      return { width: 1000, height: 1000, center: { x: 0, y: 0 } };
    return {
      width: Math.max(1000, maxX - minX + 400),
      height: Math.max(1000, maxY - minY + 400),
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    };
  }, [elements]);

  return (
    <div className="w-full h-full bg-[#16161a] m-0 p-0 overflow-hidden outline-none relative">
      {/* Audio Engine */}
      {elements
        .filter((el) => el.type === "component" && (el as any).componentType === "buzzer")
        .map((buzzer) => (
          <BuzzerAudio key={buzzer.id} isAlive={isSimulating && circuitState.active.has(buzzer.id)} />
        ))}
        
      {/* Overlay controls could go here */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none text-white/50 text-xs font-mono uppercase tracking-wider font-bold shadow-sm">
        3D Visualizer Engine
      </div>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 250, 400], fov: 35, near: 1, far: 50000 }}
          shadows
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
          <color attach="background" args={["#0b0d10"]} />

          {/* Studio Lighting */}
          <Environment
            preset="studio"
            environmentIntensity={mode === "schematic" ? 0.3 : 0.9}
          />

          <ambientLight
            intensity={mode === "schematic" ? 0.1 : 0.4}
            color="#ffffff"
          />
          <directionalLight
            position={[200, 400, 200]}
            intensity={mode === "schematic" ? 0.4 : 1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0005}
          >
            <orthographicCamera
              attach="shadow-camera"
              args={[-3000, 3000, 3000, -3000]}
              near={-1000}
              far={10000}
            />
          </directionalLight>
          <directionalLight
            position={[-200, 300, -200]}
            intensity={0.5}
            color="#e0f2fe"
          />
          <pointLight position={[0, -200, 0]} intensity={0.4} color="#ffffff" />

          {isSimulating && circuitState.hasShortCircuit && (
            <pointLight color="red" intensity={8} position={[0, 100, 0]} />
          )}

          <Grid
            position={[schematicShape.center.x, -2, schematicShape.center.y]}
            args={[schematicShape.width * 2, schematicShape.height * 2]}
            cellSize={10}
            cellThickness={1}
            cellColor="#1a1a24"
            sectionSize={50}
            sectionThickness={1.5}
            sectionColor="#2d2d3d"
            fadeDistance={900}
            fadeStrength={1.5}
            visible={mode === "schematic"}
          />

          {/* --- SCHEMATIC VIEW AREA --- */}
          {mode === "schematic" && (
            <group
              position={[-schematicShape.center.x, 0, -schematicShape.center.y]}
            >
              <mesh
                receiveShadow
                position={[
                  schematicShape.center.x,
                  -2,
                  schematicShape.center.y,
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry
                  args={[schematicShape.width, schematicShape.height]}
                />
                <meshStandardMaterial
                  color="#0f0f13"
                  roughness={0.9}
                  metalness={0.1}
                />
              </mesh>

              {elements.map((el) => {
                if (el.type === "wire") {
                  const pts = el.points as Point[];
                  return (
                    <group key={el.id} position={[0, 0, 0]}>
                      {(() => {
                        const midX = (Number(pts[0].x) + Number(pts[pts.length - 1].x)) / 2;
                        const midZ = (Number(pts[0].y) + Number(pts[pts.length - 1].y)) / 2;
                        let cyb = 0;
                        const board = elements.find((b) => {
                          if (b.type !== "component") return false;
                          const bt = (b as any).componentType;
                          if (
                            ![
                              "protoboard",
                              "arduino_uno",
                              "raspberry_pi",
                              "esp32",
                              "esp32_cam",
                            ].includes(bt)
                          )
                            return false;
                          const dx2 = midX - (Number((b as any).x) || 0);
                          const dz2 = midZ - (Number((b as any).y) || 0);
                          return (
                            (bt === "protoboard" &&
                              dx2 > -180 && dx2 < 180 && dz2 > -100 && dz2 < 100) ||
                            (bt === "arduino_uno" &&
                              dx2 > -100 && dx2 < 250 && dz2 > -100 && dz2 < 250) ||
                            (bt === "raspberry_pi" &&
                              dx2 > -150 && dx2 < 300 && dz2 > -100 && dz2 < 250) ||
                            ((bt === "esp32" || bt === "esp32_cam") &&
                              dx2 > -100 && dx2 < 150 && dz2 > -100 && dz2 < 250)
                          );
                        });
                        if (board) {
                          const bt = (board as any).componentType;
                          if (bt === 'protoboard') cyb = 0.2;
                          else if (bt === 'arduino_uno') cyb = 4 * 1.25;
                          else if (bt === 'raspberry_pi') cyb = 4 * 2.27;
                          else if (bt === 'esp32') cyb = 4 * 2.38;
                          else if (bt === 'esp32_cam') cyb = 4 * 2.08;
                          else if (bt === 'oled') cyb = 4 * 1.5;
                          else cyb = 4;
                        }
                        const isAlive = isSimulating && circuitState.active.has(el.id);
                        const baseColor = (el as any).color || "#15803d";
                        
                        return <CurvedWire pts={pts} isAlive={isAlive} baseColor={baseColor} cyb={cyb} />;
                      })()}
                    </group>
                  );
                }
                if (el.type === "component") {
                  const cx = Number((el as any).x) || 0;
                  const cz = Number((el as any).y) || 0;
                  let cy = 0;
                  const cType = (el as any).componentType;
                  const isBg = [
                    "protoboard",
                    "arduino_uno",
                    "raspberry_pi",
                    "esp32",
                    "esp32_cam",
                  ].includes(cType);
                  if (!isBg) {
                    const board = elements.find((b) => {
                      if (b.type !== "component") return false;
                      const bt = (b as any).componentType;
                      if (
                        ![
                          "protoboard",
                          "arduino_uno",
                          "raspberry_pi",
                          "esp32",
                          "esp32_cam",
                        ].includes(bt)
                      )
                        return false;
                      const dx = cx - (Number((b as any).x) || 0);
                      const dz = cz - (Number((b as any).y) || 0);
                      return (
                        (bt === "protoboard" &&
                          dx > -180 && dx < 180 && dz > -100 && dz < 100) ||
                        (bt === "arduino_uno" &&
                          dx > -100 && dx < 250 && dz > -100 && dz < 250) ||
                        (bt === "raspberry_pi" &&
                          dx > -150 && dx < 300 && dz > -100 && dz < 250) ||
                        ((bt === "esp32" || bt === "esp32_cam") &&
                          dx > -100 && dx < 150 && dz > -100 && dz < 250)
                      );
                    });
                    if (board) {
                      const bt = (board as any).componentType;
                      
                      if (bt === 'protoboard') cy = 0.2;
                      else if (bt === 'arduino_uno') cy = 4 * 1.25;
                      else if (bt === 'raspberry_pi') cy = 4 * 2.27;
                      else if (bt === 'esp32') cy = 4 * 2.38;
                      else if (bt === 'esp32_cam') cy = 4 * 2.08;
                      else if (bt === 'oled') cy = 4 * 1.5;
                      else cy = 4;

                    }
                  }
                  const rot =
                    Number((el as any).rotation || 0) * (Math.PI / 180);
                  const isBroken =
                    isSimulating && circuitState.readings[el.id] === "BROKEN!";
                  const isActive =
                    isSimulating && circuitState.active.has(el.id) && !isBroken;
                  const compType = (el as any).componentType;

                  
  let s = 1;
  let sY = 1;
  if(compType === 'arduino_uno') s = 1.25;
  else if(compType === 'raspberry_pi') s = 2.27;
  else if(compType === 'esp32') s = 2.38;
  else if(compType === 'esp32_cam') s = 2.08;
  else if(compType === 'oled') s = 1.5;
  
  if (compType !== 'arduino_uno' && compType !== 'raspberry_pi' && compType !== 'esp32' && compType !== 'esp32_cam' && compType !== 'oled') {
    sY = 1;
  } else {
    sY = s;
  }
  let Component3D = (

                    <HighQualityMesh
                      id={el.id}
                      type={compType}
                      isActive={isActive}
                      isBroken={isBroken}
                      isClosed={compType === "switch" && (el as any).customProps?.closed}
                      customProps={(el as any).customProps}
                      value={(el as any).value}
                    
                    />
                  );

                  return (
                    <group
                      key={el.id}
                      position={[cx, cy, cz]}
                      rotation={[0, -rot, 0]}
                    >
                      <group scale={[s, s, s]}>{Component3D}</group>
                      {isActive && compType === "led" && (
                        <pointLight
                          color={
                            (el as any).customProps?.color?.toLowerCase() === "green" ? "#22c55e" :
                            (el as any).customProps?.color?.toLowerCase() === "blue" ? "#3b82f6" :
                            (el as any).customProps?.color?.toLowerCase() === "yellow" ? "#eab308" :
                            (el as any).customProps?.color?.toLowerCase() === "white" ? "#ffffff" :
                            "#ef4444"
                          }
                          intensity={2}
                          distance={100}
                          position={[25, 10, 0]}
                        />
                      )}
                    </group>
                  );
                }
                return null;
              })}
            </group>
          )}
          {/* --- PCB BOARD AREA --- */}
          {mode === "pcb" && (
            <group>
              {/* PCB Base Platform - Looks like FR4 Material */}
              {/* PCB Base Platform - Smooth rendering, aligned naturally */}
              <group position={[0, -2, 0]}>
                {/* Main Board Body - FR4 Mat - Slightly smaller in X/Z to reveal gold plating at border with no overlap */}
                <mesh receiveShadow castShadow>
                  <boxGeometry
                    args={[boardShape.width, 1.6, boardShape.height]}
                  />
                  {/* 1.6mm thickness */}
                  <meshPhysicalMaterial color="#061c0b" roughness={0.7} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.6} />
                </mesh>
              </group>

              {/* Copper Traces */}
              {pcbElements.map((el) => {
                if (el.type === "trace") {
                  const pts = el.points as Point[];
                  const isTop = el.layer === "top";
                  const traceColor = isTop ? "#d4af37" : "#d4af37"; // Copper or solder color
                  // Offset Y precisely to avoid z-fighting with the board or other traces
                  const stableRandom =
                    ((el.id.charCodeAt(0) || 0) +
                      (el.id.charCodeAt(el.id.length - 1) || 0)) /
                    1000;
                  const yOffset = isTop
                    ? -1.18 + stableRandom
                    : -2.82 - stableRandom;

                  // Better material properties for professional PCB traces (shiny copper/gold or tin)
                  const materialProps = {
                    color: traceColor,
                    metalness: 0.9,
                    roughness: 0.2,
                    clearcoat: 0.5,
                    clearcoatRoughness: 0.2,
                  };

                  return (
                    <group key={el.id} position={[0, 0, 0]}>
                      {pts.map((p, i) => {
                        const width = Number(el.width) || 4;
                        const cx = Number(p.x) - boardShape.center.x;
                        const cz = Number(p.y) - boardShape.center.y;

                        let lineMesh = null;
                        if (i > 0) {
                          const prev = pts[i - 1];
                          const dx = Number(p.x) - Number(prev.x);
                          const dz = Number(p.y) - Number(prev.y);
                          const dist = Math.sqrt(dx * dx + dz * dz) || 0.1;
                          const angle = Math.atan2(dz, dx);
                          const midX =
                            Number(prev.x) + dx / 2 - boardShape.center.x;
                          const midZ =
                            Number(prev.y) + dz / 2 - boardShape.center.y;

                          lineMesh = (
                            <mesh
                              position={[midX, yOffset, midZ]}
                              rotation={[0, -angle, 0]}
                            >
                              <boxGeometry args={[dist, 0.05, width]} />
                              <meshPhysicalMaterial {...materialProps} />
                            </mesh>
                          );
                        }

                        return (
                          <group key={i}>
                            {lineMesh}
                            <mesh position={[cx, yOffset, cz]}>
                              <cylinderGeometry
                                args={[width / 2, width / 2, 0.05, 12]}
                              />
                              <meshPhysicalMaterial {...materialProps} />
                            </mesh>
                          </group>
                        );
                      })}
                    </group>
                  );
                }

                if (el.type === "pcb_component") {
                  const cx = Number(el.x) - boardShape.center.x;
                  const cz = Number(el.y) - boardShape.center.y;
                  const rot = Number(el.rotation || 0) * (Math.PI / 180);

                  const schNode = elements.find(
                    (e) =>
                      e.type === "component" &&
                      (e as any).name === (el as any).name,
                  );
                  const schType = schNode
                    ? (schNode as any).componentType
                    : null;
                  const isBroken = schNode
                    ? isSimulating &&
                      circuitState.readings[schNode.id] === "BROKEN!"
                    : false;
                  const isActive = schNode
                    ? isSimulating &&
                      circuitState.active.has(schNode.id) &&
                      !isBroken
                    : false;

                  const compType = el.componentType;

                  return (
                    <PcbPcbComponentItem
                      key={el.id}
                      cx={cx}
                      cz={cz}
                      rot={rot}
                      layer={el.layer as any}
                      compType={compType as any}
                      schType={schType}
                      isActive={isActive}
                      isBroken={isBroken}
                      el={el}
                    />
                  );
                }
                return null;
              })}
            </group>
          )}

          {/* Global shadows contact floor */}
          <ContactShadows
            resolution={256}
            frames={1}
            position={[0, mode === "pcb" ? -5 : -2.5, 0]}
            opacity={0.6}
            scale={400}
            blur={2}
            far={20}
            color="#000000"
          />
          <EffectComposer multisampling={4}>
            <N8AO halfRes aoRadius={2} intensity={1} color="black" />
            <Bloom luminanceThreshold={1} mipmapBlur luminanceSmoothing={0.5} intensity={1.5} />
          </EffectComposer>
          <OrbitControls
            makeDefault
            minDistance={30}
            maxDistance={1500}
            maxPolarAngle={Math.PI / 2 - 0.05}
            panSpeed={2}
            zoomSpeed={1.5}
            dampingFactor={0.1}
          />
        </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

export function PcbPcbComponentItem({
  cx,
  cz,
  rot,
  layer,
  compType,
  schType,
  isActive,
  isBroken,
  el,
}: any) {
  const groupRef = React.useRef<any>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (isActive && schType === "motor") {
      const time = clock.getElapsedTime();
      const mesh = groupRef.current.getObjectByName("motorShaft");
      if (mesh) mesh.rotation.x = time * 20;
    }
    if (isActive && schType === "buzzer") {
      const t = clock.getElapsedTime();
      groupRef.current.position.x = cx + Math.sin(t * 100) * 0.5;
      groupRef.current.position.z = cz + Math.cos(t * 100) * 0.5;
    } else {
      groupRef.current.position.x = cx;
      groupRef.current.position.z = cz;
    }
  });

  let Component3D = (
    <group>
      {compType === "pad" || compType === "via" ? (
        <HighQualityMesh
          type={compType}
          isActive={isActive}
          isBroken={isBroken}
        />
      ) : null}
      <HighQualityMesh
        id={el.id}
        type={compType === "smd" && schType === "led" ? "smd_led" : compType}
        isActive={isActive}
        isBroken={isBroken}
        value={(el as any).value}
        customProps={(el as any).customProps}
      />
      {compType === "pad" && schType && (
        <group position={[0, 4, 0]}>
          <HighQualityMesh
            id={el.id}
            type={schType}
            isActive={isActive}
            isBroken={isBroken}
            value={(el as any).value}
            customProps={(el as any).customProps}
          />
        </group>
      )}
    </group>
  );

  const absoluteY = layer === "bottom" ? -2.8 : -1.2;
  return (
    <group
      ref={groupRef}
      position={[cx, absoluteY, cz]}
      rotation={[0, -rot, 0]}
      scale={[1, layer === "bottom" ? -1 : 1, 1]}
    >
      {Component3D}
    </group>
  );
}
