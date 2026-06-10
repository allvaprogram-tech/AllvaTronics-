import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Html } from "@react-three/drei";
import { getResistorColors } from "./Symbols";

function OscilloscopeScreen3D({ id, isActive, customProps }: { id?: string, isActive: boolean, customProps?: any }) {
  const [data, setData] = React.useState<{time: number, value: number}[]>([]);
  React.useEffect(() => {
    if (!isActive || !id) return;
    const interval = setInterval(() => {
      const readings = (window as any)._circuitReadings || {};
      const readingStr = readings[id] || "0V";
      const val = parseFloat(readingStr.replace(/[^\d.-]/g, ""));
      const now = Date.now();
      setData(prev => {
        const filtered = prev.filter((p) => now - p.time < 3000);
        return [...filtered, { time: now, value: isNaN(val) ? 0 : val }];
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isActive, id]);

  if (!isActive || !id || data.length < 2) return null;

  const w = 400;
  const h = 260;
  const now = Date.now();
  const scale = customProps?.scale || 20;
  const mapY = (v: number) => h / 2 - (v / scale) * (h / 2);
  const mapX = (t: number) => w - ((now - t) / 3000) * w;
  
  const dPath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.time)} ${mapY(p.value)}`).join(" ");

  const values = data.map(p => p.value);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const vpp = max - min;
  const amp = vpp / 2;

  return (
    <Html transform distanceFactor={1.5} position={[-15, 0, -32.2]} rotation={[0, Math.PI, 0]} scale={0.1}>
       <div style={{ 
         width: 400, 
         height: 260, 
         background: 'rgba(10, 10, 15, 0.9)', 
         border: '2px solid #22c55e',
         position: 'relative', 
         overflow: 'hidden', 
         borderRadius: '4px',
         fontFamily: 'monospace',
         boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
       }}>
          {/* Subtle grid pattern background */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.15) 1px, transparent 1px)',
            backgroundSize: '25px 25px',
            pointerEvents: 'none'
          }} />

          {/* Core Waveform Path */}
          <svg width="400" height="260" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
             {/* Main voltage center reference line */}
             <line x1="0" y1="130" x2="400" y2="130" stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5,5" strokeWidth="1" />
             <path d={dPath} fill="none" stroke="#22c55e" strokeWidth="4" style={{ filter: 'drop-shadow(0px 0px 4px #22c55e)' }} />
          </svg>

          {/* High-visibility Digital Display Text (Oscilloscope Readings / Wave Amplitudes) */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            color: '#22c55e',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 0 2px #22c55e',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '3px',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            <div>CH1 (A0)</div>
            <div style={{ color: '#ffffff' }}>Scale: {scale}V/div</div>
          </div>

          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
            color: '#22c55e',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 0 2px #22c55e',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '3px',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            <div style={{ color: '#fff' }}>AMP: {amp.toFixed(2)}V</div>
            <div>VPP: {vpp.toFixed(2)}V</div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: 'flex',
            gap: 10,
            color: '#22c55e',
            fontSize: '11px',
            fontWeight: 'bold',
            textShadow: '0 0 2px #22c55e',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '3px',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            <div>MAX: {max.toFixed(2)}V</div>
            <div>MIN: {min.toFixed(2)}V</div>
          </div>

          {/* Scanning / Trigger indicator */}
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: '#22c55e',
            fontSize: '11px',
            textShadow: '0 0 2px #22c55e',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '3px',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            TRG: AUTO
          </div>
       </div>
    </Html>
  );
}

function IC_SMD({
  position,
  pins,
  length,
  width,
}: {
  position: [number, number, number];
  pins: number;
  length: number;
  width: number;
}) {
  const pinGap = length / (pins / 2 + 1);
  return (
    <group position={position}>
      <mesh position={[0, Math.max(1, width / 4), 0]} castShadow>
        <boxGeometry args={[length, Math.max(2, width / 2), width]} />
        <meshPhysicalMaterial
          color="#141414"
          roughness={0.7}
          metalness={0.9}
          clearcoat={0.15}
          clearcoatRoughness={0.8}
        />
      </mesh>
      <mesh position={[-length / 2 + 2, Math.max(1.5, width / 4 + 0.5), 0]}>
        <circleGeometry args={[Math.min(1, width / 8), 8]} />
        <meshPhysicalMaterial color="#333" />
      </mesh>
      {Array.from({ length: pins / 2 }).map((_, i) => (
        <group key={"pin" + i}>
          <mesh
            position={[-length / 2 + pinGap * (i + 1), 0, width / 2 + 0.5]}
            castShadow
          >
            <boxGeometry args={[pinGap * 0.4, 0.5, 2]} />
            <meshPhysicalMaterial
              color="#cbd5e1"
              metalness={0.9}
              clearcoat={1}
              clearcoatRoughness={0.1}
              roughness={0.3}
            />
          </mesh>
          <mesh
            position={[-length / 2 + pinGap * (i + 1), 0, -width / 2 - 0.5]}
            castShadow
          >
            <boxGeometry args={[pinGap * 0.4, 0.5, 2]} />
            <meshPhysicalMaterial
              color="#cbd5e1"
              metalness={0.9}
              clearcoat={1}
              clearcoatRoughness={0.1}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Resistor_SMD({ position, rotation = [0, 0, 0] }: any) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshPhysicalMaterial
          color="#111"
          roughness={0.6}
          clearcoat={0.3}
          clearcoatRoughness={0.8}
        />
      </mesh>
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.1, 1.1]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.1, 1.1]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

function Capacitor_SMD({ position, rotation = [0, 0, 0] }: any) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1.2]} />
        <meshPhysicalMaterial color="#cda87a" />
      </mesh>
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.1, 1.3]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.1, 1.3]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

const unoShapeData = new THREE.Shape();
unoShapeData.moveTo(-34, -26);
unoShapeData.lineTo(32, -26);
unoShapeData.lineTo(34.3, -24);
unoShapeData.lineTo(34.3, 10);
unoShapeData.lineTo(32, 12);
unoShapeData.lineTo(32, 26);
unoShapeData.lineTo(-34, 26);
unoShapeData.lineTo(-34, -26);

const rpiShapeData = new THREE.Shape();
(() => {
  const w = 85 / 2;
  const h = 56 / 2;
  const r = 3;
  rpiShapeData.moveTo(-w + r, -h);
  rpiShapeData.lineTo(w - r, -h);
  rpiShapeData.quadraticCurveTo(w, -h, w, -h + r);
  rpiShapeData.lineTo(w, h - r);
  rpiShapeData.quadraticCurveTo(w, h, w - r, h);
  rpiShapeData.lineTo(-w + r, h);
  rpiShapeData.quadraticCurveTo(-w, h, -w, h - r);
  rpiShapeData.lineTo(-w, -h + r);
  rpiShapeData.quadraticCurveTo(-w, -h, -w + r, -h);
})();

const espShapeData = new THREE.Shape();
(() => {
  const w = 28 / 2;
  const h = 54 / 2;
  const r = 1;
  espShapeData.moveTo(-w + r, -h);
  espShapeData.lineTo(w - r, -h);
  espShapeData.quadraticCurveTo(w, -h, w, -h + r);
  espShapeData.lineTo(w, h - r);
  espShapeData.quadraticCurveTo(w, h, w - r, h);
  espShapeData.lineTo(-w + r, h);
  espShapeData.quadraticCurveTo(-w, h, -w, h - r);
  espShapeData.lineTo(-w, -h + r);
  espShapeData.quadraticCurveTo(-w, -h, -w + r, -h);
})();
export function HighQualityMesh({
  id,
  type,
  isActive = false,
  isBroken = false,
  isClosed = false,
  customProps = {},
  value = "",
}: {
  id?: string;
  type: string;
  isActive?: boolean;
  isBroken?: boolean;
  isClosed?: boolean;
  customProps?: any;
  value?: string;
}) {
  const groupRef = React.useRef<any>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (isActive && type === "motor") {
      const mesh = groupRef.current.getObjectByName("motorShaft");
      if (mesh) mesh.rotation.y = clock.getElapsedTime() * 20;
    }
    if (isActive && type === "buzzer") {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 100) * 0.5;
    } else if (type === "buzzer") {
      groupRef.current.position.y = 0;
    }
  });

  const getMeshes = () => {
    switch (type) {
      case "protoboard": {
        const holes: [number, number][] = [];
        for (let i = 0; i < 60 * 10; i++) {
          holes.push([
            -290 + (i % 60) * 10,
            i < 300
              ? -20 - Math.floor(i / 60) * 10
              : 20 + Math.floor((i - 300) / 60) * 10,
          ]);
        }
        for (let i = 0; i < 60 * 4; i++) {
          holes.push([
            -290 + (i % 60) * 10,
            i < 120
              ? -90 + Math.floor(i / 60) * 10
              : 80 + Math.floor((i - 120) / 60) * 10,
          ]);
        }

        return (
          <group position={[0, 0, 0]}>
            {/* Base plastic */}
            <mesh castShadow receiveShadow position={[0, -2, 0]}>
              <boxGeometry args={[620, 6, 210]} />
              <meshPhysicalMaterial
                color="#f8fafc"
                clearcoat={0.3}
                clearcoatRoughness={0.6}
                roughness={0.4}
              />
            </mesh>
            {/* Center groove */}
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[600, 0.4, 18]} />
              <meshPhysicalMaterial color="#e2e8f0" roughness={0.7} />
            </mesh>
            {/* Red and Blue Lines */}
            <mesh position={[0, 1.05, -75]}>
              <boxGeometry args={[610, 0.2, 1.5]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 1.05, -105]}>
              <boxGeometry args={[610, 0.2, 1.5]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[0, 1.05, 75]}>
              <boxGeometry args={[610, 0.2, 1.5]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 1.05, 105]}>
              <boxGeometry args={[610, 0.2, 1.5]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            {/* Holes simulation */}
            <group position={[0, 1.02, 0]}>
              {holes.map((h, i) => (
                <mesh key={i} position={[h[0], 0, h[1]]}>
                  <boxGeometry args={[4, 0.2, 4]} />
                  <meshBasicMaterial color="#1a1c1e" />
                </mesh>
              ))}
            </group>
          </group>
        );
      }
      case "resistor":
        const bands = getResistorColors(
          value || customProps?.resistance?.toString() || "10",
        );
        return (
          <group position={[0, 2, 0]}>
            <mesh position={[-15, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 30]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-30, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 6]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[15, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 30]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[30, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 6]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            <mesh
              castShadow
              receiveShadow
              position={[0, -2, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[1.5, 1.5, 16, 16]} />
              <meshPhysicalMaterial color="#eecb9b" roughness={0.8} />
            </mesh>
            <mesh position={[-8, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.7, 1.7, 2, 16]} />
              <meshPhysicalMaterial color="#eecb9b" roughness={0.8} />
            </mesh>
            <mesh position={[8, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.7, 1.7, 2, 16]} />
              <meshPhysicalMaterial color="#eecb9b" roughness={0.8} />
            </mesh>

            <mesh position={[-5, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.55, 1.55, 1.5, 16]} />
              <meshPhysicalMaterial color={bands[0]} roughness={0.9} />
            </mesh>
            <mesh position={[-2, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.55, 1.55, 1.5, 16]} />
              <meshPhysicalMaterial color={bands[1]} roughness={0.9} />
            </mesh>
            <mesh position={[1, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.55, 1.55, 1.5, 16]} />
              <meshPhysicalMaterial color={bands[2]} roughness={0.9} />
            </mesh>
            <mesh position={[5, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.55, 1.55, 1.5, 16]} />
              <meshPhysicalMaterial
                color={bands[3]}
                roughness={0.7}
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          </group>
        );

      case "capacitor":
        return (
          <group position={[25, 3, 0]}>
            {/* Leads */}
            <mesh position={[-5, -1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 10]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-10, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[5, -1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 10]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[10, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>

            {/* Ceramic Body - Yellow/Orange */}
            <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[5, 16, 16]} />
              <meshPhysicalMaterial
                color="#eab308"
                roughness={0.4}
                clearcoat={0.5}
              />
            </mesh>
            <mesh
              position={[0, -0.5, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[5, 5, 2, 16]} />
              <meshPhysicalMaterial
                color="#eab308"
                roughness={0.4}
                clearcoat={0.5}
              />
            </mesh>
          </group>
        );

      case "capacitor_elec":
        return (
          <group position={[25, 4, 0]}>
            {/* Leads */}
            <mesh position={[-4, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[4, -3, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.1}
              />
            </mesh>

            {/* Electrolytic Body - Black with Silver Top */}
            <group position={[0, 2, 0]} castShadow receiveShadow>
              <mesh>
                <cylinderGeometry args={[4.5, 4.5, 12, 16]} />
                <meshPhysicalMaterial
                  color="#111"
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                  roughness={0.5}
                />
              </mesh>
              {/* Silver top */}
              <mesh position={[0, 6, 0]}>
                <cylinderGeometry args={[4.3, 4.3, 0.2, 16]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.2}
                />
              </mesh>
              {/* Polarity Stripe (Negative) */}
              <mesh position={[-4.51, 0, 0]} rotation={[0, 0, 0]}>
                <planeGeometry args={[1, 12]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  roughness={0.4}
                  side={2}
                />
              </mesh>
            </group>
          </group>
        );

      case "inductor":
        return (
          <group position={[25, 4, 0]}>
            {/* Toroidal Inductor (Realistic) */}
            <mesh position={[-8, -2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 15]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[8, -2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 15]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh
              position={[0, 5, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <torusGeometry args={[5, 2, 16, 32]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Copper Wire Wraps */}
            {[...Array(20)].map((_, i) => (
              <mesh
                key={i}
                position={[0, 5, 0]}
                rotation={[Math.PI / 2, 0, ((Math.PI * 2) / 20) * i]}
              >
                <torusGeometry args={[5, 2.2, 8, 4, Math.PI / 4]} />
                <meshPhysicalMaterial
                  color="#b45309"
                  metalness={0.9}
                  roughness={0.3}
                  clearcoat={1}
                />
              </mesh>
            ))}
            <Text
              position={[0, 5, 2.5]}
              fontSize={1.5}
              color="#fff"
              strokeWidth={0.1}
              strokeColor="#000"
            >
              100
            </Text>
          </group>
        );
      case "diode":
        return (
          <group position={[25, 2, 0]}>
            <mesh position={[-16, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 20]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-26, -4.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[16, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 20]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[26, -4.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            <mesh
              castShadow
              receiveShadow
              position={[0, -2, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[2.2, 2.2, 12, 16]} />
              <meshPhysicalMaterial
                color={isBroken ? "#111" : "#e06c4b"}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                transparent
                opacity={1}
                thickness={2}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-4, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[2.3, 2.3, 1.5, 16]} />
              <meshPhysicalMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        );
      case "led": {
        const ledColorStr = customProps?.color?.toLowerCase() || "red";
        let glowColor = "#ef4444";
        let dimColor = "#fca5a5";
        let darkColor = "#7f1d1d";
        
        if (ledColorStr === "green") { glowColor = "#22c55e"; dimColor = "#86efac"; darkColor = "#14532d"; }
        else if (ledColorStr === "blue") { glowColor = "#3b82f6"; dimColor = "#93c5fd"; darkColor = "#1e3a8a"; }
        else if (ledColorStr === "yellow") { glowColor = "#eab308"; dimColor = "#fde047"; darkColor = "#713f12"; }
        else if (ledColorStr === "white") { glowColor = "#ffffff"; dimColor = "#e2e8f0"; darkColor = "#475569"; }

        return (
          <group position={[0, 12, 0]}>
            {/* LED Bulb */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[2.5, 2.5, 6, 16]} />
              <meshPhysicalMaterial
                color={isBroken ? "#111" : isActive ? glowColor : dimColor}
                emissive={isActive && !isBroken ? glowColor : "black"}
                emissiveIntensity={isActive && !isBroken ? 6 : 0}
                transparent
                opacity={1}
                thickness={2}
                roughness={0.1}
                clearcoat={1.0}
              />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry
                args={[2.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshPhysicalMaterial
                color={isBroken ? "#111" : isActive ? glowColor : dimColor}
                emissive={isActive && !isBroken ? glowColor : "black"}
                emissiveIntensity={isActive && !isBroken ? 6 : 0}
                transparent
                opacity={1}
                thickness={2}
                roughness={0.1}
                clearcoat={1.0}
              />
            </mesh>
            <mesh position={[0, -3.5, 0]}>
              <cylinderGeometry args={[2.8, 2.8, 1, 16]} />
              <meshPhysicalMaterial
                color={isBroken ? "#333" : isActive ? glowColor : dimColor}
                roughness={0.3}
              />
            </mesh>
            {isActive && !isBroken && (
              <pointLight color={glowColor} intensity={6} distance={40} />
            )}

            {/* Straight Legs to x=-5 and x=5 */}
            <mesh position={[-5, -6, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 10]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[5, -6, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 10]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.3}
              />
            </mesh>

            {/* Internal Electrodes */}
            <mesh position={[-1, -1.5, 0]}>
              <boxGeometry args={[1, 3, 0.2]} />
              <meshPhysicalMaterial
                color="#64748b"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[1, -2, 0]}>
              <boxGeometry args={[0.5, 2, 0.2]} />
              <meshPhysicalMaterial
                color="#64748b"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      }

      case "battery":
        return (
          <group position={[0, -2, 0]}>
            {/* Battery Body */}
            <mesh castShadow receiveShadow position={[0, 15, 0]}>
              <boxGeometry args={[26, 45, 16]} />
              <meshPhysicalMaterial color="#222222" roughness={0.6} />
            </mesh>
            {/* Orange label */}
            <mesh position={[0, 15, 8.1]}>
              <boxGeometry args={[25, 40, 0.1]} />
              <meshPhysicalMaterial color="#d97706" />
            </mesh>
            <mesh position={[0, 15, -8.1]}>
              <boxGeometry args={[25, 40, 0.1]} />
              <meshPhysicalMaterial color="#d97706" />
            </mesh>
            <Text
              position={[0, 20, 8.2]}
              fontSize={12}
              color="#fff"
              fontWeight="bold"
            >
              9V
            </Text>
            <Text
              position={[0, 8, 8.2]}
              fontSize={6}
              color="#000"
              fontWeight="bold"
            >
              POWER
            </Text>

            {/* Terminals (+ smaller, - larger) */}
            <mesh position={[-6, 38.5, 0]} castShadow>
              <cylinderGeometry args={[2.5, 2.5, 2]} />
              <meshPhysicalMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
            <mesh position={[6, 38.5, 0]} castShadow>
              <cylinderGeometry args={[3.2, 3.2, 2, 6]} />
              <meshPhysicalMaterial color="#94a3b8" metalness={0.8} />
            </mesh>

            {/* Wires to the board (if plugged in) */}
            <mesh position={[-4.5, 19.5, 0]}>
              {/* Red wire */}
              <cylinderGeometry args={[0.3, 0.3, 40]} />
              <meshPhysicalMaterial color="#ef4444" roughness={0.7} />
            </mesh>
            <mesh position={[4.5, 19.5, 0]}>
              {/* Black wire (actually blue conventionally here for negative) */}
              <cylinderGeometry args={[0.3, 0.3, 40]} />
              <meshPhysicalMaterial color="#3b82f6" roughness={0.7} />
            </mesh>
          </group>
        );

      case "powersupply":
        return (
          <group position={[0, 12, 10]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[44, 24, 28]} />
              <meshPhysicalMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 14.1]}>
              <boxGeometry args={[42, 22, 0.2]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            <mesh position={[0, 4, 14.2]}>
              <planeGeometry args={[26, 8]} />
              <meshPhysicalMaterial color="#000" />
            </mesh>
            <Text
              position={[0, 4, 14.21]}
              fontSize={5}
              color="#22c55e"
              fontWeight="bold"
            >
              {(parseFloat(value) || 12.0).toFixed(1)} V
            </Text>
            <Text
              position={[0, -2, 14.21]}
              fontSize={4}
              color="#22c55e"
            >
              {(parseFloat(customProps?.maxCurrent?.toString() || "1")).toFixed(2)} A
            </Text>

            {/* Front Binding Posts */}
            <mesh position={[-12, -5, 14.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial color="#dc2626" />
            </mesh>
            <Text position={[-12, -1, 14.21]} fontSize={4} color="#fff">
              +
            </Text>

            <mesh position={[12, -5, 14.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial
                color="#111"
                roughness={0.6}
                clearcoat={0.3}
                clearcoatRoughness={0.8}
              />
            </mesh>
            <Text position={[12, -1, 14.21]} fontSize={4} color="#fff">
              -
            </Text>

            {/* Cable red down to (-10, 40) - global. Group is at (0, 12, 10) so local is (-10, -12, 30) */}
            <mesh position={[-11, -8.5, 22.25]} rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 22]} />
              <meshPhysicalMaterial color="#dc2626" roughness={0.9} />
            </mesh>
            <mesh position={[-10, -11, 30]}>
              <cylinderGeometry args={[0.8, 0.8, 2]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            {/* Cable black down to (10, 40) */}
            <mesh position={[11, -8.5, 22.25]} rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 22]} />
              <meshPhysicalMaterial color="#111" roughness={0.9} />
            </mesh>
            <mesh position={[10, -11, 30]}>
              <cylinderGeometry args={[0.8, 0.8, 2]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          </group>
        );

      case "ac_source":
        return (
          <group position={[20, 12, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[36, 24, 24]} />
              <meshPhysicalMaterial color="#3b82f6" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 12.1]}>
              <boxGeometry args={[34, 22, 0.2]} />
              <meshPhysicalMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0, 4, 12.2]}>
              <planeGeometry args={[24, 10]} />
              <meshPhysicalMaterial color="#000" />
            </mesh>
            <Text position={[0, 5, 12.21]} fontSize={3} color="#38bdf8">
              AC VOLTAGE
            </Text>
            <Text
              position={[0, 2, 12.21]}
              fontSize={4}
              color="#38bdf8"
              fontWeight="bold"
            >
              {(parseFloat(value) || 120).toFixed(0)} V
            </Text>
            <Text position={[0, -1, 12.21]} fontSize={3} color="#38bdf8">
              ~
            </Text>
            {/* Binding Posts */}
            <mesh position={[-8, -6, 12.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 3]} />
              <meshPhysicalMaterial color="#eab308" />
            </mesh>
            <mesh position={[8, -6, 12.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 3]} />
              <meshPhysicalMaterial
                color="#111"
                roughness={0.6}
                clearcoat={0.3}
                clearcoatRoughness={0.8}
              />
            </mesh>

            {/* Cable left down to user's pinmap (-10 global = -30 local) */}
            <mesh
              position={[-19, -8, 6.25]}
              rotation={[0, Math.atan2(12.5, 22), Math.PI / 2]}
            >
              <cylinderGeometry args={[0.8, 0.8, 25]} />
              <meshPhysicalMaterial color="#dc2626" roughness={0.9} />
            </mesh>
            <mesh position={[-30, -10, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 4]} />
              <meshPhysicalMaterial color="#dc2626" roughness={0.9} />
            </mesh>

            {/* Cable right down to user's pinmap (50 global = 30 local) */}
            <mesh
              position={[19, -8, 6.25]}
              rotation={[0, -Math.atan2(12.5, 22), -Math.PI / 2]}
            >
              <cylinderGeometry args={[0.8, 0.8, 25]} />
              <meshPhysicalMaterial color="#000000" roughness={0.9} />
            </mesh>
            <mesh position={[30, -10, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 4]} />
              <meshPhysicalMaterial color="#000000" roughness={0.9} />
            </mesh>
          </group>
        );

      case "switch":
        return (
          <group position={[15, 6, 0]}>
            {/* Ultra-realistic Tactile Switch / Push Button */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[12, 4, 12]} />
              <meshPhysicalMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Metal cover plate */}
            <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
              <boxGeometry args={[12.2, 0.5, 12.2]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.3}
                clearcoat={1}
              />
            </mesh>
            {/* Indent central ring on metal */}
            <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.2, 0.2, 16, 32]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* Actuator */}
            <mesh position={[0, isClosed ? 2.5 : 3.5, 0]} castShadow>
              <cylinderGeometry args={[3.4, 3.4, 3, 32]} />
              <meshPhysicalMaterial color="#111827" roughness={0.8} />
            </mesh>
            {/* Pins */}
            {[-5, 5].map((x) =>
              [-5, 5].map((z) => (
                <group key={`${x}-${z}`}>
                  {/* Bendy pin parts */}
                  <mesh position={[x < 0 ? -6.5 : 6.5, 1, z]}>
                    <boxGeometry args={[1.5, 0.5, 1]} />
                    <meshPhysicalMaterial
                      color="#cbd5e1"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[x < 0 ? -7 : 7, -3, z]}>
                    <boxGeometry args={[0.5, 8, 1]} />
                    <meshPhysicalMaterial
                      color="#cbd5e1"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              )),
            )}
          </group>
        );
      case "potentiometer":
        return (
          <group position={[30, 4, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[6, 6, 6, 32]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 5, 0]} castShadow>
              <cylinderGeometry args={[2, 2, 5, 16]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 8, 0]}>
              <boxGeometry args={[1.2, 1, 3]} />
              <meshPhysicalMaterial color="#0f172a" />
            </mesh>
            {[-3, 0, 3].map((x) => (
              <mesh key={x} position={[x, -5, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 4]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        );
      case "lamp":
        return (
          <group position={[25, 10, 0]}>
            <mesh position={[-4, -10, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 6]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[4, -10, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 6]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            <mesh position={[0, -5, 0]}>
              <cylinderGeometry args={[4, 3, 5, 16]} />
              <meshPhysicalMaterial
                color="#b45309"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            <mesh position={[0, 2, 0]} castShadow>
              <sphereGeometry args={[6, 32, 16]} />
              <meshPhysicalMaterial
                color={isBroken ? "#111" : isActive ? "#fef08a" : "#fefce8"}
                emissive={isActive && !isBroken ? "#fef08a" : "black"}
                emissiveIntensity={isActive && !isBroken ? 6 : 0}
                opacity={0.6}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {isActive && !isBroken && (
              <pointLight color="#fef08a" intensity={6} distance={40} />
            )}
          </group>
        );
      case "usb_c":
      case "micro_usb":
        return (
          <group position={[0, 4, 0]}>
            {/* Base */}
            <mesh castShadow receiveShadow position={[0, -2, 10]}>
              <boxGeometry args={[26, 4, 20]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0, 18]}>
              <boxGeometry args={[12, 3, 6]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0, 20]}>
              <boxGeometry args={[8, 1.2, 4]} />
              <meshPhysicalMaterial color="#0f172a" />
            </mesh>
            <Text
              position={[-6, 0.1, 10]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={6}
              color="#ef4444"
              fontWeight="bold"
            >
              +
            </Text>
            <Text
              position={[6, 0.1, 10]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={6}
              color="#3b82f6"
              fontWeight="bold"
            >
              -
            </Text>
            {/* Pins */}
            <mesh position={[-10, -4, 20]}>
              <cylinderGeometry args={[1, 1, 6]} />
              <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[10, -4, 20]}>
              <cylinderGeometry args={[1, 1, 6]} />
              <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        );
      case "buzzer":
        return (
          <group position={[10, 6, 0]}>
            {/* Active/Passive Piezo Buzzer */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[8, 8, 12, 32]} />
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.6}
                clearcoat={0.2}
              />
            </mesh>
            <mesh position={[0, 6.1, 0]}>
              <cylinderGeometry args={[6.5, 6.5, 0.2, 32]} />
              <meshPhysicalMaterial color="#1e293b" />
            </mesh>
            {/* Center Sound Hole */}
            <mesh position={[0, 6.2, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.2, 24]} />
              <meshPhysicalMaterial color="#000000" />
            </mesh>
            {/* Positive indicator label */}
            <mesh position={[0, 6.2, 4]}>
              <planeGeometry args={[4, 4]} />
              <meshPhysicalMaterial color="#1e293b" />
            </mesh>
            <Text
              position={[0, 6.21, 4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={3}
              color="#94a3b8"
            >
              +
            </Text>
            {/* Plus sign mold */}
            <mesh position={[0, 3, 8.1]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2, 2]} />
              <meshPhysicalMaterial color="#94a3b8" />
            </mesh>

            {/* Pins */}
            <mesh position={[-3, -8, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 6]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[3, -8, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 8]} />{" "}
              {/* Longer pin for pos */}
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* Vibration wave effect when active */}
            {isActive && (
              <mesh position={[0, 7.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3, 5, 32]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
              </mesh>
            )}
          </group>
        );
      case "motor":
        return (
          <group position={[0, 4, 0]}>
            <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[5, 5, 12, 32]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            <mesh
              name="motorShaft"
              position={[7, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[1, 1, 4, 16]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[2, 2, 1, 16]} />
              <meshPhysicalMaterial
                color="#eab308"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          </group>
        );
      case "relay":
        return (
          <group position={[15, 10, 0]}>
            {/* Realistic Songle Type Relay Box */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[19, 15, 15]} />
              <meshPhysicalMaterial
                color={isActive ? "#1e3a8a" : "#1d4ed8"}
                roughness={0.4}
                clearcoat={0.6}
              />
            </mesh>
            <mesh position={[0, 7.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 14]} />
              <meshPhysicalMaterial color="#0f172a" roughness={0.8} />
            </mesh>
            <Text
              position={[-4, 7.61, -4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.4}
              color="#f8fafc"
            >
              SRD-05VDC-SL-C
            </Text>
            <Text
              position={[4, 7.61, 2]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={2.5}
              color="#f8fafc"
              fontStyle="italic"
            >
              SONGLE
            </Text>
            <Text
              position={[-4, 7.61, 4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.2}
              color="#f8fafc"
            >
              10A 250VAC
            </Text>
            {/* Pins */}
            {[-6, 0, 6].map((x) => (
              <mesh key={x} position={[x, -10, 5]}>
                <cylinderGeometry args={[0.3, 0.3, 6]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  roughness={0.3}
                />
              </mesh>
            ))}
            {[-6, 6].map((x) => (
              <mesh key={x} position={[x, -10, -5]}>
                <cylinderGeometry args={[0.3, 0.3, 6]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  roughness={0.3}
                />
              </mesh>
            ))}
            {isActive && (
              <pointLight color="#3b82f6" intensity={2} distance={8} />
            )}
          </group>
        );

      case "ic":
      case "timer555":
      case "opamp":
      case "logic_gate":
      case "logic_and":
      case "logic_or":
      case "logic_nand":
      case "logic_nor":
      case "logic_xor":
      case "dip8": {
        const is14Pin = [
          "ic",
          "logic_gate",
          "logic_and",
          "logic_or",
          "logic_nand",
          "logic_nor",
          "logic_xor",
        ].includes(type);
        const pinsX = is14Pin
          ? [-30, -20, -10, 0, 10, 20, 30]
          : [-15, -5, 5, 15];
        const length = is14Pin ? 70 : 40;
        return (
          <group position={[0, 4, 3]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[length, 8, 26]} />
              <meshPhysicalMaterial
                color="#1a1c1e"
                roughness={0.85}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[-length / 2 + 4, 2.5, -9]}>
              <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
              <meshPhysicalMaterial color="#000000" roughness={0.9} />
            </mesh>
            <Text
              position={[0, 4.05, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={6}
              color="#555"
            >
              {value || (type === "timer555"
                ? "NE555"
                : type === "opamp"
                  ? "LM741"
                  : type.startsWith("logic_")
                    ? type.replace("logic_", "").toUpperCase()
                    : "IC")}
            </Text>
            <mesh position={[0, -2.5, 12]}>
              <boxGeometry args={[length - 4, 3, 6]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, -2.5, -12]}>
              <boxGeometry args={[length - 4, 3, 6]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            {pinsX.map((px, i) => (
              <group key={i}>
                <mesh position={[px, -4, 15]}>
                  <cylinderGeometry args={[2, 2, 4]} />
                  <meshPhysicalMaterial
                    color="#cbd5e1"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
                <mesh position={[px, -4, -15]}>
                  <cylinderGeometry args={[2, 2, 4]} />
                  <meshPhysicalMaterial
                    color="#cbd5e1"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      }

      case "sop": {
        const pinsX = [-15, -5, 5, 15]; // standard SO-8
        const length = 40;
        return (
          <group position={[0, 0, 0]}>
            {/* Plastic molded body, sitting flat and slightly off the board */}
            <mesh castShadow receiveShadow position={[0, 1.7, 0]}>
              <boxGeometry args={[length, 3, 14]} />
              <meshPhysicalMaterial
                color="#141414"
                roughness={0.8}
                metalness={0.15}
                clearcoat={0.1}
              />
            </mesh>
            {/* Pin 1 dimple */}
            <mesh position={[-length / 2 + 3, 3.25, -4.5]}>
              <cylinderGeometry args={[1, 1, 0.1, 16]} />
              <meshPhysicalMaterial color="#050505" roughness={0.9} />
            </mesh>
            {/* Laser marked label */}
            <Text
              position={[0, 3.3, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={4.5}
              color="#d1d5db"
              fontWeight="bold"
            >
              {value || "SOP-8"}
            </Text>
            {/* SMD gull-wing leads extending on both sides */}
            {pinsX.map((px, i) => (
              <group key={i}>
                {/* Left side gull-wing lead */}
                <group position={[px, 0.15, -8.5]}>
                  {/* Flat foot on solder pad */}
                  <mesh position={[0, 0.1, 0.5]}>
                    <boxGeometry args={[1.5, 0.2, 2.5]} />
                    <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                  </mesh>
                  {/* Slope/bent copper pin up to body */}
                  <mesh position={[0, 0.7, -1.25]} rotation={[Math.PI / 4, 0, 0]}>
                    <boxGeometry args={[1.5, 0.2, 2.5]} />
                    <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
                {/* Right side gull-wing lead */}
                <group position={[px, 0.15, 8.5]}>
                  {/* Flat foot on solder pad */}
                  <mesh position={[0, 0.1, -0.5]}>
                    <boxGeometry args={[1.5, 0.2, 2.5]} />
                    <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                  </mesh>
                  {/* Slope/bent copper pin up to body */}
                  <mesh position={[0, 0.7, 1.25]} rotation={[-Math.PI / 4, 0, 0]}>
                    <boxGeometry args={[1.5, 0.2, 2.5]} />
                    <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        );
      }

      case "transistor":
      case "transistor_pnp":
      case "mosfet":
      case "mosfet_p":
      case "to220":
        return (
          <group position={[0, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, 12, -2]}>
              <boxGeometry args={[28, 20, 6]} />
              <meshPhysicalMaterial color="#1f2937" roughness={0.8} />
            </mesh>
            <Text position={[0, 15, 1.1]} fontSize={3} color="#ccc">
              {value || (type === "mosfet" || type === "mosfet_p" ? "IRFZ44N" : "TIP120")}
            </Text>
            <mesh position={[0, 20, -4]} castShadow receiveShadow>
              <boxGeometry args={[28, 30, 2]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 28, -4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[4, 4, 2.2, 16]} />
              <meshPhysicalMaterial color="#0b0f19" />
            </mesh>
            {[-8, 0, 8].map((pinX) => (
              <mesh key={pinX} position={[pinX, 2, -1]} castShadow>
                <boxGeometry args={[3, 10, 2]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            ))}
          </group>
        );
      case "qfp":
      case "bga":
        const size = type === "qfp" ? 40 : 30;
        return (
          <group position={[0, 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[size - 6, 4, size - 6]} />
              <meshPhysicalMaterial
                color="#1a1c1e"
                roughness={0.85}
                metalness={0.1}
              />
            </mesh>
            <mesh
              position={[-size / 2 + 8, 2.1, -size / 2 + 8]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[2, 16]} />
              <meshPhysicalMaterial color="#000" />
            </mesh>
            <mesh position={[0, -2, 0]}>
              <boxGeometry args={[size, 0.5, size]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      case "cr2032":
        return (
          <group position={[0, 0, 0]}>
            {/* Plastic holder housing (black curved ring/casing) */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[23, 23, 4, 32, 1, true]} />
              <meshPhysicalMaterial color="#1f2937" roughness={0.8} />
            </mesh>
            {/* Holder solid bottom */}
            <mesh position={[0, 0.5, 0]} receiveShadow>
              <cylinderGeometry args={[22, 22, 1, 32]} />
              <meshPhysicalMaterial color="#111827" roughness={0.9} />
            </mesh>
            {/* Shiny Lithium battery disk (steel) sitting slightly inside the holder */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[20, 20, 3.2, 32]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.95}
                roughness={0.15}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* "+" engraved on top of battery */}
            <Text
              position={[0, 4.65, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={5}
              color="#fbbf24"
              fontWeight="bold"
            >
              + CR2032
            </Text>
            {/* Side spring terminals (gold or steel tabs) */}
            <mesh position={[-21.5, 2, 0]} castShadow>
              <boxGeometry args={[4, 3.5, 5]} />
              <meshPhysicalMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[21.5, 2, 0]} castShadow>
              <boxGeometry args={[4, 3.5, 5]} />
              <meshPhysicalMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      case "crystal":
        return (
          <group position={[0, 0, 0]}>
            {/* Base Gasket (thin black plastic bottom outline) */}
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[16, 1.5, 8]} />
              <meshPhysicalMaterial color="#18181b" roughness={0.9} />
            </mesh>
            {/* Metal casing (elliptical top body - let's render using scaled cylinder) */}
            <mesh position={[0, 7.5, 0]} castShadow receiveShadow scale={[1.8, 1, 1]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[4.2, 4.2, 12, 16]} />
              <meshPhysicalMaterial
                color="#e4e4e7"
                metalness={0.9}
                roughness={0.1}
                clearcoat={0.9}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* Engraved text on crystal top (frequency: e.g. 16.000 MHz) */}
            <Text
              position={[0, 13.51, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={2}
              color="#3f3f46"
              fontWeight="bold"
            >
              16.000MHz
            </Text>
            {/* Pins underneath */}
            <mesh position={[-5, 0, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 3]} />
              <meshPhysicalMaterial color="#a1a1aa" metalness={0.9} />
            </mesh>
            <mesh position={[5, 0, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 3]} />
              <meshPhysicalMaterial color="#a1a1aa" metalness={0.9} />
            </mesh>
          </group>
        );

      case "ldr_smd":
        return (
          <group position={[0, 0, 0]}>
            {/* White ceramic substrate backplate */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[14, 3, 10]} />
              <meshPhysicalMaterial
                color="#f4f4f5"
                roughness={0.5}
              />
            </mesh>
            {/* Left plated solder head tag */}
            <mesh position={[-6, 1.6, 0]}>
              <boxGeometry args={[2.5, 3.1, 10.2]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Right plated solder head tag */}
            <mesh position={[6, 1.6, 0]}>
              <boxGeometry args={[2.5, 3.1, 10.2]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Red photosensitive serpentine trace on the top */}
            <group position={[0, 3.1, 0]}>
              {[-3.5, -1.5, 0.5, 2.5].map((offZ, idx) => (
                <mesh key={`seg_h_${idx}`} position={[0, 0, offZ]}>
                  <boxGeometry args={[9, 0.1, 1]} />
                  <meshPhysicalMaterial color="#dc2626" roughness={0.3} />
                </mesh>
              ))}
              {/* Connectors to make the serpentine */}
              <mesh position={[-4, 0, -2.5]}>
                <boxGeometry args={[1, 0.1, 2]} />
                <meshPhysicalMaterial color="#dc2626" roughness={0.3} />
              </mesh>
              <mesh position={[4, 0, -0.5]}>
                <boxGeometry args={[1, 0.1, 2]} />
                <meshPhysicalMaterial color="#dc2626" roughness={0.3} />
              </mesh>
              <mesh position={[-4, 0, 1.5]}>
                <boxGeometry args={[1, 0.1, 2]} />
                <meshPhysicalMaterial color="#dc2626" roughness={0.3} />
              </mesh>
            </group>
            {/* Transparent epoxy glass protective coating */}
            <mesh position={[0, 3.2, 0]}>
              <boxGeometry args={[9.8, 0.4, 9.8]} />
              <meshPhysicalMaterial
                color="#bae6fd"
                transparent
                opacity={0.4}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0}
              />
            </mesh>
          </group>
        );

      case "ntc_smd":
      case "smd":
        return (
          <group position={[0, 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[14, 4, 12]} />
              <meshPhysicalMaterial
                color="#1a1c1e"
                emissiveIntensity={0}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[7, -1.5, 0]}>
              <boxGeometry args={[4, 1, 12]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-7, -1.5, 0]}>
              <boxGeometry args={[4, 1, 12]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      case "smd_led": {
        const ledColorStr = customProps?.color?.toLowerCase() || "red";
        let glowColor = "#ef4444";
        let dimColor = "#fee2e2";
        
        if (ledColorStr === "green") { glowColor = "#22c55e"; dimColor = "#dcfce7"; }
        else if (ledColorStr === "blue") { glowColor = "#3b82f6"; dimColor = "#dbeafe"; }
        else if (ledColorStr === "yellow") { glowColor = "#eab308"; dimColor = "#fef9c3"; }
        else if (ledColorStr === "white") { glowColor = "#ffffff"; dimColor = "#f8fafc"; }

        return (
          <group position={[0, 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[14, 4, 12]} />
              <meshPhysicalMaterial
                color={isBroken ? "#333" : isActive ? glowColor : dimColor}
                emissive={isActive && !isBroken ? glowColor : "black"}
                emissiveIntensity={isActive && !isBroken ? 6 : 0}
                transparent
                opacity={1}
                thickness={2}
                roughness={0.1}
                clearcoat={1}
              />
            </mesh>
            <mesh position={[7, -1.5, 0]}>
              <boxGeometry args={[4, 1, 12]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[-7, -1.5, 0]}>
              <boxGeometry args={[4, 1, 12]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {isActive && !isBroken && (
              <pointLight
                color={glowColor}
                intensity={6}
                distance={40}
                position={[0, 4, 0]}
              />
            )}
          </group>
        );
      }
      case "sot23":
        return (
          <group position={[0, 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[12, 4, 8]} />
              <meshPhysicalMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[-6, -1.5, 0]}>
              <boxGeometry args={[3, 1, 3]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[6, -1.5, -2.5]}>
              <boxGeometry args={[3, 1, 3]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[6, -1.5, 2.5]}>
              <boxGeometry args={[3, 1, 3]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          </group>
        );
      case "pinheader":
        return (
          <group position={[0, 2, 0]}>
            <mesh castShadow receiveShadow position={[0, 1, 0]}>
              <boxGeometry args={[26, 4, 8]} />
              <meshPhysicalMaterial color="#111827" roughness={0.9} />
            </mesh>
            {[-9, 0, 9].map((pos, i) => (
              <mesh key={i} position={[pos, 6, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 12]} />
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        );
      case "pad":
      case "via":
        return (
          <group>
            <mesh
              position={[0, type === "via" ? -0.8 : 0, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry
                args={[
                  type === "via" ? 2 : 3,
                  type === "via" ? 2 : 3,
                  type === "via" ? 1.8 : 0.1,
                  16,
                ]}
              />
              <meshPhysicalMaterial
                color="#d4af37"
                metalness={0.9}
                roughness={0.2}
                clearcoat={0.5}
                clearcoatRoughness={0.2}
              />
            </mesh>
            <mesh position={[0, type === "via" ? -0.8 : 0, 0]}>
              <cylinderGeometry
                args={[
                  type === "via" ? 0.8 : 1.2,
                  type === "via" ? 0.8 : 1.2,
                  type === "via" ? 1.81 : 0.11,
                  16,
                ]}
              />
              <meshPhysicalMaterial color="#000" />
            </mesh>
          </group>
        );

      case "fiducial":
        return (
          <group position={[0, 0, 0]}>
            {/* Dark solder mask clearance circle */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[4, 16]} />
              <meshPhysicalMaterial color="#022c22" roughness={0.9} />
            </mesh>
            {/* Gold fiducial dot in center */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.5, 16]} />
              <meshPhysicalMaterial
                color="#d4af37"
                metalness={0.95}
                roughness={0.1}
                clearcoat={0.9}
              />
            </mesh>
          </group>
        );

      case "mounting_hole":
        return (
          <group position={[0, 0, 0]}>
            {/* Surrounding gold collar ring */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <ringGeometry args={[6, 10, 32]} />
              <meshPhysicalMaterial
                color="#d4af37"
                metalness={0.95}
                roughness={0.15}
                clearcoat={0.8}
              />
            </mesh>
            {/* The actual drill hole cavity */}
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[5.9, 5.9, 1.62, 32]} />
              <meshPhysicalMaterial color="#090d16" roughness={1.0} />
            </mesh>
            {/* Tiny gold plated via-retaining teeth or patterns around the outer ring */}
            {Array.from({ length: 8 }).map((_, i) => {
              const theta = (i * Math.PI * 2) / 8;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(theta) * 8, 0.03, Math.sin(theta) * 8]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <circleGeometry args={[0.8, 8]} />
                  <meshPhysicalMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                </mesh>
              );
            })}
          </group>
        );

      case "test_point":
        return (
          <group position={[0, 0, 0]}>
            {/* Base SMT solder pad (gold circular collar) */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[4, 16]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Red plastic collar of SMT test point */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[2.5, 2.5, 3, 16]} />
              <meshPhysicalMaterial color="#ef4444" roughness={0.5} />
            </mesh>
            {/* Shiny metal loop/hook on top for the probe */}
            <mesh position={[0, 4.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[2, 0.5, 8, 16, Math.PI]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.95}
                roughness={0.15}
                clearcoat={1}
              />
            </mesh>
            {/* Solder fillet under plastic collar */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[3, 1.5, 0.8, 16]} />
              <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Text Label "TP" */}
            <Text
              position={[0, 6.5, 0]}
              fontSize={2.5}
              color="#ffffff"
              fontWeight="bold"
            >
              TP
            </Text>
          </group>
        );

      case "copper_pour":
        return (
          <group position={[0, 0, 0]}>
            {/* Hashed or solid copper area */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 40]} />
              <meshPhysicalMaterial
                color="#d4af37"
                transparent
                opacity={0.35}
                metalness={0.9}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* Soldermask border lines */}
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.66, 1]}>
              <ringGeometry args={[29, 30, 4, 1, 0, Math.PI * 2]} />
              <meshPhysicalMaterial color="#b91c1c" roughness={0.9} />
            </mesh>
            {/* Copper pour net label */}
            <Text
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={4}
              color="#fbbf24"
              fontWeight="bold"
            >
              GND POUR
            </Text>
          </group>
        );

      case "arduino_uno":
        return (
          <group position={[5, 2, 5]}>
            <mesh castShadow receiveShadow position={[0, -0.8, 0]}>
              <extrudeGeometry
                args={[
                  unoShapeData,
                  {
                    depth: 1.6,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.1,
                    bevelSegments: 2,
                  },
                ]}
              />
              <meshPhysicalMaterial
                color="#005f73"
                roughness={0.7}
                metalness={0.1}
                clearcoat={0.5}
                clearcoatRoughness={0.5}
              />
            </mesh>

            <gridHelper
              args={[68, 68, "#006c86", "#006c86"]}
              position={[0, 0.81, 0]}
            />

            <Text
              position={[-15, 0.82, -4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={6}
              color="#fff"
              fontStyle="italic"
              fontWeight="bold"
              letterSpacing={0.1}
            >
              UNO
            </Text>
            <Text
              position={[-8, 0.82, 5]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.5}
              color="#fff"
            >
              TX
            </Text>
            <Text
              position={[-8, 0.82, 8]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.5}
              color="#fff"
            >
              RX
            </Text>
            <Text
              position={[20, 0.82, -10]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={2}
              color="#fff"
              fontWeight="bold"
            >
              ARDUINO
            </Text>

            <group position={[10, 0.8, 12]}>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[36, 2, 11]} />
                <meshPhysicalMaterial
                  color="#222"
                  roughness={0.7}
                  clearcoat={0.2}
                  clearcoatRoughness={0.7}
                />
              </mesh>
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[35, 3, 9]} />
                <meshPhysicalMaterial
                  color="#111"
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                  roughness={0.9}
                />
              </mesh>
              <mesh position={[-15, 4.5, 0]}>
                <circleGeometry args={[1, 16]} />
                <meshPhysicalMaterial color="#1a1a1a" />
              </mesh>
              <Text
                position={[0, 4.51, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.6}
                color="#555"
              >
                ATMEL
              </Text>
              <Text
                position={[0, 4.51, 2.5]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.2}
                color="#555"
              >
                ATMEGA328P-PU
              </Text>
              {Array.from({ length: 14 }).map((_, i) => (
                <group key={i}>
                  <mesh position={[-16.25 + i * 2.5, 1.5, 5]}>
                    <boxGeometry args={[0.5, 3, 1]} />
                    <meshPhysicalMaterial
                      color="#ccc"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[-16.25 + i * 2.5, 1.5, -5]}>
                    <boxGeometry args={[0.5, 3, 1]} />
                    <meshPhysicalMaterial
                      color="#ccc"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>

            <IC_SMD position={[-15, 0.8, -7]} pins={16} length={8} width={6} />
            <IC_SMD position={[-5, 0.8, 5]} pins={8} length={4} width={4} />

            <group position={[-10, 0.8, 12]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[8, 3, 4]} />
                <meshPhysicalMaterial
                  color="#d1d5db"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.2}
                />
              </mesh>
              <Text
                position={[0, 3.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.2}
                color="#444"
              >
                16.000
              </Text>
            </group>

            <group position={[-25, 0.8, 15]}>
              <mesh
                position={[0, 3, 0]}
                castShadow
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[2.5, 2.5, 6, 16]} />
                <meshPhysicalMaterial
                  color="#1e293b"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2.5, 2.5, 0.1, 16]} />
                <meshPhysicalMaterial
                  color="#d1d5db"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            </group>
            <group position={[-25, 0.8, 5]}>
              <mesh
                position={[0, 3, 0]}
                castShadow
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[2.5, 2.5, 6, 16]} />
                <meshPhysicalMaterial
                  color="#1e293b"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2.5, 2.5, 0.1, 16]} />
                <meshPhysicalMaterial
                  color="#d1d5db"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            </group>

            <group position={[-20, 0.8, 10]}>
              <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[6, 2, 4]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <mesh position={[0, 0.5, 2.5]}>
                <boxGeometry args={[4, 1, 1]} />
                <meshPhysicalMaterial
                  color="#ccc"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            </group>

            <Resistor_SMD position={[-10, 0.8, -1]} />
            <Resistor_SMD position={[-10, 0.8, 2]} />
            <Resistor_SMD
              position={[-15, 0.8, -1]}
              rotation={[0, Math.PI / 2, 0]}
            />
            <Capacitor_SMD
              position={[-18, 0.8, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
            <Capacitor_SMD position={[5, 0.8, 5]} />

            <group position={[-30, 0.8, -18]}>
              <mesh position={[0, 6, 0]} castShadow>
                <boxGeometry args={[16, 12, 12]} />
                <meshPhysicalMaterial
                  color="#e2e8f0"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.1}
                />
              </mesh>
              <mesh position={[2, 6, 0]}>
                <boxGeometry args={[13, 10, 10]} />
                <meshPhysicalMaterial color="#333" />
              </mesh>
            </group>

            <mesh position={[-30, 5.8, 20]} castShadow>
              <boxGeometry args={[14, 10, 9]} />
              <meshPhysicalMaterial
                color="#141414"
                roughness={0.7}
                metalness={0.9}
                clearcoat={0.15}
                clearcoatRoughness={0.8}
              />
            </mesh>
            <mesh position={[-36, 5.8, 20]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[2.5, 2.5, 4, 32]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            <group position={[-22, 0.8, -23]}>
              <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[4, 2, 4]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.2, 0.5, 16]} />
                <meshPhysicalMaterial color="#ef4444" roughness={0.5} />
              </mesh>
            </group>

            <group position={[2.5, 0.8, -24.5]}>
              <mesh position={[-13.5, 4.25, 0]}>
                <boxGeometry args={[15, 8.5, 3]} />
                <meshPhysicalMaterial color="#1f2937" roughness={0.9} />
              </mesh>
              <mesh position={[6.5, 4.25, 0]}>
                <boxGeometry args={[20, 8.5, 3]} />
                <meshPhysicalMaterial color="#1f2937" roughness={0.9} />
              </mesh>
              {Array.from({ length: 12 }).map((_, i) => (
                <mesh key={i} position={[-20 + i * 2.5, 8.5, 0]}>
                  <boxGeometry args={[1.2, 0.1, 1.2]} />
                  <meshPhysicalMaterial color="#000" />
                </mesh>
              ))}
            </group>

            <group position={[2.5, 0.8, 24.5]}>
              <mesh position={[-11, 4.25, 0]}>
                <boxGeometry args={[20, 8.5, 3]} />
                <meshPhysicalMaterial color="#1f2937" roughness={0.9} />
              </mesh>
              <mesh position={[11, 4.25, 0]}>
                <boxGeometry args={[15, 8.5, 3]} />
                <meshPhysicalMaterial color="#1f2937" roughness={0.9} />
              </mesh>
            </group>

            <group position={[28, 0.8, -5]}>
              <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[5, 3, 8]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              {Array.from({ length: 3 }).map((_, i) => (
                <group key={i}>
                  <mesh position={[-1.27, 4, -2.54 + i * 2.54]}>
                    <boxGeometry args={[0.6, 8, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[1.27, 4, -2.54 + i * 2.54]}>
                    <boxGeometry args={[0.6, 8, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>

            {[
              { x: -3, z: 5, c: "#22c55e", on: true },
              { x: -3, z: 8, c: "#fbbf24", on: isActive },
              { x: -3, z: 11, c: "#fbbf24", on: isActive },
              { x: 15, z: 1, c: "#eab308", on: isActive },
            ].map((led, i) => (
              <mesh key={"led" + i} position={[led.x, 1, led.z]}>
                <boxGeometry args={[1.5, 0.5, 1]} />
                <meshPhysicalMaterial
                  color="#fff"
                  emissive={led.c}
                  emissiveIntensity={led.on ? 10 : 0}
                />
              </mesh>
            ))}
          </group>
        );

      case "esp32_cam":
        return (
          <group position={[0, 1, 5]}>
            {/* Ai-Thinker ESP32-CAM Real Dimensions: 27mm x 40.5mm */}
            <mesh castShadow receiveShadow position={[0, -0.8, 0]}>
              <boxGeometry args={[27, 1.6, 40.5]} />
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.3}
                clearcoat={0.3}
              />
            </mesh>

            <gridHelper
              args={[27, 40, "#1e293b", "#1e293b"]}
              position={[0, 0.01, 0]}
            />

            {/* ESP32-S Module with IPEX */}
            <group position={[0, 0.8, -10]}>
              <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[16, 2, 18]} />
                <meshPhysicalMaterial
                  color="#e2e8f0"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.2}
                />
              </mesh>
              <Text
                position={[0, 2.01, -2]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.2}
                color="#444"
                fontStyle="italic"
                letterSpacing={0.1}
              >
                Ai-Thinker
              </Text>
              <Text
                position={[0, 2.01, 3]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.5}
                color="#444"
                fontWeight="bold"
              >
                ESP32-S
              </Text>
              {/* Shield details */}
              {Array.from({ length: 4 }).map((_, i) => (
                <mesh key={i} position={[-6 + i * 4, 2.01, -6]}>
                  <boxGeometry args={[1, 0.1, 1]} />
                  <meshPhysicalMaterial color="#94a3b8" />
                </mesh>
              ))}
              {/* IPEX Antenna Connector */}
              <mesh position={[4, 2, -6]} castShadow>
                <boxGeometry args={[2, 1, 2]} />
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[4, 2.5, -6]}>
                <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
                <meshPhysicalMaterial
                  color="#e4c596"
                  roughness={0.5}
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            </group>

            {/* MicroSD Card Slot (Bottom but modeled clearly) */}
            <group position={[0, -1.8, 5]}>
              <mesh castShadow>
                <boxGeometry args={[14, 1.5, 15]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              {/* MicroSD card inserted slightly */}
              <mesh position={[0, 0, 8]}>
                <boxGeometry args={[11, 0.6, 12]} />
                <meshPhysicalMaterial color="#ef4444" />
              </mesh>
            </group>

            {/* PSRAM Chip */}
            <IC_SMD position={[0, 1, 3]} pins={8} length={5} width={5} />
            <Text
              position={[0, 1.6, 3]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.8}
              color="#666"
            >
              PSRAM
            </Text>

            {/* FPC Connector for Camera */}
            <group position={[0, 0.8, 12]}>
              <mesh castShadow position={[0, 1, 0]}>
                <boxGeometry args={[12, 2, 3]} />
                <meshPhysicalMaterial color="#eab308" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.5, 1.5]}>
                <boxGeometry args={[12, 1, 1]} />
                <meshPhysicalMaterial color="#1f2937" />
              </mesh>
            </group>

            {/* OV2640 Camera Ribbon & Module */}
            <group position={[0, 2, 12]}>
              {/* Flex Cable */}
              <mesh position={[0, 1, -1]}>
                <boxGeometry args={[10, 0.2, 8]} />
                <meshPhysicalMaterial
                  color="#e4c596"
                  clearcoat={0.5}
                  clearcoatRoughness={0.3}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 2, -5.5]} rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[10, 0.2, 12]} />
                <meshPhysicalMaterial
                  color="#e4c596"
                  clearcoat={0.5}
                  clearcoatRoughness={0.3}
                  roughness={0.5}
                />
              </mesh>

              {/* Camera Sensor Head */}
              <group position={[0, 5, -8]} rotation={[Math.PI / 6, 0, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[10, 2, 10]} />
                  <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
                </mesh>
                <mesh position={[0, 2, 0]}>
                  <cylinderGeometry args={[4, 4, 3, 24]} />
                  <meshPhysicalMaterial color="#0f172a" />
                </mesh>
                {/* Lens Crystal */}
                <mesh position={[0, 3.6, 0]}>
                  <cylinderGeometry args={[2, 2, 0.5, 24]} />
                  <meshPhysicalMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.6}
                    clearcoat={1}
                    transmission={0.9}
                    ior={1.6}
                  />
                </mesh>
                <mesh position={[0, 3.6, 0]}>
                  <cylinderGeometry args={[1, 1, 0.6, 24]} />
                  <meshPhysicalMaterial
                    color="#111"
                    roughness={0.6}
                    clearcoat={0.3}
                    clearcoatRoughness={0.8}
                  />
                </mesh>
              </group>
            </group>

            {/* High Power Flash LED */}
            <group position={[0, 0.8, -1]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[5, 1, 5]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[2, 2, 1, 16]} />
                <meshPhysicalMaterial
                  color="#fef08a"
                  emissive={isActive ? "#fef08a" : "black"}
                  emissiveIntensity={isActive ? 15 : 0}
                />
              </mesh>
            </group>

            {/* Voltage Regulator & Reset Button */}
            <group position={[5, 0.8, 4]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[3, 1, 4]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
            </group>
            <group position={[6, 0.8, 8]}>
              <mesh>
                <boxGeometry args={[3, 1.5, 3]} />
                <meshPhysicalMaterial
                  color="#222"
                  roughness={0.7}
                  clearcoat={0.2}
                  clearcoatRoughness={0.7}
                />
              </mesh>
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
                <meshPhysicalMaterial color="#444" />
              </mesh>
            </group>

            {/* Headers (2x 8 Pins) */}
            <group position={[0, 0.8, 0]}>
              <mesh position={[-12.5, -3, 0]}>
                <boxGeometry args={[2, 2, 21]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <mesh position={[12.5, -3, 0]}>
                <boxGeometry args={[2, 2, 21]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              {Array.from({ length: 8 }).map((_, i) => (
                <group key={i}>
                  <mesh position={[-12.5, -5, -8.89 + i * 2.54]}>
                    <boxGeometry args={[0.6, 6, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[12.5, -5, -8.89 + i * 2.54]}>
                    <boxGeometry args={[0.6, 6, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        );

      case "esp32":
        return (
          <group position={[0, 2, 5]}>
            <mesh
              castShadow
              receiveShadow
              position={[0, -0.8, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <extrudeGeometry
                args={[
                  espShapeData,
                  {
                    depth: 1.6,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.1,
                    bevelSegments: 2,
                  },
                ]}
              />
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.3}
                clearcoat={0.3}
              />
            </mesh>

            <gridHelper
              args={[28, 54, "#1e293b", "#1e293b"]}
              position={[0, 0.81, 0]}
            />

            <group position={[0, 0.8, -8]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[18, 3, 24]} />
                <meshPhysicalMaterial
                  color="#e2e8f0"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.2}
                />
              </mesh>
              <Text
                position={[0, 3.01, -3]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.6}
                color="#444"
                fontStyle="italic"
                letterSpacing={0.1}
              >
                ESPRESSIF
              </Text>
              <Text
                position={[0, 3.01, 3]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.2}
                color="#444"
                fontWeight="bold"
              >
                ESP32-WROOM-32
              </Text>
              <Text
                position={[0, 3.01, 6]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.8}
                color="#666"
              >
                Wi-Fi + BT + BLE
              </Text>
            </group>

            <group position={[0, 0.8, -23]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[24, 1.1, 8]} />
                <meshPhysicalMaterial color="#1e293b" />
              </mesh>
              {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[-8.8 + i * 3.5, 1.1, 0]}>
                  <boxGeometry args={[1, 0.1, 6]} />
                  <meshPhysicalMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={"t" + i} position={[-7 + i * 3.5, 1.1, -2.5]}>
                  <boxGeometry args={[3, 0.1, 1]} />
                  <meshPhysicalMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={"b" + i} position={[-7 + i * 3.5, 1.1, 2.5]}>
                  <boxGeometry args={[3, 0.1, 1]} />
                  <meshPhysicalMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
              ))}
            </group>

            <group position={[0, 0.8, 0]}>
              <IC_SMD position={[0, 1, 14]} pins={16} length={5} width={5} />

              <group position={[0, 1.5, 25]}>
                <mesh castShadow>
                  <boxGeometry args={[8, 3, 6]} />
                  <meshPhysicalMaterial
                    color="#cbd5e1"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    roughness={0.1}
                  />
                </mesh>
                <mesh position={[0, 0, 2]}>
                  <boxGeometry args={[6, 1.5, 4]} />
                  <meshPhysicalMaterial
                    color="#111"
                    roughness={0.6}
                    clearcoat={0.3}
                    clearcoatRoughness={0.8}
                  />
                </mesh>
              </group>

              <group position={[-7, 1, 20]}>
                <mesh>
                  <boxGeometry args={[3, 2, 3]} />
                  <meshPhysicalMaterial
                    color="#222"
                    roughness={0.7}
                    clearcoat={0.2}
                    clearcoatRoughness={0.7}
                  />
                </mesh>
                <mesh position={[0, 1, 0]}>
                  <cylinderGeometry args={[1.2, 1.2, 0.5, 16]} />
                  <meshPhysicalMaterial color="#444" />
                </mesh>
                <Text
                  position={[0, 1.1, -3]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={1}
                  color="#aaa"
                >
                  EN
                </Text>
              </group>
              <group position={[7, 1, 20]}>
                <mesh>
                  <boxGeometry args={[3, 2, 3]} />
                  <meshPhysicalMaterial
                    color="#222"
                    roughness={0.7}
                    clearcoat={0.2}
                    clearcoatRoughness={0.7}
                  />
                </mesh>
                <mesh position={[0, 1, 0]}>
                  <cylinderGeometry args={[1.2, 1.2, 0.5, 16]} />
                  <meshPhysicalMaterial color="#444" />
                </mesh>
                <Text
                  position={[0, 1.1, -3]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={1}
                  color="#aaa"
                >
                  BOOT
                </Text>
              </group>

              <group position={[5, 1, 12]}>
                <mesh>
                  <boxGeometry args={[3, 1, 2]} />
                  <meshPhysicalMaterial
                    color="#111"
                    roughness={0.6}
                    clearcoat={0.3}
                    clearcoatRoughness={0.8}
                  />
                </mesh>
              </group>

              <Capacitor_SMD position={[7, 1, 15]} />
              <Capacitor_SMD position={[7, 1, 13.5]} />
              <Resistor_SMD
                position={[4, 1, 14]}
                rotation={[0, Math.PI / 2, 0]}
              />

              <mesh position={[-4, 1, 13]}>
                <boxGeometry args={[1.5, 0.5, 1]} />
                <meshPhysicalMaterial
                  color="#fff"
                  emissive="#ef4444"
                  emissiveIntensity={isActive ? 10 : 0}
                />
              </mesh>
              <mesh position={[-4, 1, 10]}>
                <boxGeometry args={[1.5, 0.5, 1]} />
                <meshPhysicalMaterial
                  color="#fff"
                  emissive="#3b82f6"
                  emissiveIntensity={isActive ? 10 : 0}
                />
              </mesh>
            </group>

            <group position={[0, 0.8, 0]}>
              <mesh position={[-13, 1, 0]}>
                <boxGeometry args={[2, 2, 51]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <mesh position={[13, 1, 0]}>
                <boxGeometry args={[2, 2, 51]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              {Array.from({ length: 19 }).map((_, i) => (
                <group key={i}>
                  <mesh position={[-13, -3, -22.86 + i * 2.54]}>
                    <boxGeometry args={[0.6, 9, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[13, -3, -22.86 + i * 2.54]}>
                    <boxGeometry args={[0.6, 9, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        );
      case "raspberry_pi":
        return (
          <group position={[0, 2, 0]}>
            <mesh
              castShadow
              receiveShadow
              position={[0, -0.8, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <extrudeGeometry
                args={[
                  rpiShapeData,
                  {
                    depth: 1.6,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.1,
                    bevelSegments: 2,
                  },
                ]}
              />
              <meshPhysicalMaterial
                color="#115e2e"
                roughness={0.4}
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry
                args={[rpiShapeData, { depth: 0.1, bevelEnabled: false }]}
              />
              <meshBasicMaterial color="#15803d" transparent opacity={0.6} />
            </mesh>

            <gridHelper
              args={[85, 85, "#15803d", "#15803d"]}
              position={[0, 0.81, 0]}
            />

            <Text
              position={[0, 0.82, -15]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={2.5}
              color="#fff"
              fontWeight="bold"
            >
              Raspberry Pi 4 Model B
            </Text>
            <Text
              position={[0, 0.82, -10]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.2}
              color="#fff"
            >
              (c) Raspberry Pi (Trading) Ltd
            </Text>

            <group position={[0, 0.8, 0]}>
              <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[14, 2, 14]} />
                <meshPhysicalMaterial color="#1a1c23" />
              </mesh>
              <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[12, 12]} />
                <meshPhysicalMaterial
                  color="#222"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.6}
                />
              </mesh>
              <Text
                position={[0, 2.15, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.5}
                color="#aaa"
                fontWeight="bold"
              >
                BROADCOM
              </Text>
              <Text
                position={[0, 2.15, 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1}
                color="#888"
              >
                BCM2711
              </Text>
            </group>

            <group position={[-15, 0.8, 12]}>
              <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[11, 2, 15]} />
                <meshPhysicalMaterial
                  color="#141414"
                  roughness={0.7}
                  metalness={0.9}
                  clearcoat={0.15}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <Text
                position={[0, 2.1, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.2}
                color="#666"
              >
                SEC
              </Text>
            </group>

            <IC_SMD position={[-25, 0.8, 0]} pins={48} length={9} width={9} />
            <IC_SMD position={[15, 0.8, -10]} pins={64} length={8} width={8} />

            <mesh position={[-30, 0.8, -20]} castShadow>
              <boxGeometry args={[12, 2, 10]} />
              <meshPhysicalMaterial
                color="#e2e8f0"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.3}
              />
            </mesh>
            <Text
              position={[-30, 1.9, -20]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1}
              color="#444"
            >
              CYW43455
            </Text>

            <mesh position={[-38, 0.81, -20]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 10]} />
              <meshPhysicalMaterial
                color="#e4c596"
                roughness={0.5}
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            <group position={[0, 0.8, -26]}>
              <mesh position={[0, 2.5, 0]} castShadow>
                <boxGeometry args={[51, 5, 5]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              {Array.from({ length: 20 }).map((_, i) => (
                <group key={i}>
                  <mesh position={[-23.75 + i * 2.5, 6, -1.27]}>
                    <boxGeometry args={[0.6, 8, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[-23.75 + i * 2.5, 6, 1.27]}>
                    <boxGeometry args={[0.6, 8, 0.6]} />
                    <meshPhysicalMaterial
                      color="#fbbf24"
                      metalness={0.9}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>

            <group position={[34, 0.8, 15]}>
              <mesh position={[0, 8, 0]} castShadow>
                <boxGeometry args={[15, 16, 13]} />
                <meshPhysicalMaterial
                  color="#94a3b8"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[7.6, 6, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[12, 2]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <mesh position={[7.6, 12, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[12, 2]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
            </group>

            <group position={[34, 0.8, -2]}>
              <mesh position={[0, 8, 0]} castShadow>
                <boxGeometry args={[15, 16, 13]} />
                <meshPhysicalMaterial
                  color="#94a3b8"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[7.6, 6, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[12, 2]} />
                <meshPhysicalMaterial color="#2563eb" />
              </mesh>
              <mesh position={[7.6, 12, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[12, 2]} />
                <meshPhysicalMaterial color="#2563eb" />
              </mesh>
            </group>

            <group position={[34, 0.8, -19]}>
              <mesh position={[0, 7.5, 0]} castShadow>
                <boxGeometry args={[18, 15, 14]} />
                <meshPhysicalMaterial
                  color="#94a3b8"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[9.1, 12, -4]}>
                <boxGeometry args={[0.1, 1, 2]} />
                <meshPhysicalMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={isActive ? 2 : 0}
                />
              </mesh>
              <mesh position={[9.1, 12, 4]}>
                <boxGeometry args={[0.1, 1, 2]} />
                <meshPhysicalMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={isActive ? 2 : 0}
                />
              </mesh>
            </group>

            <group position={[-15, 0.8, 26]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[8, 3, 6]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[0, 1.5, 3]}>
                <boxGeometry args={[6, 1, 2]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
            </group>
            <group position={[-3, 0.8, 26]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[8, 3, 6]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[0, 1.5, 3]}>
                <boxGeometry args={[6, 1, 2]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
            </group>

            <group position={[-32, 0.8, 26]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[9, 3, 7]} />
                <meshPhysicalMaterial
                  color="#cbd5e1"
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh position={[0, 1.5, 3]}>
                <boxGeometry args={[5, 1, 3]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
            </group>

            <group position={[12, 0.8, 26]}>
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[7, 6, 9]} />
                <meshPhysicalMaterial
                  color="#111"
                  roughness={0.6}
                  clearcoat={0.3}
                  clearcoatRoughness={0.8}
                />
              </mesh>
              <mesh position={[0, 3, 4.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2, 2, 1, 16]} />
                <meshPhysicalMaterial color="#cbd5e1" />
              </mesh>
            </group>

            <mesh position={[-15, 0.8, -10]} castShadow>
              <boxGeometry args={[3, 4, 18]} />
              <meshPhysicalMaterial
                color="#111"
                roughness={0.6}
                clearcoat={0.3}
                clearcoatRoughness={0.8}
              />
            </mesh>
            <mesh position={[10, 0.8, -20]} castShadow>
              <boxGeometry args={[3, 4, 18]} />
              <meshPhysicalMaterial
                color="#111"
                roughness={0.6}
                clearcoat={0.3}
                clearcoatRoughness={0.8}
              />
            </mesh>

            <mesh position={[-38, 0.8, 15]}>
              <boxGeometry args={[1.5, 0.5, 1]} />
              <meshPhysicalMaterial
                color="#fff"
                emissive="#ef4444"
                emissiveIntensity={isActive ? 10 : 0}
              />
            </mesh>
            <mesh position={[-38, 0.8, 13]}>
              <boxGeometry args={[1.5, 0.5, 1]} />
              <meshPhysicalMaterial
                color="#fff"
                emissive="#22c55e"
                emissiveIntensity={isActive ? 10 : 0}
              />
            </mesh>

            <Resistor_SMD position={[-20, 0.8, -2]} />
            <Capacitor_SMD position={[-22, 0.8, -4]} />
            <Resistor_SMD position={[-24, 0.8, -2]} />
            <Capacitor_SMD position={[5, 0.8, 12]} />
            <Capacitor_SMD position={[8, 0.8, 12]} />
            <Resistor_SMD position={[10, 0.8, 15]} />
          </group>
        );

      case "oled":
        return (
          <group position={[0, 4, 15]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[88, 4, 88]} />
              <meshPhysicalMaterial color="#001a33" roughness={0.8} />
            </mesh>
            <mesh position={[0, 2.5, 6]}>
              <boxGeometry args={[75, 4, 50]} />
              <meshPhysicalMaterial
                color="#000"
                metalness={0.9}
                clearcoatRoughness={0.1}
                roughness={0.1}
                clearcoat={1.0}
              />
            </mesh>
            {isActive && !isBroken && (
              <mesh position={[0, 4.6, 6]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[73, 48]} />
                <meshPhysicalMaterial
                  color="#38bdf8"
                  emissive="#38bdf8"
                  emissiveIntensity={1}
                />
              </mesh>
            )}
            <mesh position={[0, 2.5, -28]}>
              <boxGeometry args={[44, 2, 10]} />
              <meshPhysicalMaterial color="#111" />
            </mesh>
            {/* Pins at z = 40 (which makes it 55 in global if group is at 15) */}
            {[-22, -7.3, 7.3, 22].map((x, i) => (
              <mesh key={i} position={[x, -4, 40]}>
                <cylinderGeometry args={[2, 2, 8]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        );
      case "seven_segment":
        return (
          <group position={[15, 4, 16]}>
            {/* Realistic 7-Segment Display (Kingbright style) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[26, 8, 38]} />
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.8}
                clearcoat={0.1}
              />
            </mesh>
            {/* Black / Gray Face */}
            <mesh position={[0, 4.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[22, 34]} />
              <meshPhysicalMaterial color="#18181b" roughness={0.8} />
            </mesh>
            <Text
              position={[0, 4.11, -15]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.4}
              color="#52525b"
            >
              HDSP-3901
            </Text>

            {/* Glowing Segments */}
            {isActive && !isBroken && (
              <group position={[0, 4.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[0, 12, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>
                <mesh position={[0, -12, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>

                <mesh position={[-5, 6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>
                <mesh position={[5, 6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>

                <mesh position={[-5, -6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>
                <mesh position={[5, -6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>

                <mesh position={[8, -14, 0]}>
                  <boxGeometry args={[2.5, 2.5, 0.1]} />
                  <meshPhysicalMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={4}
                    clearcoat={1}
                  />
                </mesh>
                <pointLight color="#ef4444" intensity={2} distance={20} />
              </group>
            )}
            {/* Inactive / Broken Segments (Ghosting effect) */}
            {(!isActive || isBroken) && (
              <group position={[0, 4.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[0, 12, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[0, -12, 0]}>
                  <boxGeometry args={[10, 2, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[-5, 6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[5, 6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[-5, -6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[5, -6, 0]}>
                  <boxGeometry args={[2, 10, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
                <mesh position={[8, -14, 0]}>
                  <boxGeometry args={[2.5, 2.5, 0.1]} />
                  <meshPhysicalMaterial color="#3f1a1a" />
                </mesh>
              </group>
            )}

            {/* Pins */}
            {[-12, -6, 0, 6, 12].map((z) => (
              <group key={z}>
                <mesh position={[-11, -5, z]}>
                  <cylinderGeometry args={[0.3, 0.3, 6]} />
                  <meshPhysicalMaterial
                    color="#cbd5e1"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
                <mesh position={[11, -5, z]}>
                  <cylinderGeometry args={[0.3, 0.3, 6]} />
                  <meshPhysicalMaterial
                    color="#cbd5e1"
                    metalness={0.9}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      case "voltmeter":
      case "ammeter":
      case "multimeter":
        return (
          <group position={[20, 8, 15]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[40, 16, 30]} />
              <meshPhysicalMaterial
                color={
                  type === "voltmeter"
                    ? "#0284c7"
                    : type === "multimeter"
                      ? "#eab308"
                      : "#ea580c"
                }
                roughness={0.7}
              />
            </mesh>
            {/* Screen */}
            <mesh position={[0, 8.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[30, 16]} />
              <meshPhysicalMaterial color="#d4d4d8" />
            </mesh>
            {/* Text/Reading simulation */}
            <mesh position={[0, 8.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[10, 6]} />
              <meshPhysicalMaterial color="#000" />
            </mesh>
            {/* Terminals */}
            <mesh position={[-10, 8, 10]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial color="#ef4444" />
            </mesh>
            <mesh position={[10, 8, 10]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial
                color="#111"
                roughness={0.6}
                clearcoat={0.3}
                clearcoatRoughness={0.8}
              />
            </mesh>
          </group>
        );
      case "oscilloscope":
        return (
          <group position={[0, 20, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[80, 40, 60]} />
              <meshPhysicalMaterial color="#e2e8f0" roughness={0.8} />
            </mesh>
            {/* Screen bezel */}
            <mesh position={[-15, 0, -31]}>
              <boxGeometry args={[44, 30, 2]} />
              <meshPhysicalMaterial color="#1e293b" />
            </mesh>
            {/* Screen */}
            <mesh position={[-15, 0, -32.1]}>
              <planeGeometry args={[40, 26]} />
              <meshPhysicalMaterial color="#111827" />
            </mesh>
            {/* Waveform active */}
            {isActive && (
              <>
                <mesh position={[-15, 0, -32.2]}>
                  <planeGeometry args={[30, 14]} />
                  <meshPhysicalMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={2}
                    wireframe
                    transparent
                    opacity={0.1}
                  />
                </mesh>
                <OscilloscopeScreen3D id={id} isActive={isActive} customProps={customProps} />
              </>
            )}
            {/* Knobs */}
            <mesh position={[20, 5, -30]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[3, 3, 4]} />
              <meshPhysicalMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[30, 5, -30]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial color="#94a3b8" />
            </mesh>
            {/* Probes/Pins mapping to pinmap (Z=40, X=-20, X=20) */}
            <mesh position={[-20, -10, 31]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[-20, -20, 40]}>
              <cylinderGeometry args={[0.3, 0.3, 20]} />
              <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[20, -10, 31]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 4]} />
              <meshPhysicalMaterial
                color="silver"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[20, -20, 40]}>
              <cylinderGeometry args={[0.3, 0.3, 20]} />
              <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        );

      case "ground":
        return null; // Ground is usually implicit or just a trace/symbol
      default:
        return (
          <group position={[25, 4, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[8, 8, 8]} />
              <meshPhysicalMaterial
                color={isActive ? "#3b82f6" : "#1e293b"}
                emissive={isActive ? "#3b82f6" : "#000000"}
                emissiveIntensity={isActive ? 2 : 0}
                roughness={0.8}
              />
            </mesh>
            <mesh position={[-6, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 4]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[6, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 4]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[0, 4.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[6, 6]} />
              <meshPhysicalMaterial color="#334155" />
            </mesh>
            {isActive && !isBroken && (
              <pointLight color="#3b82f6" intensity={1} distance={20} />
            )}
          </group>
        );
        return (
          <group position={[25, 4, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[8, 8, 8]} />
              <meshPhysicalMaterial
                color={isActive ? "#3b82f6" : "#1e293b"}
                emissive={isActive ? "#3b82f6" : "#000000"}
                emissiveIntensity={isActive ? 2 : 0}
                roughness={0.8}
              />
            </mesh>
            <mesh position={[-6, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 4]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[6, -5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 4]} />
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh position={[0, 4.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[6, 6]} />
              <meshPhysicalMaterial color="#334155" />
            </mesh>
            {isActive && !isBroken && (
              <pointLight color="#3b82f6" intensity={1} distance={20} />
            )}
          </group>
        );
    }
  };

  return <group ref={groupRef}>{getMeshes()}</group>;
}
