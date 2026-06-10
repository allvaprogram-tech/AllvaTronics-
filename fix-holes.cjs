const fs = require('fs');

let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

// Protoboard holes fixes
const pbStart = code.indexOf('export const ProtoboardSymbol');
if (pbStart > -1) {
    const pbEnd = code.indexOf('export const PCBCR2032Symbol', pbStart) || code.length;
    let pbCode = code.substring(pbStart, pbEnd);
    
    pbCode = pbCode.replace(/width=\{4\}/g, 'width={6}').replace(/height=\{4\}/g, 'height={6}');

    pbCode = pbCode.replace(/y=\{-92\}/g, 'y={-93}');
    pbCode = pbCode.replace(/y=\{-82\}/g, 'y={-83}');
    pbCode = pbCode.replace(/y=\{88\}/g, 'y={87}');
    pbCode = pbCode.replace(/y=\{78\}/g, 'y={77}');
    pbCode = pbCode.replace(/y=\{-62 \+ r \* 10\}/g, 'y={-63 + r * 10}');
    pbCode = pbCode.replace(/y=\{18 \+ r \* 10\}/g, 'y={17 + r * 10}');

    code = code.substring(0, pbStart) + pbCode + code.substring(pbEnd);
}

// Ensure terminal coordinates are perfectly multiple of 10 in Transistor/Mosfet
code = code.replace(/radius=\{2\}/g, 'radius={4}');

fs.writeFileSync('src/components/Symbols.tsx', code);
