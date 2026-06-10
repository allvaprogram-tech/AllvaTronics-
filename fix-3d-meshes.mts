import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasViewer3D.tsx', 'utf-8');

// I will redefine the components block entirely
const regex = /if \(compType === 'dip8' \|\| compType === 'sop'\) \{[\s\S]*?return \(\s*<group key=\{el\.id\}/;
const sub = `if (compType === 'dip8' || compType === 'sop') {
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
                    Component3D = (
                      <group position={[0, 0.5, 0]}>
                        <mesh castShadow receiveShadow>
                          <boxGeometry args={[3, 1, 1.5]} />
                          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
                        </mesh>
                        <mesh position={[1.5, -0.4, 0]}>
                          <boxGeometry args={[1, 0.2, 1.5]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[-1.5, -0.4, 0]}>
                          <boxGeometry args={[1, 0.2, 1.5]} />
                          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
                        </mesh>
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
                    Component3D = (
                      <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[compType==='via'?1:2, compType==='via'?1:2, 0.1, 16]} />
                        <meshStandardMaterial color="#c5b358" metalness={0.8} roughness={0.3} />
                      </mesh>
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
                  <group key={el.id}`;

code = code.replace(regex, sub);
fs.writeFileSync('src/components/CanvasViewer3D.tsx', code);
console.log("Fixed 3D meshes offsets!");
