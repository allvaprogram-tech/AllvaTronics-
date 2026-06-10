import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasViewer3D.tsx', 'utf-8');

   const componentDef = `
export function PcbPcbComponentItem({ cx, cz, rot, layer, compType, schType, isActive }: any) {
  const groupRef = React.useRef<any>();
  useFrame(({ clock }) => {
     if (!groupRef.current) return;
     if (isActive && schType === 'motor') {
        const time = clock.getElapsedTime();
        const mesh = groupRef.current.getObjectByName('motorShaft');
        if (mesh) mesh.rotation.x = time * 20;
     }
     if (isActive && schType === 'buzzer') {
        const t = clock.getElapsedTime();
        groupRef.current.position.x = cx + Math.sin(t * 100) * 0.5;
        groupRef.current.position.z = cz + Math.cos(t * 100) * 0.5;
     } else {
        groupRef.current.position.x = cx;
        groupRef.current.position.z = cz;
     }
  });

  let Component3D = null;
  // Professional 3D Models for PCB footprints
  if (compType === 'dip8' || compType === 'sop') {
      Component3D = (
        <group position={[0, 1.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, 3, 10]} />
            <meshStandardMaterial color="#1a1c1e" roughness={0.8} metalness={0.2} />
          </mesh>
          <mesh position={[4, -1.0, 0]}>
            <boxGeometry args={[2, 3, 9]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-4, -1.0, 0]}>
            <boxGeometry args={[2, 3, 9]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      );
   } else if (compType === 'qfp' || compType === 'bga') {
      Component3D = (
        <group position={[0, 1.1, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[14, 2, 14]} />
            <meshStandardMaterial color="#222" roughness={0.8} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1, -5]} rotation={[-Math.PI/2, 0, 0]}>
             <circleGeometry args={[0.5, 16]} />
             <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[16, 0.2, 16]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      );
   } else if (compType === 'cr2032') {
      Component3D = (
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[10, 10, 3, 32]} />
          <meshStandardMaterial color="#b0b4b8" metalness={0.9} roughness={0.2} />
        </mesh>
      );
   } else if (compType === 'crystal') {
      Component3D = (
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 5, 4]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
      );
   } else if (compType === 'smd') {
      // Small LEDs, Resistors, etc.
      let color = "#fcd34d";
      if (schType === 'led' && isActive) {
         color = "#ef4444"; // red LED glowing
      } else if (schType === 'led') {
         color = "#450a0a"; // off LED
      } else if (schType === 'resistor') {
         color = "#000000"; // smd resistor
      } else if (schType === 'capacitor') {
         color = "#8b5a2b"; // smd cap
      }
      
      Component3D = (
        <group position={[0, 0.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 1, 1.5]} />
            <meshStandardMaterial color={color} emissive={schType === 'led' && isActive ? '#ef4444' : 'black'} emissiveIntensity={isActive && schType === 'led' ? 2 : 0} roughness={0.6} />
          </mesh>
          <mesh position={[1.5, -0.4, 0]}>
            <boxGeometry args={[1, 0.2, 1.5]} />
            <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-1.5, -0.4, 0]}>
            <boxGeometry args={[1, 0.2, 1.5]} />
            <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
          </mesh>
          {schType === 'led' && isActive && (
             <pointLight color="#ef4444" intensity={2} distance={30} position={[0, 2, 0]} />
          )}
        </group>
      );
   } else if (compType === 'sot23') {
      Component3D = (
        <group position={[0, 1, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 2, 1.5]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
          <mesh position={[1.5, -0.8, -0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="silver" metalness={0.8} />
          </mesh>
          <mesh position={[1.5, -0.8, 0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="silver" metalness={0.8} />
          </mesh>
          <mesh position={[-1.5, -0.8, 0]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="silver" metalness={0.8} />
          </mesh>
        </group>
      );
   } else if (compType === 'pinheader') {
      Component3D = (
        <group position={[0, 1, 0]}>
          <mesh castShadow receiveShadow position={[0, 1, 0]}>
            <boxGeometry args={[8, 2, 3]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
          {[-3, 0, 3].map((pos, i) => (
            <mesh key={i} position={[pos, 3, 0]}>
              <boxGeometry args={[0.6, 6, 0.6]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      );
   } else if (compType === 'pad' || compType === 'via') {
      // For Pad that might be a THT component (like LED, Capacitor, Buzzer)
      let innerComponent = null;
      if (compType === 'pad' && schType === 'led') {
         innerComponent = (
           <mesh position={[0, 4, 0]}>
             <cylinderGeometry args={[2, 2, 4, 16]} />
             <meshStandardMaterial color={isActive ? '#3b82f6' : '#1e1b4b'} emissive={isActive ? '#3b82f6' : 'black'} emissiveIntensity={isActive ? 2 : 0} transparent opacity={0.8} />
             {isActive && <pointLight color="#3b82f6" intensity={2} distance={30} position={[0, 2, 0]} />}
           </mesh>
         );
      } else if (compType === 'pad' && schType === 'capacitor_elec') {
         innerComponent = (
           <mesh position={[0, 4, 0]}>
             <cylinderGeometry args={[3, 3, 8, 16]} />
             <meshStandardMaterial color="#1a1c1e" metalness={0.3} roughness={0.8} />
             <mesh position={[0, 4, 0]}>
               <cylinderGeometry args={[3.1, 3.1, 0.5, 16]} />
               <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
             </mesh>
           </mesh>
         );
      } else if (compType === 'pad' && schType === 'buzzer') {
         innerComponent = (
           <group>
             <mesh position={[0, 4, 0]}>
               <cylinderGeometry args={[5, 5, 6, 16]} />
               <meshStandardMaterial color="#111827" />
             </mesh>
             <mesh position={[0, 7.1, 0]}>
               <circleGeometry args={[2, 16]} />
               <meshStandardMaterial color="#000" />
             </mesh>
           </group>
         );
      } else if (compType === 'pad' && schType === 'motor') {
         innerComponent = (
           <group>
             {/* motor case */}
             <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[5, 5, 10, 16]} />
                <meshStandardMaterial color="silver" metalness={0.8} roughness={0.3} />
             </mesh>
             {/* motor shaft */}
             <mesh name="motorShaft" position={[6, 5, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[1, 1, 6, 16]} />
                <meshStandardMaterial color="#fff" metalness={0.9} roughness={0.1} />
                <mesh position={[0, 3, 0]}>
                   <boxGeometry args={[4, 1, 1]} />
                   <meshStandardMaterial color="orange" />
                </mesh>
             </mesh>
           </group>
         );
      }
      
      Component3D = (
        <group>
          <mesh position={[0, compType==='via' ? -0.8 : 0, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[compType==='via'?1:2, compType==='via'?1:2, compType==='via'? 1.8 : 0.1, 16]} />
            <meshStandardMaterial color="#c5b358" metalness={0.8} roughness={0.3} />
          </mesh>
          {innerComponent}
        </group>
      );
   } else {
      Component3D = (
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 2, 5]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
      );
   }

  return (
      <group ref={groupRef} position={[cx, layer === 'bottom' ? -2.8 : -1.2, cz]} rotation={[layer === 'bottom' ? Math.PI : 0, -rot, 0]}>
        {Component3D}
      </group>
  );
}
`;
   
if (!code.includes('export function PcbPcbComponentItem')) {
    code = code + '\n' + componentDef;
}
fs.writeFileSync('src/components/CanvasViewer3D.tsx', code);
console.log("Updated PCB Component Viewer correctly");
