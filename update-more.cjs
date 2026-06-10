const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

const tOpamp = `export const OpampSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-12} y={-16} width={24} height={32} fill="#222" stroke={stroke} strokeWidth={2} cornerRadius={2} />
      <Circle x={-6} y={-10} radius={2} fill="#111" /> {/* Pin 1 indicator */}
      <Text text="LM741" x={-10} y={-2} fontSize={6} fill="#ccc" />
      {/* Pins - 4 per side */}
      <Rect x={-16} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={12} width={4} height={2} fill="#aaa" />
      
      <Rect x={12} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={12} width={4} height={2} fill="#aaa" />
      
      <Circle x={-16} y={-11} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={-3} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={5} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={13} radius={2} fill={selected ? selectedColor : "transparent"} />
      
      <Circle x={16} y={-11} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={-3} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={5} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={13} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const OpampSymbol = [\s\S]*?\};\n/, tOpamp + '\n');


const tLogicGate = (label) => `export const Logic${label}Symbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-12} y={-16} width={24} height={32} fill="#222" stroke={stroke} strokeWidth={2} cornerRadius={2} />
      <Circle x={-6} y={-10} radius={2} fill="#111" />
      <Text text="${label}" x={-8} y={-2} fontSize={6} fill="#ccc" />
      {/* Pins - 4 per side */}
      <Rect x={-16} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={12} width={4} height={2} fill="#aaa" />
      
      <Rect x={12} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={12} width={4} height={2} fill="#aaa" />
      
      <Circle x={-16} y={-11} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={-3} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={5} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={-16} y={13} radius={2} fill={selected ? selectedColor : "transparent"} />
      
      <Circle x={16} y={-11} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={-3} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={5} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={16} y={13} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const LogicOrSymbol = [\s\S]*?\};\n/, tLogicGate('Or') + '\n');
code = code.replace(/export const LogicNorSymbol = [\s\S]*?\};\n/, tLogicGate('Nor') + '\n');
code = code.replace(/export const LogicAndSymbol = [\s\S]*?\};\n/, tLogicGate('And') + '\n');
code = code.replace(/export const LogicNandSymbol = [\s\S]*?\};\n/, tLogicGate('Nand') + '\n');
code = code.replace(/export const LogicXorSymbol = [\s\S]*?\};\n/, tLogicGate('Xor') + '\n');

const tMeter = (label, color) => `export const ${label}Symbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-20} y={-15} width={40} height={30} fill="${color}" stroke={stroke} strokeWidth={2} cornerRadius={4} />
      <Rect x={-16} y={-10} width={32} height={12} fill="#111" />
      <Text text="0.00" x={-10} y={-8} fontSize={8} fill="#0f0" />
      
      <Line points={[-10, 15, -10, 22]} stroke="#aaa" strokeWidth={2} />
      <Line points={[10, 15, 10, 22]} stroke="#aaa" strokeWidth={2} />
      
      <Text text="+" x={-13} y={11} fontSize={6} fill="#fff" />
      <Text text="-" x={7} y={11} fontSize={6} fill="#fff" />
      
      <Circle x={-10} y={22} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={10} y={22} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const VoltmeterSymbol = [\s\S]*?\};\n/, tMeter('Voltmeter', '#e11d48') + '\n');
code = code.replace(/export const AmmeterSymbol = [\s\S]*?\};\n/, tMeter('Ammeter', '#0284c7') + '\n');

const tBuzzer = `export const BuzzerSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={12} fill="#111" stroke={stroke} strokeWidth={2} />
      <Circle x={0} y={0} radius={6} fill="#222" />
      <Circle x={0} y={0} radius={2} fill="#333" />
      
      <Line points={[-6, 12, -6, 20]} stroke="#aaa" strokeWidth={2} />
      <Line points={[6, 12, 6, 20]} stroke="#aaa" strokeWidth={2} />
      
      <Text text="+" x={-8} y={4} fontSize={8} fill="#ff0000" />
      
      <Circle x={-6} y={20} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={6} y={20} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const BuzzerSymbol = [\s\S]*?\};\n/, tBuzzer + '\n');

const tMotor = `export const MotorSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#aaa";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-12} y={-18} width={24} height={36} fill="#ddd" stroke={stroke} strokeWidth={2} cornerRadius={2} />
      <Circle x={0} y={-20} radius={4} fill="#eee" stroke="#aaa" strokeWidth={1} />
      <Rect x={-2} y={-28} width={4} height={8} fill="#bbb" stroke="#999" strokeWidth={1} />
      
      <Line points={[-6, 18, -6, 24]} stroke="#aaa" strokeWidth={2} />
      <Line points={[6, 18, 6, 24]} stroke="#aaa" strokeWidth={2} />
      <Circle x={-6} y={24} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={6} y={24} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const MotorSymbol = [\s\S]*?\};\n/, tMotor + '\n');


fs.writeFileSync('src/components/Symbols.tsx', code, 'utf8');
