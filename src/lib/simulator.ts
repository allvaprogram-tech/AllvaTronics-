import { ComponentEntity, WireEntity, Point } from "../types";

function parseValue(val: string | undefined, defaultVal: number, isCapacitor: boolean = false): number {
  if (!val) return defaultVal;
  let s = val.toLowerCase().replace(",", ".");
  
  if (isCapacitor && /^\d{3}$/.test(s)) {
    const d1 = parseInt(s[0]);
    const d2 = parseInt(s[1]);
    const m = parseInt(s[2]);
    return (d1 * 10 + d2) * Math.pow(10, m) * 1e-12; // in Farads
  }
  
  let mult = 1;
  if (s.includes("k")) mult = 1e3;
  if (s.includes("m")) mult = 1e6;
  if (s.includes("u")) mult = 1e-6;
  if (s.includes("n")) mult = 1e-9;
  if (s.includes("p")) mult = 1e-12;
  s = s.replace(/[^0-9.-]/g, "");
  const num = parseFloat(s);
  if (isNaN(num)) return defaultVal;
  return num * mult;
}

export function formatSimValue(value: number, unit: string): string {
  const absVal = Math.abs(value);
  if (absVal < 1e-9) return `0.00 ${unit}`;
  if (absVal >= 1e6) return `${(value / 1e6).toFixed(2)} M${unit}`;
  if (absVal >= 1e3) return `${(value / 1e3).toFixed(2)} k${unit}`;
  if (absVal >= 1) return `${value.toFixed(2)} ${unit}`;
  if (absVal >= 1e-3) return `${(value * 1e3).toFixed(2)} m${unit}`;
  if (absVal >= 1e-6) return `${(value * 1e6).toFixed(2)} µ${unit}`;
  return `${(value * 1e9).toFixed(2)} n${unit}`;
}

export function solveLinearSystem(A: number[][], B: number[]): number[] | null {
  const n = B.length;
  const a = A.map((row) => [...row]);
  const b = [...B];

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(a[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > maxEl) {
        maxEl = Math.abs(a[k][i]);
        maxRow = k;
      }
    }

    if (maxEl < 1e-12) continue; // Skip singular/near singular

    const tmp = a[maxRow];
    a[maxRow] = a[i];
    a[i] = tmp;
    const tmpB = b[maxRow];
    b[maxRow] = b[i];
    b[i] = tmpB;

    for (let k = i + 1; k < n; k++) {
      const c = -a[k][i] / a[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          a[k][j] = 0;
        } else {
          a[k][j] += c * a[i][j];
        }
      }
      b[k] += c * b[i];
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(a[i][i]) < 1e-12) {
      x[i] = 0;
      continue;
    }
    x[i] = b[i];
    for (let k = i + 1; k < n; k++) {
      x[i] -= a[i][k] * x[k];
    }
    x[i] /= a[i][i];
  }
  return x;
}

const pointId = (x: number, y: number) =>
  `${Math.round(x / 5) * 5},${Math.round(y / 5) * 5}`;

