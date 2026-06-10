const fs = require('fs');
let code = fs.readFileSync('src/components/Meshes3D.tsx', 'utf-8');

// Ensure THREE is imported
if (!code.includes("import * as THREE from 'three'")) {
  code = code.replace(
    'import { useFrame } from "@react-three/fiber";',
    'import { useFrame } from "@react-three/fiber";\nimport * as THREE from "three";'
  );
}

// Add realistic board helper components before HighQualityMesh
const helpers = fs.readFileSync('fix-microcontrollers.cjs', 'utf-8');
const helpersBlock = helpers.split('const helpers = `')[1].split('`;')[0].trim();

if (!code.includes("function IC_SMD")) {
  code = code.replace(
    'export function HighQualityMesh',
    helpersBlock + '\nexport function HighQualityMesh'
  );
}

// Modify Arduino Uno
const oldArduinoRegex = /case "arduino_uno":[\s\S]*?(?=case "esp32":)/g;
const patchUno = fs.readFileSync('patch-uno.txt', 'utf-8');
code = code.replace(oldArduinoRegex, patchUno + '\n');

// Modify Raspberry Pi
const oldPiRegex = /case "raspberry_pi":[\s\S]*?(?=case "oled":|case "relay_module":)/g;
const patchPi = fs.readFileSync('patch-rpi.txt', 'utf-8');
code = code.replace(oldPiRegex, patchPi + '\n');

// Modify ESP32
const oldEspRegex = /case "esp32":[\s\S]*?(?=case "raspberry_pi":)/g;
const patchEsp = fs.readFileSync('patch-esp.txt', 'utf-8');
code = code.replace(oldEspRegex, patchEsp + '\n');

fs.writeFileSync('src/components/Meshes3D.tsx', code, 'utf-8');
console.log('Successfully updated Meshes3D.tsx');
