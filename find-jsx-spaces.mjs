import fs from 'fs';

function findStrings(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let openSpaces = />\s*\{\s*["'] ["']\s*\}\s*</g;
  let matches = [...code.matchAll(openSpaces)];
  if (matches.length > 0) {
    console.log(`Found explicit spaces in ${filePath}:`, matches.map(m => m[0]));
  }

  let textNodes = />\s+\</g;
  matches = [...code.matchAll(textNodes)];
  // console.log(`Found spaces between tags in ${filePath}:`, matches.length);
}

findStrings('src/components/Symbols.tsx');
findStrings('src/components/CanvasEditor.tsx');
