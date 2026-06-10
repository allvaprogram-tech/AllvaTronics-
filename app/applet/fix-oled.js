const fs = require('fs');
let s = fs.readFileSync('src/components/Meshes3D.tsx', 'utf8');

s = s.replace(/<meshStandardMaterial color=#1e293b roughness=\{0.8\} \/>/g, '<meshStandardMaterial color="#1e293b" roughness={0.8} />');
s = s.replace(/<meshPhysicalMaterial color=#000 metalness=\{0.5\} roughness=\{0.1\} clearcoat=\{1.0\} \/>/g, '<meshPhysicalMaterial color="#000" metalness={0.5} roughness={0.1} clearcoat={1.0} />');
s = s.replace(/<meshStandardMaterial color=#38bdf8 emissive=#38bdf8 emissiveIntensity=\{1\} \/>/g, '<meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />');
s = s.replace(/<meshStandardMaterial color=#111 \/>/g, '<meshStandardMaterial color="#111" />');

fs.writeFileSync('src/components/Meshes3D.tsx', s);
