const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

const tInductor = `export function InductorSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Rect x={-10} y={-4} width={20} height={8} fill="#111" stroke={stroke} strokeWidth={1} cornerRadius={2} />
      <Line points={[-8, -4, -6, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[-4, -4, -2, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[0, -4, 2, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[4, -4, 6, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[8, -4, 10, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Circle x={-15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
      <Circle x={15} y={0} radius={2} fill={selected ? selectedColor : "transparent"} />
    </Group>
  );
}`;
code = code.replace(/export function InductorSymbol[\s\S]*?\}\n/, tInductor + '\n');

const proto = `export const ProtoboardSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "#eee";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-60} y={-35} width={120} height={70} fill="#f5f5f5" stroke={stroke} strokeWidth={2} cornerRadius={4} />
      {/* Power Rails */}
      <Line points={[-50, -26, 50, -26]} stroke="#ef4444" strokeWidth={1} />
      <Line points={[-50, -20, 50, -20]} stroke="#3b82f6" strokeWidth={1} />
      
      <Line points={[-50, 20, 50, 20]} stroke="#3b82f6" strokeWidth={1} />
      <Line points={[-50, 26, 50, 26]} stroke="#ef4444" strokeWidth={1} />
      
      {/* Some dots grid */}
      {[...Array(11)].map((_, c) => 
        [...Array(5)].map((_, r) => (
          <Circle key={'t'+c+'_'+r} x={-45 + c * 9} y={-10 + r * 3} radius={0.8} fill="#333" />
        ))
      )}
      {[...Array(11)].map((_, c) => 
        [...Array(5)].map((_, r) => (
          <Circle key={'b'+c+'_'+r} x={-45 + c * 9} y={10 - r * 3} radius={0.8} fill="#333" />
        ))
      )}
      <Text text="Protoboard" x={-20} y={-3} fontSize={8} fill="#999" />
    </Group>
  );
};`;
code = code.replace(/export const ProtoboardSymbol = [\s\S]*?\};\n/, proto + '\n');


fs.writeFileSync('src/components/Symbols.tsx', code, 'utf8');
