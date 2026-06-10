const fs = require('fs');

let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');

// Protoboard holes fixes
// We want to replace width={4} and height={4} with {6} ONLY in ProtoboardSymbol.
const pbStart = code.indexOf('export const ProtoboardSymbol');
if (pbStart > -1) {
    const pbEnd = code.indexOf('export const PCBCR2032Symbol', pbStart) || code.length;
    let pbCode = code.substring(pbStart, pbEnd);
    
    // Replace width={4} and height={4} with 6
    pbCode = pbCode.replace(/width=\{4\}/g, 'width={6}').replace(/height=\{4\}/g, 'height={6}');

    // Adjust Y coordinates to keep center at multiple of 10
    // Currently y is -92, -82, 88, 78, -62, 18
    pbCode = pbCode.replace(/y=\{-92\}/g, 'y={-93}');
    pbCode = pbCode.replace(/y=\{-82\}/g, 'y={-83}');
    pbCode = pbCode.replace(/y=\{88\}/g, 'y={87}');
    pbCode = pbCode.replace(/y=\{78\}/g, 'y={77}');
    pbCode = pbCode.replace(/y=\{-62 \+ r \* 10\}/g, 'y={-63 + r * 10}');
    pbCode = pbCode.replace(/y=\{18 \+ r \* 10\}/g, 'y={17 + r * 10}');

    // Put it back
    code = code.substring(0, pbStart) + pbCode + code.substring(pbEnd);
}

// Ensure terminal coordinates are perfectly multiple of 10 in Transistor/Mosfet
// They are x={-10}, {0}, {10} with y=10. This is already multiple of 10!
// So just need to make sure we make them BIGGER if the user wants larger terminals.
// They are radius={2}. Let's make them radius={4}.
// And for other elements, some might be radius={3.5}. Let's just make all radius={2} into radius={4} 
// for ALL components (since they are mostly terminal pins connecting points anyway).
code = code.replace(/radius=\{2\}/g, 'radius={4}');

fs.writeFileSync('src/components/Symbols.tsx', code);
