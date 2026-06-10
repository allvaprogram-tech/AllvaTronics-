import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasViewer3D.tsx', 'utf-8');

const regexImport = /const \{ elements, pcbElements, isSimulating \} = useEditor\(\);/;
const substitutionImport = `const { elements, pcbElements, isSimulating, mode } = useEditor();`;
code = code.replace(regexImport, substitutionImport);

const regexShape = /const boardShape = useMemo\(\(\) => \{[\s\S]*?\}, \[pcbElements\]\);/;
const substitutionShape = `const boardShape = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pcbElements.forEach(el => {
      if (el.type === 'pcb_component' || el.type === 'trace' || el.type === 'board') {
         if ((el as any).points) {
            (el as any).points.forEach((p: Point) => {
               minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
               maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
            });
         } else if ((el as any).x !== undefined) {
            minX = Math.min(minX, (el as any).x); minY = Math.min(minY, (el as any).y);
            maxX = Math.max(maxX, (el as any).x); maxY = Math.max(maxY, (el as any).y);
         }
      }
    });

    const boardEl = pcbElements.find(el => el.type === 'board') as any;
    if (boardEl) {
      return {
        width: Math.max(boardEl.width * 10, 200),
        height: Math.max(boardEl.height * 10, 200),
        center: { x: boardEl.x + boardEl.width/2, y: boardEl.y + boardEl.height/2 }
      };
    }
    
    if (minX === Infinity) return { width: 500, height: 500, center: { x: 0, y: 0 } };
    return {
      width: Math.max(200, maxX - minX + 100),
      height: Math.max(200, maxY - minY + 100),
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    };
  }, [pcbElements]);

  const schematicShape = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      if (el.type === 'component') {
         minX = Math.min(minX, el.x); minY = Math.min(minY, el.y);
         maxX = Math.max(maxX, el.x); maxY = Math.max(maxY, el.y);
      } else if (el.type === 'wire') {
         (el as any).points.forEach((p: Point) => {
            minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
         });
      }
    });
    if (minX === Infinity) return { center: { x: 0, y: 0 } };
    return {
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    };
  }, [elements]);`;

code = code.replace(regexShape, substitutionShape);

const regexSchGroup = /\{\/\* --- SCHEMATIC VIEW AREA --- \*\/\}[\s\S]*?<group position=\{\[-600, 0, 0\]\}>/;
const substitutionSchGroup = `{/* --- SCHEMATIC VIEW AREA --- */}
        {mode === 'schematic' && (
        <group position={[-schematicShape.center.x, 0, -schematicShape.center.y]}>`;

code = code.replace(regexSchGroup, substitutionSchGroup);

const regexSchGroupEnd = /\{\/\* --- PCB BOARD AREA --- \*\/\}/;
const substitutionSchGroupEnd = `)}
        {/* --- PCB BOARD AREA --- */}`;

code = code.replace(regexSchGroupEnd, substitutionSchGroupEnd);

const regexPcbGroup = /<group>\s*\{\/\* PCB Base Platform/;
const substitutionPcbGroup = `{mode === 'pcb' && (
        <group>
          {/* PCB Base Platform`;

code = code.replace(regexPcbGroup, substitutionPcbGroup);

const regexEndTags = /<\/Canvas>\s*<\/div>\s*\);\s*}\s*$/;
const substitutionEndTags = `)}
      </Canvas>
    </div>
  );
}`;
code = code.replace(regexEndTags, substitutionEndTags);

fs.writeFileSync('src/components/CanvasViewer3D.tsx', code);
console.log("Updated 3D Viewer modes!");
