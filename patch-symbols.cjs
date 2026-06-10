const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Symbols.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  // QFP (Quad Flat Package)
  'export const PCBQfpSymbol = (props: SymbolProps) => (\\s*<FallbackSymbol \\{...props\\} label="QFP" />\\s*);': `export const PCBQfpSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Body */}
      <Rect x={-20} y={-20} width={40} height={40} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={1} />
      <Circle x={-15} y={-15} radius={1.5} fill="#4b5563" />
      {/* Pads (8 on each side) */}
      {[...Array(8)].map((_, i) => <Rect key={\`t_\${i}\`} x={-14 + i * 4} y={-23} width={2} height={4} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={\`b_\${i}\`} x={-14 + i * 4} y={19} width={2} height={4} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={\`l_\${i}\`} x={-23} y={-14 + i * 4} width={4} height={2} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={\`r_\${i}\`} x={19} y={-14 + i * 4} width={4} height={2} fill="#9ca3af" />)}
    </Group>
  );
};`,

  // Copper Pour
  'export const PCBCopperPourSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBCopperPour" />\\s*\\);': `export const PCBCopperPourSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "#b91c1c";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-30} y={-20} width={60} height={40} fill="rgba(185, 28, 28, 0.1)" stroke={stroke} strokeWidth={1} dash={[4, 4]} />
      <Text text="GND" x={-15} y={-6} fontSize={12} fill="#b91c1c" fontStyle="bold" opacity={0.5} />
    </Group>
  );
};`,

  // BGA
  'export const PCBBGASymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBBGA" />\\s*\\);': `export const PCBBGASymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-15} width={30} height={30} fill="#111827" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Circle x={-10} y={-10} radius={1} fill="#4b5563" />
      {/* 5x5 Grid */}
      {[...Array(5)].map((_, r) => 
        [...Array(5)].map((_, c) => 
          <Circle key={\`bga_\${r}_\${c}\`} x={-10 + c * 5} y={-10 + r * 5} radius={1.2} fill="#9ca3af" />
        )
      )}
    </Group>
  );
};`,

  // PinHeader
  'export const PCBPinHeaderSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBPinHeader" />\\s*\\);': `export const PCBPinHeaderSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-20} y={-5} width={40} height={10} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      {[...Array(4)].map((_, i) => (
        <Group key={i} x={-15 + i * 10} y={0}>
          <Rect x={-3} y={-3} width={6} height={6} fill="#fbbf24" cornerRadius={1} />
          <Circle x={0} y={0} radius={1.5} fill="#374151" />
        </Group>
      ))}
    </Group>
  );
};`,

  // USB C
  'export const PCBUSBCSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBUSBC" />\\s*\\);': `export const PCBUSBCSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-10} width={30} height={20} fill="#e5e7eb" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Rect x={-13} y={-10} width={26} height={10} fill="#9ca3af" cornerRadius={1} />
      {/* SMT Pads */}
      {[...Array(12)].map((_, i) => <Rect key={\`pad_\${i}\`} x={-11 + i * 2} y={10} width={1} height={4} fill="#9ca3af" />)}
      {/* Mounting holes */}
      <Circle x={-12} y={2} radius={2} fill="#d1d5db" />
      <Circle x={12} y={2} radius={2} fill="#d1d5db" />
    </Group>
  );
};`,

  // Micro USB
  'export const PCBMicroUSBSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBMicroUSB" />\\s*\\);': `export const PCBMicroUSBSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-10} y={-8} width={20} height={16} fill="#e5e7eb" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Path data="M -8 -8 L -6 -6 L 6 -6 L 8 -8" fill="#9ca3af" />
      {/* 5 SMT Pads */}
      {[...Array(5)].map((_, i) => <Rect key={\`pad_\${i}\`} x={-4 + i * 2} y={8} width={1.2} height={4} fill="#9ca3af" />)}
      {/* Mounting holes */}
      <Rect x={-11} y={0} width={3} height={3} fill="#d1d5db" />
      <Rect x={8} y={0} width={3} height={3} fill="#d1d5db" />
    </Group>
  );
};`,

  // Crystal
  'export const PCBCrystalSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBCrystal" />\\s*\\);': `export const PCBCrystalSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Ellipse x={0} y={0} radiusX={12} radiusY={6} fill="#d1d5db" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Rect x={-11} y={-3} width={4} height={6} fill="#9ca3af" />
      <Rect x={7} y={-3} width={4} height={6} fill="#9ca3af" />
      <Text text="Y" x={-4} y={-5} fontSize={10} fill="#4b5563" />
    </Group>
  );
};`,

  // NTC SMD
  'export const PCBNTCSMDSymbol = \\(props: SymbolProps\\) => \\(\\s*<FallbackSymbol \\{...props\\} label="PCBNTCSMD" />\\s*\\);': `export const PCBNTCSMDSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-8} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={4} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={-5} y={-4.5} width={10} height={9} fill="#4b5563" stroke={stroke} strokeWidth={selected ? 2 : 0} />
    </Group>
  );
};`
};

for (const [pattern, replacement] of Object.entries(replacements)) {
  const regex = new RegExp(pattern);
  if (!regex.test(content)) {
    console.error('Pattern not found:', pattern);
  } else {
    content = content.replace(regex, replacement);
  }
}

// Add new symbols at the end
const newSymbols = `

export const PCBFiducialSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={3.5} fill="transparent" stroke="#b91c1c" strokeWidth={1} />
      <Circle x={0} y={0} radius={1.5} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 1 : 0} />
    </Group>
  );
};

export const PCBMountingHoleSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={4} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Circle x={0} y={0} radius={2.5} fill="#1f2937" />
    </Group>
  );
};

export const PCBTestPointSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={2.5} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 1 : 0} />
      <Text text="TP" x={3} y={-10} fontSize={8} fill="#ffffff" />
    </Group>
  );
};
`;

content += newSymbols;

fs.writeFileSync(filePath, content);
console.log("Done");
