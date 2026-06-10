const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

const tResistor = `export function ResistorSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-25, 0, -12, 0]} stroke="#aaa" strokeWidth={2} />
      <Line points={[12, 0, 25, 0]} stroke="#aaa" strokeWidth={2} />
      <Rect x={-12} y={-5} width={24} height={10} fill="#E3C498" stroke={stroke} strokeWidth={1} cornerRadius={3} />
      <Rect x={-8} y={-5} width={2} height={10} fill="#8B4513" />
      <Rect x={-4} y={-5} width={2} height={10} fill="#000" />
      <Rect x={0} y={-5} width={2} height={10} fill="#e11d48" />
      <Rect x={6} y={-5} width={2} height={10} fill="#d4af37" />
      <Circle x={-25} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={25} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      {value && <Text text={value + "Ω"} x={-10} y={-18} fontSize={10} fill={textColor} />}
    </Group>
  );
}`;
code = code.replace(/export function ResistorSymbol[\s\S]*?\}\n/, tResistor + '\n');

const tCapacitor = `export function CapacitorSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#e67e22";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Circle x={0} y={0} radius={8} fill="#e67e22" stroke={stroke} strokeWidth={1} />
      <Circle x={-15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      {value && <Text text={value + "μF"} x={15} y={-20} fontSize={10} fill={selected ? selectedColor : textColor} />}
    </Group>
  );
}`;
code = code.replace(/export function CapacitorSymbol[\s\S]*?\}\n/, tCapacitor + '\n');

const tCapElectrolytic = `export function CapacitorElectrolyticSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Rect x={-8} y={-8} width={16} height={16} fill="#2c3e50" stroke={stroke} strokeWidth={1} cornerRadius={8} />
      <Path data="M 0 -8 L 8 -8 A 8 8 0 0 1 8 8 L 0 8 Z" fill="#95a5a6" />
      <Circle x={-15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      {value && <Text text={value + "μF"} x={15} y={-20} fontSize={10} fill={selected ? selectedColor : textColor} />}
    </Group>
  );
}`;
code = code.replace(/export function CapacitorElectrolyticSymbol[\s\S]*?\}\n/, tCapElectrolytic + '\n');

const tDiode = `export function DiodeSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Rect x={-8} y={-4} width={16} height={8} fill="#222" stroke={stroke} strokeWidth={1} cornerRadius={2} />
      <Rect x={4} y={-4} width={2} height={8} fill="#aaa" />
      <Circle x={-15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
}`;
code = code.replace(/export function DiodeSymbol[\s\S]*?\}\n/, tDiode + '\n');

const tLED = `export function LEDSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#cc0000";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Circle x={0} y={0} radius={7} fill="#ff0000" stroke={stroke} strokeWidth={1} opacity={0.8} />
      <Path data="M 6 -6 L 6 6" stroke={stroke} strokeWidth={2} />
      <Circle x={-15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
}`;
code = code.replace(/export function LEDSymbol[\s\S]*?\}\n/, tLED + '\n');

const tTransistor = `export const TransistorSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* TO-92 case top-down */}
      <Path data="M -8 -4 L 8 -4 L 8 0 A 8 8 0 0 1 -8 0 Z" fill="#222" stroke={stroke} strokeWidth={1} />
      <Line points={[-4, 4, -4, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[0, 4, 0, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[4, 4, 4, 15]} stroke="#aaa" strokeWidth={2} />
      <Circle x={-4} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={0} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={4} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const TransistorSymbol = [\s\S]*?\};\n/, tTransistor + '\n');
code = code.replace(/export const TransistorPNPSymbol = [\s\S]*?\};\n/, tTransistor.replace('TransistorSymbol', 'TransistorPNPSymbol') + '\n');

const tSwitch = `export function SwitchSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-8} y={-8} width={16} height={16} fill="#ddd" stroke={stroke} strokeWidth={1} />
      <Circle x={0} y={0} radius={4} fill="#222" />
      <Line points={[-12, 0, -8, 0]} stroke="#aaa" strokeWidth={2} />
      <Line points={[8, 0, 12, 0]} stroke="#aaa" strokeWidth={2} />
      <Circle x={-12} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={12} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
}`;
code = code.replace(/export function SwitchSymbol[\s\S]*?\}\n/, tSwitch + '\n');

const tPotentiometer = `export const PotentiometerSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={10} fill="#3b82f6" stroke={stroke} strokeWidth={1} />
      <Circle x={0} y={0} radius={4} fill="#fff" />
      <Line points={[-4, 0, 4, 0]} stroke="#ccc" strokeWidth={2} />
      <Line points={[-8, 10, -8, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[0, 10, 0, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[8, 10, 8, 15]} stroke="#aaa" strokeWidth={2} />
      <Circle x={-8} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={0} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={8} y={15} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const PotentiometerSymbol = [\s\S]*?\};\n/, tPotentiometer + '\n');

const tBattery = `export const ACSourceSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-25} width={30} height={50} fill="#333" stroke={stroke} strokeWidth={2} cornerRadius={4} />
      <Rect x={-15} y={-25} width={30} height={10} fill="#e11d48" cornerRadius={[4, 4, 0, 0]} />
      <Text text="+" x={-4} y={-22} fontSize={8} fill="#fff" />
      <Text text="-" x={-3} y={15} fontSize={10} fill="#fff" />
      <Line points={[0, -25, 0, -32]} stroke="#aaa" strokeWidth={2} />
      <Line points={[0, 25, 0, 32]} stroke="#aaa" strokeWidth={2} />
      <Circle x={0} y={-32} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={0} y={32} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
};`;
code = code.replace(/export const ACSourceSymbol = [\s\S]*?\};\n/, tBattery + '\n');
code = code.replace(/export function ACSourceSymbol[\s\S]*?\}\n/, tBattery + '\n'); 

const tIC555 = `export const Timer555Symbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-12} y={-16} width={24} height={32} fill="#222" stroke={stroke} strokeWidth={2} cornerRadius={2} />
      <Circle x={-6} y={-10} radius={2} fill="#111" /> {/* Pin 1 indicator */}
      <Text text="NE555" x={-10} y={-2} fontSize={6} fill="#ccc" />
      {/* Pins */}
      <Rect x={-16} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={-16} y={12} width={4} height={2} fill="#aaa" />
      
      <Rect x={12} y={-12} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={-4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={4} width={4} height={2} fill="#aaa" />
      <Rect x={12} y={12} width={4} height={2} fill="#aaa" />
      
      {/* Interaction points */}
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
code = code.replace(/export const Timer555Symbol = [\s\S]*?\};\n/, tIC555 + '\n');
code = code.replace(/export function Timer555Symbol[\s\S]*?\}\n/, tIC555 + '\n'); 

fs.writeFileSync('src/components/Symbols.tsx', code, 'utf8');
