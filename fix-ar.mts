import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasEditor.tsx', 'utf-8');

const regex = /import \{ getOrthogonalPoints \} from '\.\.\/lib\/utils';/;
const sub = `import { getOrthogonalPoints } from '../lib/utils';
import { astarRoute } from '../lib/astar';`;
if (code.includes(`import { astarRoute } from '../lib/astar';`)) {
  // Already imported
} else if (code.match(regex)) {
  code = code.replace(regex, sub);
} else {
  // Try inserting it near top
  code = `import { astarRoute } from '../lib/astar';\n` + code;
}

const findRouteRegex = /const pts = getOrthogonalPoints\(p1, p2\);/;
const subRoute = `
               const obstacles = components.map(c => ({ x: c.x, y: c.y, width: 20, height: 20 }));
               const pts = astarRoute(p1, p2, obstacles, 5);
`;

code = code.replace(findRouteRegex, subRoute);

fs.writeFileSync('src/components/CanvasEditor.tsx', code);
console.log("Updated handleAutoRoute with A* algorithm");
