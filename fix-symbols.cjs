const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

// Resistor: Replace -25 and 25 with -30 and 30
code = code.replace(/<Line points={\[-25, 0, -12, 0\]}/, '<Line points={[-30, 0, -12, 0]}');
code = code.replace(/<Line points={\[12, 0, 25, 0\]}/, '<Line points={[12, 0, 30, 0]}');
code = code.replace(/<Circle[\s]+x={-25}/s, '<Circle\n        x={-30}');
code = code.replace(/<Circle[\s]+x={25}/s, '<Circle\n        x={30}');

// Capacitor
code = code.replace(/<Line points={\[-15, 0, -5, 0\]}/, '<Line points={[-20, 0, -5, 0]}');
code = code.replace(/<Line points={\[5, 0, 15, 0\]}/, '<Line points={[5, 0, 20, 0]}');
code = code.replace(/<Circle[\s]+x={-15}/s, '<Circle\n        x={-20}');
code = code.replace(/<Circle[\s]+x={15}/s, '<Circle\n        x={20}');

// Capacitor Elec
code = code.replace(/<Line points={\[-5, 20, -5, 30\]}/, '<Line points={[-10, 20, -10, 30]}');
code = code.replace(/<Line points={\[5, 20, 5, 30\]}/, '<Line points={[10, 20, 10, 30]}');
// For Elec Capacitor circles there might be more complex regex
code = code.replace(/<Circle[\s]+x={-5}[\s]+y={30}/s, '<Circle\n        x={-10}\n        y={30}');
code = code.replace(/<Circle[\s]+x={5}[\s]+y={30}/s, '<Circle\n        x={10}\n        y={30}');

// Battery
code = code.replace(/points={\[-4\.5, -29, -4\.5, -40\]}/, 'points={[-7, -29, -10, -32, -10, -40]}');
code = code.replace(/points={\[4\.5, -30, 4\.5, -40\]}/, 'points={[4.5, -30, 10, -32, 10, -40]}');
code = code.replace(/<Circle\s+x={-4\.5}\s+y={-40}/s, '<Circle\n        x={-10}\n        y={-40}');
code = code.replace(/<Circle\s+x={4\.5}\s+y={-40}/s, '<Circle\n        x={10}\n        y={-40}');

// Lamp
code = code.replace(/<Line points={\[-25, 0, -10, 0\]}/, '<Line points={[-30, 0, -10, 0]}');
code = code.replace(/<Line points={\[10, 0, 25, 0\]}/, '<Line points={[10, 0, 30, 0]}');
code = code.replace(/<Circle[\s]+x={-25}/s, '<Circle\n        x={-30}');
code = code.replace(/<Circle[\s]+x={25}([\s\S]*?)y={0}/s, '<Circle\n        x={30}$1y={0}');

fs.writeFileSync('src/components/Symbols.tsx', code);
console.log("Done");
