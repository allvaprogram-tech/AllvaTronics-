import fs from 'fs';

let content = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

const template = (name, defaultVal) => `export const ${name}Symbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : 'transparent';
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect x={-35} y={-16} width={70} height={32} fill='#222' shadowColor='#000' shadowBlur={4} shadowOffsetX={1} shadowOffsetY={2} shadowOpacity={0.4} stroke={stroke} strokeWidth={selected?2:0} cornerRadius={2} />
      <Circle x={-27} y={-8} radius={2.5} fill='#0c0c0c' />
      <Path data='M -35 -4 A 4 4 0 0 0 -35 4' fill='#111' />
      <Text text={value || '${defaultVal}'} x={-20} y={-2} fontSize={7} fill='#ccc' />
      
      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={'B'+i}>
           <Rect x={-32 + i * 10} y={16} width={4} height={4} fill='#bcc2c2' />
           <Circle x={-30 + i * 10} y={20} radius={2} fill={selected ? selectedColor : '#e2e8f0'} stroke={selected ? selectedColor : '#94a3b8'} strokeWidth={1.5} />
           <Text text={String(i+1)} x={-31 + i * 10} y={10} fontSize={4} fill='#555' />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={'T'+i}>
           <Rect x={28 - i * 10} y={-20} width={4} height={4} fill='#bcc2c2' />
           <Circle x={30 - i * 10} y={-20} radius={2} fill={selected ? selectedColor : '#e2e8f0'} stroke={selected ? selectedColor : '#94a3b8'} strokeWidth={1.5} />
           <Text text={String(14-i)} x={29 - i * 10} y={-14} fontSize={4} fill='#555' />
        </Group>
      ))}
    </Group>
  );
};`;

const replacements = [
  ['LogicGate', 'Gate'],
  ['LogicAnd', '74HC08 AND'],
  ['LogicOr', '74HC32 OR'],
  ['LogicNand', '74HC00 NAND'],
  ['LogicNor', '74HC02 NOR'],
  ['LogicXor', '74HC86 XOR'],
  ['IC', 'IC']
];

for (const [name, defaultVal] of replacements) {
    const regex = new RegExp(`export const ${name}Symbol = \\(\\{.*?\\);\\n\\};`, 'gs');
    content = content.replace(regex, template(name, defaultVal));
}

fs.writeFileSync('src/components/Symbols.tsx', content);
