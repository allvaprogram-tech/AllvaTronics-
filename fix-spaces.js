const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf-8');
code = code.replace(/> \{\/\*/g, '>{/*');
fs.writeFileSync('src/components/Symbols.tsx', code);
console.log('Fixed spaces in Symbols.tsx');