export function simulateDC(
  elements: any[],
  pinMap: Record<string, Point[]>,
  t: number = 0,
) {
  const wireAdj = new Map<string, string[]>();
  const addWireEdge = (p1: Point, p2: Point) => {
    const id1 = pointId(p1.x, p1.y);
    const id2 = pointId(p2.x, p2.y);
    if (!wireAdj.has(id1)) wireAdj.set(id1, []);
    if (!wireAdj.has(id2)) wireAdj.set(id2, []);
    wireAdj.get(id1)!.push(id2);
    wireAdj.get(id2)!.push(id1);
  };

  const compPins = new Map<string, string[]>();
  const groundNodes = new Set<string>();

  elements.forEach((el) => {
    if (el.type === "wire") {
      const wire = el as WireEntity;
      for (let i = 0; i < wire.points.length - 1; i++) {
        addWireEdge(wire.points[i], wire.points[i + 1]);
      }
    } else if (el.type === "component") {
      const comp = el as ComponentEntity;
      const localPins = pinMap[comp.componentType] || [{ x: 0, y: 0 }];
      const rad = (comp.rotation * Math.PI) / 180;
      const pins = localPins.map((p) => ({
        x: comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
        y: comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad),
      }));

      const ids = pins.map((p) => pointId(p.x, p.y));
      compPins.set(comp.id, ids);

      ids.forEach((id) => {
        if (!wireAdj.has(id)) wireAdj.set(id, []);
      });

      if (comp.componentType === "ground") {
        groundNodes.add(ids[0]);
      }
    }
  });

  const gndArray = Array.from(groundNodes);
  for (let i = 0; i < gndArray.length - 1; i++) {
    const id1 = gndArray[i];
    const id2 = gndArray[i + 1];
    wireAdj.get(id1)!.push(id2);
    wireAdj.get(id2)!.push(id1);
  }

  const visited = new Set<string>();
  const nodeIds: string[][] = [];
  const pointToNode = new Map<string, number>();

  for (const [pt] of wireAdj.entries()) {
    if (!visited.has(pt)) {
      const currentGroup: string[] = [];
      const q = [pt];
      visited.add(pt);
      while (q.length > 0) {
        const curr = q.shift()!;
        currentGroup.push(curr);
        for (const neighbor of wireAdj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            q.push(neighbor);
          }
        }
      }
      const nodeIdx = nodeIds.length;
      nodeIds.push(currentGroup);
      currentGroup.forEach((p) => pointToNode.set(p, nodeIdx));
    }
  }

  const numNodes = nodeIds.length;
  if (numNodes === 0)
    return { readings: {}, active: new Set<string>(), hasShortCircuit: false };

  let gndNode = -1;
  for (const g of groundNodes) {
    if (pointToNode.has(g)) {
      gndNode = pointToNode.get(g)!;
      break;
    }
  }
  if (gndNode === -1) gndNode = 0; // Se não tiver ground explícito, usar nó 0 como referência.

  const vSources: {
    compId: string;
    node1: number;
    node2: number;
    v: number;
  }[] = [];
  const iSources: {
    compId: string;
    node1: number;
    node2: number;
    i: number;
  }[] = [];
  const resistors: { node1: number; node2: number; g: number }[] = [];
  const readings: Record<string, string> = {};
  const active = new Set<string>();

  const dt = 0.05; // 50ms time step for simulation update loop

  // Initialize transient state variables if they do not exist
  if (!(window as any)._transientState) {
    (window as any)._transientState = { capVolts: {}, indCurrents: {} };
  }
  const tranState = (window as any)._transientState;

  elements.forEach((el) => {
    if (el.type === "component") {
      const comp = el as ComponentEntity;
      const pins = compPins.get(comp.id);
      if (!pins || pins.length < 2) return;

      if (comp.componentType === "potentiometer" && pins.length >= 3) {
        const totalR = parseValue(comp.value, 10000); // 10k default
        const setting = comp.customProps?.setting ?? 50;
        // Wiper is the 3rd pin (pins[2])
        const n1_pot = pointToNode.get(pins[0])!;
        const n2_pot = pointToNode.get(pins[1])!;
        const nWiper = pointToNode.get(pins[2])!;

        const r1 = Math.max(totalR * (setting / 100), 1e-3);
        const r2 = Math.max(totalR * ((100 - setting) / 100), 1e-3);

        if (n1_pot !== undefined && nWiper !== undefined)
          resistors.push({ node1: n1_pot, node2: nWiper, g: 1 / r1 });
        if (n2_pot !== undefined && nWiper !== undefined)
          resistors.push({ node1: nWiper, node2: n2_pot, g: 1 / r2 });
        return;
      }

      const n1 = pointToNode.get(pins[0])!;
      const n2 = pointToNode.get(pins[1])!;

      if (
        ["arduino_uno", "esp32", "esp32_cam", "raspberry_pi"].includes(
          comp.componentType,
        )
      ) {
        const wMcuPinsMap = (window as any).mcu_pins_map;
        if (wMcuPinsMap) {
          const wMcuPins = wMcuPinsMap[comp.id];
          if (wMcuPins) {
            for (let i = 0; i < pins.length; i++) {
              const nodeMcu = pointToNode.get(pins[i]);
              if (nodeMcu !== undefined) {
                resistors.push({ node1: nodeMcu, node2: gndNode, g: 1e-6 }); // weak pull-down
                const volt = wMcuPins[i];
                if (volt !== undefined && volt !== null) {
                  // Strong driver relative to gnd
                  vSources.push({
                    compId: comp.id,
                    node1: nodeMcu,
                    node2: gndNode,
                    v: volt,
                  });
                }
              }
            }
          }
        }
        return;
      }
      if (comp.componentType === "resistor") {
        const r = parseValue(comp.value, 1000); // 1k ohm por defeito
        resistors.push({ node1: n1, node2: n2, g: 1 / Math.max(r, 1e-3) });
      } else if (
        comp.componentType === "capacitor" ||
        comp.componentType === "capacitor_elec"
      ) {
        const c = parseValue(comp.value, 1e-6, true); // default 1uF
        const gc = c / dt;
        const vPrev = tranState.capVolts[comp.id] || 0;
        resistors.push({ node1: n1, node2: n2, g: gc });
        iSources.push({ compId: comp.id, node1: n1, node2: n2, i: gc * vPrev });
      } else if (comp.componentType === "inductor") {
        const L = parseValue(comp.value, 1e-3); // default 1mH
        const gl = dt / L;
        const iPrev = tranState.indCurrents[comp.id] || 0;
        resistors.push({ node1: n1, node2: n2, g: gl });
        iSources.push({ compId: comp.id, node1: n1, node2: n2, i: -iPrev });
      } else if (
        comp.componentType === "battery" ||
        comp.componentType === "powersupply" ||
        comp.componentType === "ac_source" ||
        comp.componentType === "usb_c" ||
        comp.componentType === "micro_usb"
      ) {
        const vStr = comp.value
          ? comp.value.replace("V", "")
          : comp.componentType === "ac_source"
            ? "220"
            : comp.componentType === "battery"
              ? "9"
              : "5";
        let v = parseValue(vStr, 5);
        if (comp.componentType === "ac_source") {
          const f = 1; // 1 Hz for visual display
          v = v * Math.sin(2 * Math.PI * f * t);
        }

        if (n1 === n2) {
          readings[comp.id] = "SHORT!";
        } else {
          if (comp.componentType === "battery") {
            // The battery symbol has + on the left (pins[0]) and - on the right (pins[1])
            vSources.push({ compId: comp.id, node1: n1, node2: n2, v: v });
          } else {
            vSources.push({ compId: comp.id, node1: n1, node2: n2, v: v });
          }
        }
      } else if (comp.componentType.startsWith("logic_")) {
        // Logic gates: assume pins[0] is input A, pins[1] is input B, pins[7] is output Y (for quad 2-input)
        // Standard 7408/etc has 14 pins. Top left is 1 (index 0).
        // pinMap for logic gates: 14 pins.
        // 1A (pin 0), 1B (pin 1), 1Y (pin 2).
        const n1A = pointToNode.get(pins[0]);
        const n1B = pointToNode.get(pins[1]);
        const n1Y = pointToNode.get(pins[2]);

        // Add high impedance to inputs to ensure numerical stability and default low state
        if (n1A !== undefined)
          resistors.push({ node1: n1A, node2: gndNode, g: 1e-6 });
        if (n1B !== undefined)
          resistors.push({ node1: n1B, node2: gndNode, g: 1e-6 });

        // Read previous voltages if available, or just evaluate dynamically via voltage sources
        const threshold = 2.5;
        if (n1A !== undefined && n1B !== undefined && n1Y !== undefined) {
          // Since we can't easily model non-linear dynamic logic in a static DC pass without iteration,
          // We use a simplified model: if previous voltage (or just random state)
          // Wait, we need pointVoltages from previous frame. We don't have it explicitly stored per element.
          // But we can approximate using `((window as any)._logicState || {})`
          if (!(window as any)._logicState) (window as any)._logicState = {};

          let stateA =
            ((window as any)._logicState[`${comp.id}_A`] || 0) > threshold;
          let stateB =
            ((window as any)._logicState[`${comp.id}_B`] || 0) > threshold;

          let outState = false;
          if (comp.componentType === "logic_and") outState = stateA && stateB;
          else if (comp.componentType === "logic_or")
            outState = stateA || stateB;
          else if (comp.componentType === "logic_nand")
            outState = !(stateA && stateB);
          else if (comp.componentType === "logic_nor")
            outState = !(stateA || stateB);
          else if (comp.componentType === "logic_xor")
            outState = stateA !== stateB;

          let vOut = outState ? 5 : 0;
          vSources.push({
            compId: comp.id,
            node1: n1Y,
            node2: gndNode,
            v: vOut,
          });
        }
      } else if (comp.componentType === "voltmeter") {
        resistors.push({ node1: n1, node2: n2, g: 1e-7 }); // 10 Mohm
      } else if (comp.componentType === "ammeter") {
        vSources.push({ compId: comp.id, node1: n1, node2: n2, v: 0 }); // fonte 0V para medir corrente
      } else if (comp.componentType === "switch") {
        const isClosed = comp.customProps?.closed;
        resistors.push({ node1: n1, node2: n2, g: isClosed ? 1 : 1e-9 }); // 1 ohm or 1000 Mohm
      } else if (comp.componentType === "transistor") {
        const nC = pointToNode.get(pins[0]);
        const nB = pointToNode.get(pins[1]);
        const nE = pointToNode.get(pins[2]);
        if (nC !== undefined && nB !== undefined && nE !== undefined) {
          const lastVolt = (window as any)._lastVoltages || {};
          const vB = lastVolt[pins[1]] || 0;
          const vE = lastVolt[pins[2]] || 0;
          const vBE = vB - vE;

          let rCE = 1e6;
          if (vBE > 0.65) {
            rCE = 5;
            active.add(comp.id);
          }

          resistors.push({ node1: nC, node2: nE, g: 1 / rCE });
          let rBE = vBE > 0.6 ? 100 : 1e6;
          resistors.push({ node1: nB, node2: nE, g: 1 / rBE });
        }
      } else if (comp.componentType === "transistor_pnp") {
        const nC = pointToNode.get(pins[0]);
        const nB = pointToNode.get(pins[1]);
        const nE = pointToNode.get(pins[2]);
        if (nC !== undefined && nB !== undefined && nE !== undefined) {
          const lastVolt = (window as any)._lastVoltages || {};
          const vB = lastVolt[pins[1]] || 0;
          const vE = lastVolt[pins[2]] || 0;
          const vEB = vE - vB;

          let rCE = 1e6;
          if (vEB > 0.65) {
            rCE = 5;
            active.add(comp.id);
          }

          resistors.push({ node1: nC, node2: nE, g: 1 / rCE });
          let rEB = vEB > 0.6 ? 100 : 1e6;
          resistors.push({ node1: nE, node2: nB, g: 1 / rEB });
        }
      } else if (
        comp.componentType === "mosfet" ||
        comp.componentType === "mosfet_p"
      ) {
        const nG = pointToNode.get(pins[0]);
        const nD = pointToNode.get(pins[1]);
        const nS = pointToNode.get(pins[2]);
        if (nG !== undefined && nD !== undefined && nS !== undefined) {
          const lastVolt = (window as any)._lastVoltages || {};
          const vG = lastVolt[pins[0]] || 0;
          const vS = lastVolt[pins[2]] || 0;

          let rDS = 1e6;
          if (comp.componentType === "mosfet") {
            // N-CH
            if (vG - vS > 2.5) rDS = 0.1;
          } else {
            // P-CH
            if (vS - vG > 2.5) rDS = 0.1;
          }

          if (rDS < 1) active.add(comp.id);
          resistors.push({ node1: nD, node2: nS, g: 1 / rDS });
          resistors.push({ node1: nG, node2: nS, g: 1e-9 }); // gate impedance 1000M
        }
      } else if (comp.componentType === "opamp") {
        // LM741: pin 2 is IN- (pins[1]), pin 3 is IN+ (pins[2]), pin 6 is OUT (pins[5])
        // pin 4 is V- (pins[3]), pin 7 is V+ (pins[6])
        // We'll implement a simple voltage-controlled voltage source
        const nInNeg = pointToNode.get(pins[1]);
        const nInPos = pointToNode.get(pins[2]);
        const nOut = pointToNode.get(pins[5]);
        const nVcc = pointToNode.get(pins[6]);
        const nVee = pointToNode.get(pins[3]);

        if (
          nInNeg !== undefined &&
          nInPos !== undefined &&
          nOut !== undefined
        ) {
          const lastVolt = (window as any)._lastVoltages || {};
          const vInNeg = lastVolt[pins[1]] || 0;
          const vInPos = lastVolt[pins[2]] || 0;
          const vcc = lastVolt[pins[6]] || 15;
          const vee = lastVolt[pins[3]] || -15;

          let vDiff = vInPos - vInNeg;
          let vOutTarget = vDiff * 1e5; // Open loop gain

          // Clamp to rails
          if (vOutTarget > vcc - 1) vOutTarget = vcc - 1;
          if (vOutTarget < vee + 1) vOutTarget = vee + 1;

          // High input impedance
          resistors.push({ node1: nInPos, node2: gndNode, g: 1e-6 });
          resistors.push({ node1: nInNeg, node2: gndNode, g: 1e-6 });

          // Controlled voltage source
          vSources.push({
            compId: comp.id,
            node1: nOut,
            node2: gndNode,
            v: vOutTarget,
          });
        }
      } else if (comp.componentType === "timer555") {
        // Pins: 1: GND(0), 2: TRIG(1), 3: OUT(2), 4: RESET(3), 5: CTRL(4), 6: THR(5), 7: DISCH(6), 8: VCC(7)
        const nTrig = pointToNode.get(pins[1]);
        const nOut = pointToNode.get(pins[2]);
        const nThr = pointToNode.get(pins[5]);
        const nDisch = pointToNode.get(pins[6]);
        
        if (nOut !== undefined && nTrig !== undefined && nThr !== undefined && nDisch !== undefined) {
          const lastVolt = (window as any)._lastVoltages || {};
          const vcc = lastVolt[pins[7]] || 5;
          const vTrig = lastVolt[pins[1]] || 0;
          const vThr = lastVolt[pins[5]] || 0;
          const vReset = lastVolt[pins[3]] !== undefined ? lastVolt[pins[3]] : vcc;

          // High impedance inputs
          if (nTrig !== undefined) resistors.push({ node1: nTrig, node2: gndNode, g: 1e-6 });
          if (nThr !== undefined) resistors.push({ node1: nThr, node2: gndNode, g: 1e-6 });

          if (!(window as any)._timer555State) (window as any)._timer555State = {};
          let state = (window as any)._timer555State[comp.id] || false;

          // Flip-flop logic
          if (vReset < 0.7) {
            state = false;
          } else {
            if (vTrig < vcc / 3) {
              state = true;
            } else if (vThr > (2 * vcc) / 3) {
              state = false;
            }
          }
          (window as any)._timer555State[comp.id] = state;

          // Output (Pin 3)
          vSources.push({
            compId: comp.id,
            node1: nOut,
            node2: gndNode,
            v: state ? Math.max(0, vcc - 1.2) : 0.1, // Approximate output logic levels
          });

          // Discharge transistor (Pin 7)
          if (!state) {
            // Closed to ground
            resistors.push({ node1: nDisch, node2: gndNode, g: 0.1 }); // ~10 ohms
          } else {
            // Open string
            resistors.push({ node1: nDisch, node2: gndNode, g: 1e-9 });
          }
        }
      } else if (comp.componentType === "seven_segment") {
        const comNode = pointToNode.get(pins[2]); // We'll just use top-middle as COM
        const segmentPins = [0, 1, 3, 4, 5, 6, 8, 9];
        if (comNode !== undefined) {
          segmentPins.forEach((pIdx) => {
            const sNode = pointToNode.get(pins[pIdx]);
            if (sNode !== undefined) {
              resistors.push({ node1: sNode, node2: comNode, g: 0.05 }); // ~20 ohm per LED segment
            }
          });
        }
      } else if (comp.componentType === "oled") {
        const nVcc = pointToNode.get(pins[1]);
        const nGnd = pointToNode.get(pins[0]);
        if (nVcc !== undefined && nGnd !== undefined) {
          resistors.push({ node1: nVcc, node2: nGnd, g: 0.001 }); // ~1k ohm load
        }
      } else if (
        comp.componentType === "diode" ||
        comp.componentType === "led"
      ) {
        let threshold = comp.componentType === "led" ? 1.8 : 0.6;
        if (comp.componentType === "led") {
          const c = (comp.customProps?.color || "").toLowerCase();
          if (c === "green") threshold = 2.2;
          else if (c === "blue" || c === "white") threshold = 3.0;
          else if (c === "yellow") threshold = 2.1;
        }

        const breakdown = comp.componentType === "led" ? -5.0 : -50.0; 

        const lastVolt = (window as any)._lastVoltages || {};
        const vA = lastVolt[pins[0]] || 0;
        const vK = lastVolt[pins[1]] || 0;
        const vD = vA - vK;
        
        let rD = 1e9;
        let vTh = 0;
        if (vD > threshold) {
          rD = 10; // Forward biased
          vTh = threshold;
        } else if (vD < breakdown) {
          rD = 5; // Reverse breakdown (Zener effect / Avalanche)
          vTh = breakdown;
        }

        resistors.push({ node1: n1, node2: n2, g: 1 / rD });
        if (vTh !== 0) {
          iSources.push({ compId: comp.id, node1: n1, node2: n2, i: vTh / rD });
        }
      } else if (comp.componentType === "lamp") {
        resistors.push({ node1: n1, node2: n2, g: 0.05 });
      } else if (["motor", "buzzer"].includes(comp.componentType)) {
        resistors.push({ node1: n1, node2: n2, g: 0.01 }); // ~100 ohm
      } else if (comp.componentType === "relay") {
        const nNC = pointToNode.get(pins[0]);
        const nNO = pointToNode.get(pins[1]);
        const nCoil1 = pointToNode.get(pins[2]);
        const nCOM = pointToNode.get(pins[3]);
        const nCoil2 = pointToNode.get(pins[4]);

        if (nCoil1 !== undefined && nCoil2 !== undefined) {
          // Coil resistance
          resistors.push({ node1: nCoil1, node2: nCoil2, g: 0.014 }); // ~70 ohms for 5V relay

          const lastVolt = (window as any)._lastVoltages || {};
          const vC1 = lastVolt[pins[2]] || 0;
          const vC2 = lastVolt[pins[4]] || 0;

          // Activate if coil voltage > 3.5V
          const isActive = Math.abs(vC1 - vC2) > 3.5;

          if (nCOM !== undefined) {
            if (isActive && nNO !== undefined) {
              resistors.push({ node1: nCOM, node2: nNO, g: 10 }); // ~0.1 ohm closed
              if (nNC !== undefined)
                resistors.push({ node1: nCOM, node2: nNC, g: 1e-9 }); // open
            } else {
              if (nNC !== undefined)
                resistors.push({ node1: nCOM, node2: nNC, g: 10 }); // ~0.1 ohm closed
              if (nNO !== undefined)
                resistors.push({ node1: nCOM, node2: nNO, g: 1e-9 }); // open
            }
          }
        }
      } else if (comp.componentType === "oscilloscope") {
        resistors.push({ node1: n1, node2: n2, g: 1e-6 }); // 1 Mohm
      }
    }
  });

  const numVars = numNodes + vSources.length;
  const A: number[][] = Array(numVars)
    .fill(0)
    .map(() => Array(numVars).fill(0));
  const B: number[] = Array(numVars).fill(0);

  // Apply resistors
  resistors.forEach((r) => {
    A[r.node1][r.node1] += r.g;
    A[r.node2][r.node2] += r.g;
    A[r.node1][r.node2] -= r.g;
    A[r.node2][r.node1] -= r.g;
  });

  // Add GMIN to prevent singular matrix for floating nodes
  for (let i = 0; i < numNodes; i++) {
    A[i][i] += 1e-9;
  }

  // Apply voltage sources
  vSources.forEach((vs, idx) => {
    const k = numNodes + idx;
    A[vs.node1][k] += 1;
    A[k][vs.node1] += 1;
    A[vs.node2][k] -= 1;
    A[k][vs.node2] -= 1;
    B[k] = vs.v;
  });

  // Apply current sources
  iSources.forEach((is) => {
    B[is.node1] += is.i;
    B[is.node2] -= is.i;
  });

  // Ground constraint
  for (let j = 0; j < numVars; j++) A[gndNode][j] = 0;
  A[gndNode][gndNode] = 1;
  B[gndNode] = 0;

  const x = solveLinearSystem(A, B);
  let hasShortCircuit = false;

  const pointVoltages: Record<string, number> = {};
  if (x) {
    for (const [pt, nodeIdx] of pointToNode.entries()) {
      pointVoltages[pt] = x[nodeIdx];
    }
    elements.forEach((el) => {
      if (el.type === "component") {
        const comp = el as ComponentEntity;
        const pins = compPins.get(comp.id);
        if (!pins || pins.length < 2) return;
        const n1 = pointToNode.get(pins[0])!;
        const n2 = pointToNode.get(pins[1])!;

        const vDiff = x[n1] - x[n2];

        // Update transient states
        if (
          comp.componentType === "capacitor" ||
          comp.componentType === "capacitor_elec"
        ) {
          tranState.capVolts[comp.id] = vDiff;
        } else if (comp.componentType === "inductor") {
          const l = parseValue(comp.value, 1e-3);
          const iPrev = tranState.indCurrents[comp.id] || 0;
          tranState.indCurrents[comp.id] = iPrev + (dt / l) * vDiff;
        }

        if (comp.componentType === "resistor") {
          const r = parseValue(comp.value, 1000);
          const power = (vDiff * vDiff) / Math.max(r, 1e-3);
          const maxPower =
            comp.customProps?.maxPower !== undefined
              ? comp.customProps.maxPower
              : 0.25; // default 1/4W
          if (power > maxPower) {
            readings[comp.id] = "BROKEN!";
          }
        } else if (comp.componentType === "relay") {
          const lastVolt = (window as any)._lastVoltages || {};
          const vC1 = lastVolt[pins[2]] || 0;
          const vC2 = lastVolt[pins[4]] || 0;
          if (Math.abs(vC1 - vC2) > 3.5) active.add(comp.id);
        } else if (
          comp.componentType === "voltmeter" ||
          comp.componentType === "oscilloscope"
        ) {
          readings[comp.id] = formatSimValue(vDiff, "V");
          active.add(comp.id);
        } else if (comp.componentType.startsWith("logic_")) {
          const n1A = pointToNode.get(pins[0]);
          const n1B = pointToNode.get(pins[1]);
          if (n1A !== undefined && n1B !== undefined) {
            (window as any)._logicState[`${comp.id}_A`] = x[n1A];
            (window as any)._logicState[`${comp.id}_B`] = x[n1B];
          }
        } else if (comp.componentType === "ammeter") {
          const vsIdx = vSources.findIndex((vs) => vs.compId === comp.id);
          if (vsIdx >= 0) {
            const current = x[numNodes + vsIdx];
            readings[comp.id] = formatSimValue(current, "A");
            active.add(comp.id);
          }
        } else if (
          comp.componentType === "battery" ||
          comp.componentType === "powersupply" ||
          comp.componentType === "usb_c" ||
          comp.componentType === "micro_usb"
        ) {
          const vsIdx = vSources.findIndex((vs) => vs.compId === comp.id);
          if (vsIdx >= 0) {
            const current = x[numNodes + vsIdx];
            const maxI = comp.customProps?.currentLimit ?? 2;
            if (Math.abs(current) > maxI) hasShortCircuit = true;
          } else if (readings[comp.id] === "SHORT!") {
            hasShortCircuit = true;
          }
        } else if (
          ["led", "diode", "motor", "buzzer", "lamp"].includes(
            comp.componentType,
          )
        ) {
          let hasACConnected = false;
          vSources.forEach((vs) => {
            const sourceComp = elements.find(
              (e) => e.id === vs.compId,
            ) as ComponentEntity;
            if (sourceComp && sourceComp.componentType === "ac_source") {
              hasACConnected = true; // Simple heuristic: if there's an AC source, assume it's AC powered if voltage is high enough
            }
          });

          if (comp.componentType === "led") {
            const vA = x[n1] || 0;
            const vK = x[n2] || 0;
            const vD = vA - vK;
            
            let threshold = 1.8;
            const c = (comp.customProps?.color || "").toLowerCase();
            if (c === "green") threshold = 2.2;
            else if (c === "blue" || c === "white") threshold = 3.0;
            else if (c === "yellow") threshold = 2.1;

            if (vD > threshold + 0.01 && vD <= threshold + 0.4) {
               active.add(comp.id);
            } else if (vD > threshold + 0.4 || vD < -5.5) {
               readings[comp.id] = "BROKEN!";
            }
          } else if (comp.componentType === "lamp") {
            // Lamp only works with AC
            if (hasACConnected && Math.abs(vDiff) >= 1.0) {
              active.add(comp.id);
            }
          } else {
            if (
              vDiff >= 0.1 ||
              (!["diode"].includes(comp.componentType) &&
                Math.abs(vDiff) >= 0.1)
            ) {
              active.add(comp.id);
            }
          }
        }
      }
    });
  }

  (window as any)._lastVoltages = pointVoltages;
  (window as any)._circuitReadings = readings;
  return { readings, active, hasShortCircuit, pointVoltages };
}
