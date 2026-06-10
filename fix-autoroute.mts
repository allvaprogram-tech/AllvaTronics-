import fs from 'fs';

let code = fs.readFileSync('src/components/CanvasEditor.tsx', 'utf-8');

const regex = /const handleAutoRoute = \(\) => \{[\s\S]*?alert\("Auto-Routing Simulado com sucesso!"\);\s*\};/;
const substitution = `const handleAutoRoute = () => {
    setWiring({ active: false, start: null, current: null });

    const newPcbElements: PcbElement[] = [...pcbElements.filter(el => el.type !== 'trace')];
    const components = newPcbElements.filter(el => el.type === 'pcb_component') as PcbComponentEntity[];
    const schComponents = elements.filter(el => el.type === 'component') as ComponentEntity[];

    if (components.length < 2) {
      alert('Adicione pelo menos 2 componentes na PCB para criar trilhas.');
      return;
    }

    // Build schematic netlist
    const pointId = (x: number, y: number) => \\\`\\\${Math.round(x/5)*5},\\\${Math.round(y/5)*5}\\\`;
    const wireAdj = new Map<string, Set<string>>();
    const addWireEdge = (p1: Point, p2: Point) => {
        const id1 = pointId(p1.x, p1.y);
        const id2 = pointId(p2.x, p2.y);
        if (!wireAdj.has(id1)) wireAdj.set(id1, new Set());
        if (!wireAdj.has(id2)) wireAdj.set(id2, new Set());
        wireAdj.get(id1)!.add(id2);
        wireAdj.get(id2)!.add(id1);
    };

    elements.forEach(el => {
        if (el.type === 'wire') {
            const w = el as WireEntity;
            for (let i = 0; i < w.points.length - 1; i++) {
                addWireEdge(w.points[i], w.points[i+1]);
            }
        }
    });

    const compPins = new Map<string, string[]>();
    schComponents.forEach(comp => {
         const localPins = pinMap[comp.componentType] || [{x:0, y:0}];
         const rad = comp.rotation * Math.PI / 180;
         const pins = localPins.map(p => ({
             x: comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
             y: comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad)
         }));
         const ids = pins.map(p => pointId(p.x, p.y));
         if (comp.name) {
           compPins.set(comp.name, ids);
         }
         ids.forEach(id => {
             if (!wireAdj.has(id)) wireAdj.set(id, new Set());
         });
    });

    // Find connected schematic components
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

    // Now auto-route each net
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
               const pts = getOrthogonalPoints(p1, p2);
               newPcbElements.push({
                   id: uuidv4(),
                   type: 'trace',
                   points: pts,
                   layer: i % 2 === 0 ? 'bottom' : 'top',
                   width: 4
               });
           }
       }
    });

    setPcbElements(newPcbElements);
    alert("Auto-Routing baseado no esquemático concluído!");
  };`;

if (!code.match(regex)) {
   console.log("Could not find regex!");
} else {
   code = code.replace(regex, substitution);
   fs.writeFileSync('src/components/CanvasEditor.tsx', code);
   console.log("Replaced handleAutoRoute!");
}
