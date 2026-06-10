const fs = require('fs');
let text = fs.readFileSync('src/components/Symbols.tsx', 'utf8');
const searchString = 'import { Group, Rect, Circle, Line, Text, Path, Ellipse } from "react-konva";';

let firstIndex = text.indexOf(searchString);
let secondIndex = text.indexOf(searchString, firstIndex + 1);
let thirdIndex = text.indexOf(searchString, secondIndex + 1);

if (thirdIndex !== -1) {
    let originalCode = text.substring(thirdIndex);
    fs.writeFileSync('src/components/Symbols.tsx', originalCode);
    console.log('Restored');
} else {
    console.log('Not found 3 times');
}
