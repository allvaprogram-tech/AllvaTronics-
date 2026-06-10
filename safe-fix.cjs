const fs = require('fs');

let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

// 1. LED Symbol
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
      <Line points={[-20, 0, -8, 0]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[8, 0, 20, 0]} stroke="#bcc2c2" strokeWidth={2.5} />

      <Text text="+" x={-16} y={-10} fontSize={6} fill="#ef4444" fontStyle="bold" />
      <Text text="" x={8} y={-10} fontSize={6} fill="#3b82f6" fontStyle="bold" />

      {/* Terminals */}
      <Circle x={-20} y={0} radius={4} fill={selected ? selectedColor : "#e2e8f0"} stroke={selected ? selectedColor : "#94a3b8"} strokeWidth={2} />
      <Circle x={20} y={0} radius={4} fill={selected ? selectedColor : "#e2e8f0"} stroke={selected ? selectedColor : "#94a3b8"} strokeWidth={2} />

      {/* Dome */}
      <Path data="M -4 8 C -14 8 -14 -8 -4 -8 L -3 -8 L -3 8 Z" fill={lit ? "#ef4444" : "#7f1d1d"} shadowColor="#ef4444" shadowBlur={15} shadowEnabled={lit} stroke={stroke} strokeWidth={selected ? 1 : 0} />
      <Path data="M 4 -8 C -8 -8 -8 8 4 8 L 5 8 L 5 -8 Z" fill={lit ? "#ef4444" : "#7f1d1d"} shadowColor="#ef4444" shadowBlur={15} shadowEnabled={lit} stroke={stroke} strokeWidth={selected ? 1 : 0} />
      <Line points={[6, -9, 6, 9]} stroke={lit ? "#ef4444" : "#7f1d1d"} strokeWidth={2} />
      <Rect x={-2} y={-4} width={3} height={8} fill="#cbd5e1" opacity={0.8} />
      <Rect x={3} y={-2} width={2} height={4} fill="#94a3b8" opacity={0.8} />
    </Group>
  );
}
`;

const ledStart = code.indexOf('export function LEDSymbol');
const ledEnd = code.indexOf('export function ArduinoUnoSymbol');
if (ledStart > -1 && ledEnd > -1 && ledStart < ledEnd) {
    code = code.substring(0, ledStart) + newLedSymbol + '\n' + code.substring(ledEnd);
}

// 2. Protoboard Symbol
const pbStart = code.indexOf('export const ProtoboardSymbol');
if (pbStart > -1) {
    const nextStart = code.indexOf('export const USBCSymbol', pbStart) > -1 ? code.indexOf('export const USBCSymbol', pbStart) : code.indexOf('export const PCBCR2032Symbol', pbStart);
    if (nextStart > pbStart) {
        let pbCode = code.substring(pbStart, nextStart);
        
        // Fix holes to 6x6
        pbCode = pbCode.replace(/width=\{4\}/g, 'width={6}').replace(/height=\{4\}/g, 'height={6}');

        // Fix Y coords
        pbCode = pbCode.replace(/y=\{-92\}/g, 'y={-93}');
        pbCode = pbCode.replace(/y=\{-82\}/g, 'y={-83}');
        pbCode = pbCode.replace(/y=\{88\}/g, 'y={87}');
        pbCode = pbCode.replace(/y=\{78\}/g, 'y={77}');
        pbCode = pbCode.replace(/y=\{-62 \+ r \* 10\}/g, 'y={-63 + r * 10}');
        pbCode = pbCode.replace(/y=\{18 \+ r \* 10\}/g, 'y={17 + r * 10}');

        code = code.substring(0, pbStart) + pbCode + code.substring(nextStart);
    }
}

// 3. Make all radius={2} terminals bigger
code = code.replace(/radius=\{2\}/g, 'radius={4}');
code = code.replace(/radius=\{1\.5\}/g, 'radius={3.5}');

fs.writeFileSync('src/components/Symbols.tsx', code);
