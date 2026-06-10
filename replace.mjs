import fs from "fs";
const file = "src/components/Meshes3D.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(/cylinderGeometry args=\{\[0\.4, 0\.4,/g, "cylinderGeometry args={[0.3, 0.3,");
fs.writeFileSync(file, content);
console.log("Replaced 0.4 with 0.3");
