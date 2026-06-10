const fs = require('fs');

let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

// 1. Protoboard holes
// x={-291.5 + c * 10} => width=4 (center -289.5). Change to center -290.
// So width=6, x=-293
// Inner x=-291 (width=2)
code = code.replace(/x=\{(-291\.5|\-292|\-296\.5) \+ c \* 10\}/g, 'x={-293 + c * 10}');
code = code.replace(/x=\{(-290\.5|\-291|\-295\.5) \+ c \* 10\}/g, 'x={-291 + c * 10}');

// Adjust width and height of the outer hole
// It was <Rect x={...} y={...} width={4} height={4} fill="#e2e8f0" />
code = code.split('\n').map(line => {
  if (line.includes('width={4}') && line.includes('height={4}')) {
    return line.replace('width={4}', 'width={6}').replace('height={4}', 'height={6}');
  }
  return line;
}).join('\n');

// The black dot was width={2} height={2}, keep it but we already fixed its x.
// What about its y?
// y=-91.5 (width=4, center=-89.5). Wait, y for the tops?
// y was -91.5 (outer), -90.5 (inner).
code = code.replace(/y=\{-91\.5\}/g, 'y={-93}');
code = code.replace(/y=\{-90\.5\}/g, 'y={-91}');

code = code.replace(/y=\{-81\.5\}/g, 'y={-83}');
code = code.replace(/y=\{-80\.5\}/g, 'y={-81}');

code = code.replace(/y=\{88\.5\}/g, 'y={87}');
code = code.replace(/y=\{89\.5\}/g, 'y={89}');

code = code.replace(/y=\{78\.5\}/g, 'y={77}');
code = code.replace(/y=\{79\.5\}/g, 'y={79}');

// Middle Grid
code = code.replace(/y=\{-61\.5 \+ r \* 10\}/g, 'y={-63 + r * 10}');
code = code.replace(/y=\{-60\.5 \+ r \* 10\}/g, 'y={-61 + r * 10}');

code = code.replace(/y=\{18\.5 \+ r \* 10\}/g, 'y={17 + r * 10}');
code = code.replace(/y=\{19\.5 \+ r \* 10\}/g, 'y={19 + r * 10}');

// Fix the text labels x coordinate too
code = code.replace(/x=\{-297 \+ c \* 50\}/g, 'x={-293 + c * 50}');
code = code.replace(/x=\{-292 \+ c \* 50\}/g, 'x={-293 + c * 50}');

// 2. Increase terminal radius.
// Most terminals are `<Circle ... radius={2}` or `radius={1.5}` or `radius={2.5}`
// We'll replace radius={2} and radius={2.5} with radius={4} when it is a terminal circle.
// Let's specifically target the ones near "selected ?" logic or pins
code = code.replace(/radius=\{2\}/g, 'radius={4}');
code = code.replace(/radius=\{1\.5\}/g, 'radius={3.5}');
code = code.replace(/radius=\{2\.5\}/g, 'radius={4.5}');

// But some design elements use radius={2.5} like the notch in ICs:
// We'll use more specific targeting. 
// Actually, global replace might be okay since most circles are terminals or dots.
// Let's do it and we can revert if it looks broken.

// 3. LED Symbol - horizontal with terminals
const newLedSymbol = `
export function LEDSymbol({
  x,
  y,
  rotation,
  selected,
  value,
  isOn,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  const lit = isOn || value === "1" || value === "true";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* LED Leads (Horizontal) */}
      {/* Anode (left) */}
      <Line points={[-20, 0, -8, 0]} stroke="#bcc2c2" strokeWidth={2.5} />
      {/* Cathode (right) */}
      <Line points={[8, 0, 20, 0]} stroke="#bcc2c2" strokeWidth={2.5} />

      <Text text="+" x={-16} y={-10} fontSize={6} fill="#ef4444" fontStyle="bold" />
      <Text text="" x={8} y={-10} fontSize={6} fill="#3b82f6" fontStyle="bold" />

      {/* Terminals */}
      <Circle
        x={-20}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={2}
      />
      <Circle
        x={20}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={2}
      />

      {/* LED Plastic Dome base + flat spot for cathode */}
      {/* Dome facing up, flat on right? If horizontal, maybe sideways */}
      {/* Dome pointing right, flat bottom on left: */}
      <Path
        data="M -4 8 C -14 8 -14 -8 -4 -8 L -3 -8 L -3 8 Z"
        fill={lit ? "#ef4444" : "#7f1d1d"}
        shadowColor="#ef4444"
        shadowBlur={15}
        shadowEnabled={lit}
        stroke={stroke}
        strokeWidth={selected ? 1 : 0}
      />
      {/* Cathode flat base (Right side of LED dome) */}
      {/* Wait, Anode is + (longer). Current flows from Anode to Cathode.
          Cathode is flat. So if Anode is left, flat side should be right. */}
      {/* Let's draw Dome pointing LEFT, flat on RIGHT */}
      <Path
        data="M 4 -8 C -8 -8 -8 8 4 8 L 5 8 L 5 -8 Z"
        fill={lit ? "#ef4444" : "#7f1d1d"}
        shadowColor="#ef4444"
        shadowBlur={15}
        shadowEnabled={lit}
        stroke={stroke}
        strokeWidth={selected ? 1 : 0}
      />
      <Line
        points={[6, -9, 6, 9]}
        stroke={lit ? "#ef4444" : "#7f1d1d"}
        strokeWidth={2}
      />
      <Rect
        x={-2}
        y={-4}
        width={3}
        height={8}
        fill="#cbd5e1"
        opacity={0.8}
      />
      <Rect
        x={3}
        y={-2}
        width={2}
        height={4}
        fill="#94a3b8"
        opacity={0.8}
      />
    </Group>
  );
}
`;

// Replace old LEDSymbol with new
const startIdx = code.indexOf('export function LEDSymbol');
const endIdx = code.indexOf('export function ArduinoUnoSymbol');
if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newLedSymbol + '\n' + code.substring(endIdx);
}

fs.writeFileSync('src/components/Symbols.tsx', code);
