const fs = require('fs');
let code = fs.readFileSync('src/components/Symbols.tsx', 'utf8');
code = code.replace(/-291\.5/g, '-292');
code = code.replace(/-290\.5/g, '-291'); // smaller square (width 2), x = -291 -> center -290
code = code.replace(/-91\.5/g, '-92');
code = code.replace(/-90\.5/g, '-91');
code = code.replace(/-81\.5/g, '-82');
code = code.replace(/-80\.5/g, '-81');
code = code.replace(/88\.5/g, '88');
code = code.replace(/89\.5/g, '89'); // y=88, h=4 -> center 90
code = code.replace(/78\.5/g, '78');
code = code.replace(/79\.5/g, '79'); // y=78, h=4 -> center 80

code = code.replace(/-61\.5/g, '-62');
code = code.replace(/-60\.5/g, '-61');
code = code.replace(/18\.5/g, '18');
code = code.replace(/19\.5/g, '19');

fs.writeFileSync('src/components/Symbols.tsx', code);
