import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasEditor.tsx', 'utf-8');

// Find handleAutoRoute
const match = code.match(/const handleAutoRoute = \(\) => \{([\s\S]*?)alert\("Auto-Routing baseado no esquemático concluído!"\);\s*\};\s*window\.addEventListener\('export-canvas'/);

if (match) {
    let innerBody = match[1];

    let newCode = code.replace(match[0], `
    const handleAutoRoute = () => {
       doAutoRoute(elements, pcbElements, setPcbElements);
       alert("Auto-Routing baseado no esquemático concluído!");
    };
    window.addEventListener('export-canvas'
    `);
    
    // the variable uuidv4 is available in CanvasEditor
    // compPins requires pinMap which is imported
    const helperParams = `
const doAutoRoute = (elements: Element[], pcbElements: PcbElement[], setPcbElements: any) => {
    const newPcbElements = [...pcbElements.filter(el => el.type !== 'trace')];
    const components = newPcbElements.filter(el => el.type === 'pcb_component') as any[];
    const schComponents = elements.filter(el => el.type === 'component') as any[];

    if (components.length < 2) {
      return;
    }

    const pointId = (x: number, y: number) => Math.round(x/5)*5 + ',' + Math.round(y/5)*5;
    const wireAdj = new Map<string, Set<string>>();
    const addWireEdge = (p1: any, p2: any) => {
        const id1 = pointId(p1.x, p1.y);
        const id2 = pointId(p2.x, p2.y);
        if (!wireAdj.has(id1)) wireAdj.set(id1, new Set());
        if (!wireAdj.has(id2)) wireAdj.set(id2, new Set());
        wireAdj.get(id1)!.add(id2);
        wireAdj.get(id2)!.add(id1);
    };

    elements.forEach(el => {
        if (el.type === 'wire') {
            const w = el as any;
            for (let i = 0; i < w.points.length - 1; i++) {
                addWireEdge(w.points[i], w.points[i+1]);
            }
        }
    });

    const compPins = new Map<string, string[]>();
    schComponents.forEach(comp => {
         const localPins = window.pinMapRef ? window.pinMapRef[comp.componentType] || [{x:0, y:0}] : [{x:0,y:0}];
         const rad = comp.rotation * Math.PI / 180;
         const pins = localPins.map((p:any) => ({
             x: comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
             y: comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad)
         }));
         const ids = pins.map((p:any) => pointId(p.x, p.y));
         if (comp.name) {
           compPins.set(comp.name, ids);
         }
         ids.forEach((id:any) => {
             if (!wireAdj.has(id)) wireAdj.set(id, new Set());
         });
    });

    const visited = new Set<string>();
    const nets: Set<string>[] = [];
    for (const node of wireAdj.keys()) {
        if (!visited.has(node)) {
            const net = new Set<string>();
            const queue = [node];
            visited.add(node);
            while (queue.length > 0) {
                const curr = queue.shift()!;
                net.add(curr);
                for (const neighbor of wireAdj.get(curr) || []) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            if (net.size > 1) {
                nets.push(net);
            }
        }
    }

    nets.forEach((net, i) => {
       const pcbPoints: {x:number, y:number}[] = [];
       components.forEach(pcbComp => {
           if (!pcbComp.name) return;
           const schPins = compPins.get(pcbComp.name);
           if (schPins && schPins.some(pin => net.has(pin))) {
               pcbPoints.push({ x: pcbComp.x, y: pcbComp.y });
           }
       });

       if (pcbPoints.length > 1) {
           for (let j = 0; j < pcbPoints.length - 1; j++) {
               const p1 = pcbPoints[j];
               const p2 = pcbPoints[j+1];
               const obstacles = components.map(c => ({ x: c.x, y: c.y, width: 20, height: 20 }));
               const pts = window.astarRouteRef(p1, p2, obstacles, 5);
               newPcbElements.push({
                   id: window.uuidv4Ref(),
                   type: 'trace',
                   points: pts,
                   layer: i % 2 === 0 ? 'bottom' : 'top',
                   width: 4
               } as any);
           }
       }
    });

    setPcbElements(newPcbElements);
};
`
    // Rather than doing it globally with window references, let's just insert it inside the component but outside the useEffect
    let componentStart = code.indexOf('export function CanvasEditor(');
    
    // We already have:
    // import { pinMap } from '../lib/pinmap';
    // import { v4 as uuidv4 } from 'uuid';
    // import { astarRoute } from '../lib/astar';

    let helperFunc = `
const doAutoRoute = (elements: any[], pcbElements: any[], setPcbElements: any, pinMap: any, astarRoute: any, uuidv4: any) => {
    const newPcbElements = [...pcbElements.filter(el => el.type !== 'trace')];
    const components = newPcbElements.filter(el => el.type === 'pcb_component') as any[];
    const schComponents = elements.filter(el => el.type === 'component') as any[];

    if (components.length < 2) return;

    const pointId = (x: number, y: number) => Math.round(x/5)*5 + ',' + Math.round(y/5)*5;
    const wireAdj = new Map<string, Set<string>>();
    const addWireEdge = (p1: any, p2: any) => {
        const id1 = pointId(p1.x, p1.y);
        const id2 = pointId(p2.x, p2.y);
        if (!wireAdj.has(id1)) wireAdj.set(id1, new Set());
        if (!wireAdj.has(id2)) wireAdj.set(id2, new Set());
        wireAdj.get(id1)!.add(id2);
        wireAdj.get(id2)!.add(id1);
    };

    elements.forEach(el => {
        if (el.type === 'wire') {
            const w = el as any;
            for (let i = 0; i < w.points.length - 1; i++) {
                addWireEdge(w.points[i], w.points[i+1]);
            }
        }
    });

    const compPins = new Map<string, string[]>();
    schComponents.forEach(comp => {
         const localPins = pinMap[comp.componentType] || [{x:0, y:0}];
         const rad = comp.rotation * Math.PI / 180;
         const pins = localPins.map((p:any) => ({
             x: comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
             y: comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad)
         }));
         const ids = pins.map((p:any) => pointId(p.x, p.y));
         if (comp.name) {
           compPins.set(comp.name, ids);
         }
         ids.forEach((id:any) => {
             if (!wireAdj.has(id)) wireAdj.set(id, new Set());
         });
    });

    const visited = new Set<string>();
    const nets: Set<string>[] = [];
    for (const node of wireAdj.keys()) {
        if (!visited.has(node)) {
            const net = new Set<string>();
            const queue = [node];
            visited.add(node);
            while (queue.length > 0) {
                const curr = queue.shift()!;
                net.add(curr);
                for (const neighbor of wireAdj.get(curr) || []) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            if (net.size > 1) {
                nets.push(net);
            }
        }
    }

    nets.forEach((net, i) => {
       const pcbPoints: {x:number, y:number}[] = [];
       components.forEach(pcbComp => {
           if (!pcbComp.name) return;
           const schPins = compPins.get(pcbComp.name);
           if (schPins && schPins.some(pin => net.has(pin))) {
               pcbPoints.push({ x: pcbComp.x, y: pcbComp.y });
           }
       });

       if (pcbPoints.length > 1) {
           for (let j = 0; j < pcbPoints.length - 1; j++) {
               const p1 = pcbPoints[j];
               const p2 = pcbPoints[j+1];
               const obstacles = components.map(c => ({ x: c.x, y: c.y, width: 20, height: 20 }));
               const pts = astarRoute(p1, p2, obstacles, 5);
               newPcbElements.push({
                   id: uuidv4(),
                   type: 'trace',
                   points: pts,
                   layer: i % 2 === 0 ? 'bottom' : 'top',
                   width: 4
               } as any);
           }
       }
    });

    setPcbElements(newPcbElements);
};
`
    newCode = newCode.slice(0, componentStart) + helperFunc + newCode.slice(componentStart);
    
    // Replace handleAutoRoute definition to call doAutoRoute and alert
    newCode = newCode.replace(match[0], `
    const handleAutoRoute = () => {
       doAutoRoute(elements, pcbElements, setPcbElements, pinMap, astarRoute, uuidv4);
       alert("Auto-Routing baseado no esquemático concluído!");
    };
    window.addEventListener('export-canvas'
    `);
    
    // Call doAutoRoute on PCB component drag end
    newCode = newCode.replace(/let newX = snapToGrid\(e\.target\.x\(\)\);\s*let newY = snapToGrid\(e\.target\.y\(\)\);\s*e\.target\.position\(\{ x: newX, y: newY \}\);\s*updateElement\(comp\.id, \{ x: newX, y: newY \}\);/g, 
    `let newX = snapToGrid(e.target.x());
                     let newY = snapToGrid(e.target.y());
                     e.target.position({ x: newX, y: newY });
                     updateElement(comp.id, { x: newX, y: newY });
                     
                     // Run auto-route professionally on component move
                     setTimeout(() => {
                         const currentPcbElements = pcbElements.map(el => el.id === comp.id ? { ...el, x: newX, y: newY } : el);
                         doAutoRoute(elements, currentPcbElements, setPcbElements, pinMap, astarRoute, uuidv4);
                     }, 50);`);
    
    fs.writeFileSync('src/components/CanvasEditor.tsx', newCode);
    console.log("Separated doAutoRoute and added onDragEnd hooks.");
} else {
    console.log("Couldn't find handleAutoRoute.");
}
