const fs = require('fs');
let s = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

const leftMatch = /\{\[\.\.\.Array\(8\)\].map\(\(_, i\) => \(\s*<React\.Fragment key=\{`lp\$\{i\}`\}>\s*<Line\s*points=\{\[-23, -6 \+ i \* 4\.8, -35, -6 \+ i \* 4\.8\]\}\s*stroke="#bbb"\s*strokeWidth=\{1\.5\}\s*\/>\s*<Circle\s*x=\{-35\}\s*y=\{-6 \+ i \* 4\.8\}\s*radius=\{2\}\s*fill=\{selectedColor\}\s*opacity=\{selected \? 1 : 0\}\s*\/>/m;

s = s.replace(leftMatch, `{[...Array(8)].map((_, i) => (
        <React.Fragment key={\`lp\${i}\`}>
          <Line
            points={[-23, -6 + i * 4.8, -35, -6 + i * 4.8]}
            stroke="#bbb"
            strokeWidth={1.5}
          />
          <Circle
            x={-35}
            y={-6 + i * 4.8}
            radius={2}
            fill={selectedColor}
            opacity={selected ? 1 : 0}
          />
          <Text text={['5V', 'GND', '12', '13', '15', '14', '2', '4'][i]} x={-46} y={-7.5 + i * 4.8} fill="#fff" fontSize={3.5} />`);

const rightMatch = /\{\[\.\.\.Array\(8\)\].map\(\(_, i\) => \(\s*<React\.Fragment key=\{`rp\$\{i\}`\}>\s*<Line\s*points=\{\[23, -6 \+ i \* 4\.8, 35, -6 \+ i \* 4\.8\]\}\s*stroke="#bbb"\s*strokeWidth=\{1\.5\}\s*\/>\s*<Circle\s*x=\{35\}\s*y=\{-6 \+ i \* 4\.8\}\s*radius=\{2\}\s*fill=\{selectedColor\}\s*opacity=\{selected \? 1 : 0\}\s*\/>/m;

s = s.replace(rightMatch, `{[...Array(8)].map((_, i) => (
        <React.Fragment key={\`rp\${i}\`}>
          <Line
            points={[23, -6 + i * 4.8, 35, -6 + i * 4.8]}
            stroke="#bbb"
            strokeWidth={1.5}
          />
          <Circle
            x={35}
            y={-6 + i * 4.8}
            radius={2}
            fill={selectedColor}
            opacity={selected ? 1 : 0}
          />
          <Text text={['3V3', '1/TX', '3/RX', 'GND', '0', '16', 'VCC', 'GND'][i]} x={38} y={-7.5 + i * 4.8} fill="#fff" fontSize={3.5} />`);

const rpiPins = [
  "3V3", "5V", "SDA", "5V", "SCL", "GND", "GP4", "TXD", "GND", "RXD",
  "GP17", "GP18", "GP27", "GND", "GP22", "GP23", "3V3", "GP24", "MOSI", "GND",
  "MISO", "GP25", "SCLK", "CE0", "GND", "CE1", "ID_SD", "ID_SC", "GP5", "GND",
  "GP6", "GP12", "GP13", "GND", "GP19", "GP16", "GP26", "GP20", "GND", "GP21"
];
          
const rbot = /\{\/\* Even pins \(2, 4, 6\.\.\.\) \*\/\}\s*<Text\s*text=\{\`\$\{i \* 2 \+ 2\}\`\}\s*x=\{-52\.75 \+ i \* 4\.4\}\s*y=\{-30\}\s*fill="#fff"\s*fontSize=\{3\}\s*\/>/m;
s = s.replace(rbot, `{/* Even pins (2, 4, 6...) */}
          <Text
            text={
              [
                "5V", "5V", "GND", "TXD", "RXD",
                "GP18", "GND", "GP23", "GP24", "GND",
                "GP25", "CE0", "CE1", "ID_SC", "GND",
                "GP12", "GND", "GP16", "GP20", "GP21"
              ][i]
            }
            x={-52.75 + i * 4.4}
            y={-28}
            fill="#fff"
            fontSize={2.5}
            rotation={-90}
          />`);

const rtop = /\{\/\* Odd pins \(1, 3, 5\.\.\.\) \*\/\}\s*<Text\s*text=\{\`\$\{i \* 2 \+ 1\}\`\}\s*x=\{-52\.75 \+ i \* 4\.4\}\s*y=\{-60\}\s*fill="#fff"\s*fontSize=\{3\}\s*\/>/m;
s = s.replace(rtop, `{/* Odd pins (1, 3, 5...) */}
          <Text
            text={
              [
                "3V3", "SDA", "SCL", "GP4", "GND",
                "GP17", "GP27", "GP22", "3V3", "MOSI",
                "MISO", "SCLK", "GND", "ID_SD", "GP5",
                "GP6", "GP13", "GP19", "GP26", "GND"
              ][i]
            }
            x={-52.75 + i * 4.4}
            y={-64}
            fill="#fff"
            fontSize={2.5}
            rotation={-90}
          />`);

fs.writeFileSync('src/components/Symbols.tsx', s);
