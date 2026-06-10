import { astarRoute } from "../lib/astar";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer, Circle, Line, Text, Group, Rect } from "react-konva";
import { useEditor } from "../store";
import { BuzzerAudio } from "../lib/BuzzerAudio";
import {
  ResistorSymbol,
  CapacitorSymbol,
  CapacitorElectrolyticSymbol,
  GroundSymbol,
  ICSymbol,
  InductorSymbol,
  DiodeSymbol,
  BatterySymbol,
  SwitchSymbol,
  LEDSymbol,
  LampSymbol,
  PowerSupplySymbol,
  PCBDIP8Symbol,
  PCBSMDSymbol,
  PCBPadSymbol,
  PCBViaSymbol,
  ArduinoUnoSymbol,
  ESP32Symbol,
  ESP32CamSymbol,
  RaspberryPiSymbol,
  BuzzerSymbol,
  RelaySymbol,
  PotentiometerSymbol,
  OLEDSymbol,
  MotorSymbol,
  PCBSot23Symbol,
  PCBTo220Symbol,
  PCBSopSymbol,
  PCBQfpSymbol,
  TransistorSymbol,
  TransistorPNPSymbol,
  PCBBGASymbol,
  PCBPinHeaderSymbol,
  PCBUSBCSymbol,
  PCBMicroUSBSymbol,
  MosfetSymbol,
  MosfetPSymbol,
  Timer555Symbol,
  OpampSymbol,
  LogicGateSymbol,
  LogicAndSymbol,
  LogicOrSymbol,
  LogicNandSymbol,
  LogicNorSymbol,
  LogicXorSymbol,
  ACSourceSymbol,
  VoltmeterSymbol,
  AmmeterSymbol,
  OscilloscopeSymbol,
  SevenSegmentSymbol,
  PCBCR2032Symbol,
  PCBLDRSMDSymbol,
  PCBNTCSMDSymbol,
  PCBCrystalSymbol,
  PCBCopperPourSymbol,
  PCBFiducialSymbol,
  PCBMountingHoleSymbol,
  PCBTestPointSymbol,
  ProtoboardSymbol,
  USBCSymbol,
  MicroUSBSymbol,
} from "./Symbols";
import { snapToGrid, GRID_SIZE, cn } from "../lib/utils";
import {
  ComponentType,
  WireEntity,
  ComponentEntity,
  Point,
  PcbComponentType,
  PcbComponentEntity,
  TraceEntity,
  PcbBoardEntity,
  PcbElement,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { pinMap, pcbPinMap } from "../lib/pinmap";
import { simulateDC } from "../lib/simulator";
import { TriangleAlert, ZoomIn, ZoomOut } from "lucide-react";
import { CanvasViewer3D } from "./CanvasViewer3D";

function getOrthogonalPoints(p1: Point, p2: Point): Point[] {
  // If aligned horizontally or vertically already
  if (Math.abs(p1.x - p2.x) < 5 || Math.abs(p1.y - p2.y) < 5) {
    return [p1, p2];
  }
  // Add an elbow (L shape)
  // We determine direction based on longest distance
  if (Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y)) {
    return [p1, { x: p2.x, y: p1.y }, p2];
  } else {
    return [p1, { x: p1.x, y: p2.y }, p2];
  }
}

const doAutoRoute = (
  elements: any[],
  pcbElements: any[],
  setPcbElements: any,
  pinMap: any,
  astarRoute: any,
  uuidv4: any,
) => {
  const newPcbElements = [...pcbElements.filter((el) => el.type !== "trace")];
  const components = newPcbElements.filter(
    (el) => el.type === "pcb_component",
  ) as any[];
  const schComponents = elements.filter(
    (el) => el.type === "component",
  ) as any[];

  if (components.length < 2) return;

  const pointId = (x: number, y: number) =>
    Math.round(x / 5) * 5 + "," + Math.round(y / 5) * 5;
  const wireAdj = new Map<string, Set<string>>();
  const addWireEdge = (p1: any, p2: any) => {
    const id1 = pointId(p1.x, p1.y);
    const id2 = pointId(p2.x, p2.y);
    if (!wireAdj.has(id1)) wireAdj.set(id1, new Set());
    if (!wireAdj.has(id2)) wireAdj.set(id2, new Set());
    wireAdj.get(id1)!.add(id2);
    wireAdj.get(id2)!.add(id1);
  };

  elements.forEach((el) => {
    if (el.type === "wire") {
      const w = el as any;
      for (let i = 0; i < w.points.length - 1; i++) {
        addWireEdge(w.points[i], w.points[i + 1]);
      }
    }
  });

  const compPins = new Map<string, string[]>();
  schComponents.forEach((comp) => {
    const localPins = pinMap[comp.componentType] || [{ x: 0, y: 0 }];
    const rad = (comp.rotation * Math.PI) / 180;
    const pins = localPins.map((p: any) => ({
      x: comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad),
    }));
    const ids = pins.map((p: any) => pointId(p.x, p.y));
    if (comp.name) {
      compPins.set(comp.name, ids);
    }
    ids.forEach((id: any) => {
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
    const pcbPoints: { x: number; y: number }[] = [];
    components.forEach((pcbComp) => {
      if (!pcbComp.name) return;
      const schPins = compPins.get(pcbComp.name);
      if (schPins) {
        schPins.forEach((pinId, idx) => {
          if (net.has(pinId)) {
            const pcbType = pcbComp.componentType;
            const localPins = pcbPinMap[pcbType];
            if (localPins && localPins[idx]) {
              const rad = (pcbComp.rotation * Math.PI) / 180;
              const pbp = localPins[idx];
              pcbPoints.push({
                x: pcbComp.x + pbp.x * Math.cos(rad) - pbp.y * Math.sin(rad),
                y: pcbComp.y + pbp.x * Math.sin(rad) + pbp.y * Math.cos(rad),
              });
            } else {
              pcbPoints.push({ x: pcbComp.x, y: pcbComp.y });
            }
          }
        });
      }
    });

    if (pcbPoints.length > 1) {
      for (let j = 0; j < pcbPoints.length - 1; j++) {
        const p1 = pcbPoints[j];
        const p2 = pcbPoints[j + 1];
        const obstacles = components.map((c) => ({
          x: c.x,
          y: c.y,
          width: 20,
          height: 20,
        }));
        const pts = astarRoute(p1, p2, obstacles, 5);
        newPcbElements.push({
          id: uuidv4(),
          type: "trace",
          points: pts,
          layer: i % 2 === 0 ? "bottom" : "top",
          width: 4,
        } as any);
      }
    }
  });

  setPcbElements(newPcbElements);
};
export function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const {
    mode,
    setMode,
    elements,
    pcbElements,
    setPcbElements,
    tool,
    pcbTool,
    activePcbLayer,
    setTool,
    setPcbTool,
    zoom,
    setZoom,
    pan,
    setPan,
    selectedIds,
    setSelectedIds,
    addElement,
    updateElement,
    updateElements,
    removeElement,
    boardTheme,
    isSimulating,
    activeWireColor,
  } = useEditor();

  const [probePos, setProbePos] = useState<Point | null>(null);

  const [wiring, setWiring] = useState<{
    active: boolean;
    start: Point | null;
    current: Point | null;
  }>({
    active: false,
    start: null,
    current: null,
  });

  const activeTool = mode === "schematic" ? tool : pcbTool;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA"].includes(
        document.activeElement?.tagName || "",
      );
      if (!isInput && (e.key === "Delete" || e.key === "Backspace")) {
        if (selectedIds.length > 0) {
          selectedIds.forEach((id) => removeElement(id));
          setSelectedIds([]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, removeElement, setSelectedIds]);

  useEffect(() => {
    const handleExport = (e: any) => {
      const format = e.detail?.format || "png";
      if (stageRef.current) {
        // Create a temporary stage to export without grid if in PCB mode?
        // Keep it simple for now and export as is.
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        if (format === "png") {
          const link = document.createElement("a");
          link.download = `AllvaTronics-${mode}.png`;
          link.href = uri;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === "pdf") {
          import("jspdf").then(({ jsPDF }) => {
            const pdf = new jsPDF("l", "px", [size.width, size.height]);
            pdf.addImage(uri, "PNG", 0, 0, size.width, size.height);
            pdf.save(`AllvaTronics-${mode}.pdf`);
          });
        }
      }
    };

    const handleExportToPcb = () => {
      const newPcbElements: PcbElement[] = [];
      // Create a default board
      newPcbElements.push({
        id: uuidv4(),
        type: "board",
        x: 200,
        y: 200,
        width: 400,
        height: 300,
      });

      // Map schematic components to PCB footprints
      let pcbX = 220;
      let pcbY = 220;
      elements.forEach((el) => {
        if (el.type === "component") {
          const comp = el as ComponentEntity;
          let pcbType: PcbComponentType = "smd";
          // Simple mapping
          if (
            comp.componentType === "resistor" ||
            comp.componentType === "diode"
          )
            pcbType = "smd"; // Replace with a specific one if needed
          else if (
            comp.componentType === "capacitor" ||
            comp.componentType === "capacitor_elec"
          )
            pcbType = "smd";
          else if (comp.componentType === "led") pcbType = "smd";
          else if (
            comp.componentType === "transistor" ||
            comp.componentType === "transistor_pnp" ||
            comp.componentType === "mosfet" ||
            comp.componentType === "mosfet_p"
          )
            pcbType = "to220";
          else if (
            comp.componentType === "ic" ||
            comp.componentType === "timer555" ||
            comp.componentType === "opamp" ||
            comp.componentType.startsWith("logic_")
          )
            pcbType = "dip8";
          else if (
            comp.componentType === "arduino_uno" ||
            comp.componentType === "esp32" ||
            comp.componentType === "esp32_cam" ||
            comp.componentType === "raspberry_pi"
          )
            pcbType = "bga"; // arbitrary mapping for MCU
          else if (comp.componentType === "battery") pcbType = "cr2032";
          else if (comp.componentType === "usb_c") pcbType = "usb_c";
          else if (comp.componentType === "micro_usb") pcbType = "micro_usb";
          else pcbType = "pad";

          newPcbElements.push({
            id: uuidv4(),
            type: "pcb_component",
            componentType: pcbType,
            x: pcbX,
            y: pcbY,
            rotation: 0,
            name: comp.name,
            layer: "top",
          });

          pcbX += 50;
          if (pcbX > 500) {
            pcbX = 220;
            pcbY += 50;
          }
        }
      });

      // Update state
      setPcbElements(newPcbElements);
      setMode("pcb");
    };

    const handleAutoRoute = () => {
      doAutoRoute(
        elements,
        pcbElements,
        setPcbElements,
        pinMap,
        astarRoute,
        uuidv4,
      );
      alert("Auto-Routing baseado no esquemático concluído!");
    };

    const handleRunDRC = () => {
      let errorCount = 0;
      let errors: string[] = [];

      // 1. Components outside board
      const board = pcbElements.find((el) => el.type === "board") as any;
      const components = pcbElements.filter(
        (el) => el.type === "pcb_component",
      ) as any[];
      if (board) {
        const rx = board.x - board.width / 2;
        const ry = board.y - board.height / 2;
        const rx2 = board.x + board.width / 2;
        const ry2 = board.y + board.height / 2;

        components.forEach((c) => {
          if (c.x < rx || c.x > rx2 || c.y < ry || c.y > ry2) {
            errorCount++;
            errors.push(`Componente fora da placa: ID ${c.id.substring(0, 4)}`);
          }
        });
      }

      // 2. Trace clearance check and intersections
      const traces = pcbElements.filter((el) => el.type === "trace") as any[];
      const lineIntersects = (p1: any, p2: any, p3: any, p4: any) => {
        const det =
          (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
        if (det === 0) return false;
        const lambda =
          ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
        const gamma =
          ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
      };

      for (let i = 0; i < traces.length; i++) {
        for (let j = i + 1; j < traces.length; j++) {
          const t1 = traces[i],
            t2 = traces[j];
          if (t1.layer === t2.layer && t1.points && t2.points) {
            for (let m = 0; m < t1.points.length - 1; m++) {
              for (let n = 0; n < t2.points.length - 1; n++) {
                const p1 = t1.points[m],
                  p2 = t1.points[m + 1];
                const p3 = t2.points[n],
                  p4 = t2.points[n + 1];

                // Very simple overlap check
                if (lineIntersects(p1, p2, p3, p4)) {
                  errorCount++;
                  if (errors.length < 10)
                    errors.push(
                      `Trilhas em curto/sobrepostas na camada ${t1.layer || "top"}.`,
                    );
                }
              }
            }
          }
        }
      }

      // 3. Unconnected components based on schematic constraints
      if (traces.length === 0 && components.length > 1) {
        errorCount++;
        errors.push(`Nenhuma trilha desenhada. Faltam conexões.`);
      }

      // 4. Trace width limits (DRC trace width minimum)
      const minClearance = 0.2; // mm
      traces.forEach((t) => {
        const w = t.width || 2;
        if (w < 1) {
          // let's assume < 1mm is warning for this simple demo
          errorCount++;
          if (errors.length < 10)
            errors.push(
              `Aviso: Largura da trilha muito fina (${w}mm). ID: ${t.id.substring(0, 4)}`,
            );
        }
      });

      if (errorCount === 0) {
        alert("DRC Passou! Nenhuma violação encontrada.");
      } else {
        alert(
          `Erros de DRC encontrados (${errorCount}):\n` +
            errors.slice(0, 10).join("\n") +
            (errors.length > 10 ? "\n..." : ""),
        );
      }
    };

    const handleExportGerber = () => {
      let gerber =
        "%FSLAX26Y26*%\n%MOMM*%\n%ADD10C,0.2000*%\n%ADD11C,1.5000*%\n";
      gerber += "G01*\n";

      const traces = pcbElements.filter(
        (e: any) => e.type === "trace",
      ) as any[];
      gerber += "D10*\n";
      traces.forEach((t) => {
        if (!t.points || t.points.length === 0) return;
        gerber += `X${Math.round(t.points[0].x * 1000)}Y${Math.round(-t.points[0].y * 1000)}D02*\n`; // negate Y for gerber
        for (let i = 1; i < t.points.length; i++) {
          gerber += `X${Math.round(t.points[i].x * 1000)}Y${Math.round(-t.points[i].y * 1000)}D01*\n`;
        }
      });

      gerber += "M02*\n";

      // Just a simulated export
      const blob = new Blob([gerber], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "board.gbr";
      a.click();
      URL.revokeObjectURL(url);
    };

    window.addEventListener("export-canvas", handleExport);
    window.addEventListener("export-to-pcb", handleExportToPcb);
    window.addEventListener("auto-route-pcb", handleAutoRoute);
    window.addEventListener("run-drc", handleRunDRC);
    window.addEventListener("export-gerber", handleExportGerber);

    return () => {
      window.removeEventListener("export-canvas", handleExport);
      window.removeEventListener("export-to-pcb", handleExportToPcb);
      window.removeEventListener("auto-route-pcb", handleAutoRoute);
      window.removeEventListener("run-drc", handleRunDRC);
      window.removeEventListener("export-gerber", handleExportGerber);
    };
  }, [mode, size, elements]);

  const handlePointerDown = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    // Transform position relative to pan/zoom
    const x = (pos.x - pan.x) / zoom;
    const y = (pos.y - pan.y) / zoom;
    let snappedX = snapToGrid(x);
    let snappedY = snapToGrid(y);

    if (activeTool === "wire" || activeTool === "trace") {
      let closestDist = 40;
      elements.forEach((el) => {
        if (el.type === "component") {
          const comp = el as ComponentEntity;
          const localPins = pinMap[comp.componentType] || [];
          const rad = (comp.rotation * Math.PI) / 180;
          localPins.forEach((p) => {
            const pinGlobalX =
              comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad);
            const pinGlobalY =
              comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad);
            const dist = Math.sqrt(
              Math.pow(x - pinGlobalX, 2) + Math.pow(y - pinGlobalY, 2),
            );
            if (dist < closestDist) {
              closestDist = dist;
              snappedX = pinGlobalX;
              snappedY = pinGlobalY;
            }
          });
        }
      });
    }

    if (
      e.evt.button === 1 ||
      (e.evt.button === 0 && activeTool === "select" && e.target === stage)
    ) {
      // Middle click pan start, or background drag
      setSelectedIds([]); // deselect
      return;
    }

    if (activeTool === "eraser") {
      return; // Handle on child clicks
    }

    if (mode === "schematic") {
      if (tool === "wire") {
        if (!wiring.active) {
          setWiring({
            active: true,
            start: { x: snappedX, y: snappedY },
            current: { x: snappedX, y: snappedY },
          });
        } else {
          // Finish drawing wire
          if (wiring.start && wiring.current) {
            addElement({
              type: "wire",
              points: getOrthogonalPoints(wiring.start, wiring.current),
              color: activeWireColor,
            });
          }
          setWiring({ active: false, start: null, current: null });
        }
        return;
      }

      if (tool !== "select") {
        const typeLetters: Record<string, string> = {
          resistor: "R",
          capacitor: "C",
          inductor: "L",
          diode: "D",
          led: "LED",
          lamp: "LAMP",
          powersupply: "PSU",
          battery: "BT",
          switch: "SW",
          ic: "U",
          seven_segment: "DS",
          ground: "GND",
          arduino_uno: "UNO",
          esp32: "ESP",
          esp32_cam: "CAM",
          raspberry_pi: "RPI",
          buzzer: "BZ",
          relay: "K",
          potentiometer: "RV",
          oled: "DISP",
          motor: "M",
          transistor: "Q",
          transistor_pnp: "Q",
          capacitor_elec: "C",
        };

        const count =
          elements.filter(
            (el) =>
              el.type === "component" &&
              (el as ComponentEntity).componentType === tool,
          ).length + 1;

        const prefix = typeLetters[tool] || tool.toUpperCase().slice(0, 2);
        
        let defValue: string | undefined = undefined;
        if (tool === "ac_source") defValue = "220V";
        else if (tool === "battery") defValue = "9V";
        else if (tool === "powersupply") defValue = "5V";
        else if (tool === "resistor") defValue = "1k";
        else if (tool === "capacitor" || tool === "capacitor_elec") defValue = "10uF";
        else if (tool === "inductor") defValue = "1mH";
        else if (tool === "transistor") defValue = "2N2222";
        else if (tool === "transistor_pnp") defValue = "2N3906";
        else if (tool === "mosfet") defValue = "IRFZ44N";
        else if (tool === "mosfet_p") defValue = "IRF4905";
        else if (tool === "ic") defValue = "LM358";
        else if (tool === "timer555") defValue = "NE555";
        else if (tool === "opamp") defValue = "LM741";

        addElement({
          type: "component",
          componentType: tool as ComponentType,
          x: snappedX,
          y: snappedY,
          rotation: 0,
          value: defValue,
          name: `${prefix}${count}`,
        });
      }
    } else {
      // PCB mode
      if (pcbTool === "board") {
        addElement({
          type: "board",
          x: snappedX,
          y: snappedY,
          width: 200,
          height: 150,
        });
        return;
      }

      if (pcbTool === "trace") {
        if (!wiring.active) {
          setWiring({
            active: true,
            start: { x: snappedX, y: snappedY },
            current: { x: snappedX, y: snappedY },
          });
        } else {
          if (wiring.start && wiring.current) {
            addElement({
              type: "trace",
              points: getOrthogonalPoints(wiring.start, wiring.current),
              layer: activePcbLayer,
            });
          }
          setWiring({ active: false, start: null, current: null });
        }
        return;
      }

      const isVia = pcbTool === "via";
      if (
        [
          "pad",
          "via",
          "dip8",
          "smd",
          "sot23",
          "to220",
          "sop",
          "qfp",
          "bga",
          "pinheader",
          "usb_c",
          "micro_usb",
          "cr2032",
          "ldr_smd",
          "ntc_smd",
          "crystal",
          "copper_pour",
          "fiducial",
          "mounting_hole",
          "test_point",
        ].includes(pcbTool)
      ) {
        const pcbTypeLetters: Record<string, string> = {
          pad: "P",
          via: "V",
          dip8: "U",
          smd: "J",
          sot23: "Q",
          to220: "Q",
          sop: "U",
          qfp: "U",
          bga: "U",
          pinheader: "J",
          usb_c: "J",
          micro_usb: "J",
          cr2032: "BT",
          ldr_smd: "LDR",
          ntc_smd: "NTC",
          crystal: "Y",
          copper_pour: "POUR",
          fiducial: "FID",
          mounting_hole: "H",
          test_point: "TP",
        };
        const count =
          pcbElements.filter(
            (el) =>
              el.type === "pcb_component" &&
              (el as PcbComponentEntity).componentType === pcbTool,
          ).length + 1;

        addElement({
          type: "pcb_component",
          componentType: pcbTool as PcbComponentType,
          x: snappedX,
          y: snappedY,
          rotation: 0,
          name: `${pcbTypeLetters[pcbTool]}${count}`,
          layer: isVia ? undefined : activePcbLayer,
        });
      }
    }
  };

  const handlePointerMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = (pos.x - pan.x) / zoom;
    const y = (pos.y - pan.y) / zoom;
    let snappedX = snapToGrid(x);
    let snappedY = snapToGrid(y);

    if (activeTool === "probe") {
      setProbePos({ x: snappedX, y: snappedY });
    } else if (probePos) {
      setProbePos(null);
    }

    if (wiring.active) {
      let closestDist = 40;
      elements.forEach((el) => {
        if (el.type === "component") {
          const comp = el as ComponentEntity;
          const localPins = pinMap[comp.componentType] || [];
          const rad = (comp.rotation * Math.PI) / 180;
          localPins.forEach((p) => {
            const pinGlobalX =
              comp.x + p.x * Math.cos(rad) - p.y * Math.sin(rad);
            const pinGlobalY =
              comp.y + p.x * Math.sin(rad) + p.y * Math.cos(rad);
            const dist = Math.sqrt(
              Math.pow(x - pinGlobalX, 2) + Math.pow(y - pinGlobalY, 2),
            );
            if (dist < closestDist) {
              closestDist = dist;
              snappedX = pinGlobalX;
              snappedY = pinGlobalY;
            }
          });
        }
      });
      setWiring((prev) => ({ ...prev, current: { x: snappedX, y: snappedY } }));
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = (pos.x - pan.x) / zoom;
    const y = (pos.y - pan.y) / zoom;

    // Check if we are hovering a selected component
    // If so, mouse wheel rotates it instead of zooming
    let hoveringSelected = false;
    let hoveringId = null;
    if (selectedIds.length > 0) {
      for (const el of [...elements, ...pcbElements]) {
        if (selectedIds.includes(el.id)) {
          const cx = (el as any).x;
          const cy = (el as any).y;
          if (
            cx !== undefined &&
            cy !== undefined &&
            Math.abs(cx - x) < 30 &&
            Math.abs(cy - y) < 30
          ) {
            hoveringSelected = true;
            hoveringId = el.id;
            break;
          }
        }
      }
    }

    if (hoveringSelected || e.evt.shiftKey) {
      const angleDelta = e.evt.deltaY > 0 ? 90 : -90; // Snap to 90 degrees by default for PCB components
      selectedIds.forEach((id) => {
        const el =
          mode === "schematic"
            ? elements.find((e) => e.id === id)
            : pcbElements.find((e) => e.id === id);

        if (el && "rotation" in el) {
          let rot = ((el as any).rotation || 0) + (e.evt.deltaY > 0 ? 15 : -15);
          if (!e.evt.shiftKey) rot = Math.round(rot / 90) * 90;
          updateElement(id, { rotation: rot });
        }
      });
      return;
    }

    const scaleBy = 1.1;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 10)); // limits

    setZoom(newScale);
    setPan({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const drawGrid = useMemo(() => {
    const minX = -pan.x / zoom;
    const minY = -pan.y / zoom;
    const maxX = (size.width - pan.x) / zoom;
    const maxY = (size.height - pan.y) / zoom;

    const renderGridSize = 10;

    const startX = Math.floor(minX / renderGridSize) * renderGridSize;
    const endX = Math.ceil(maxX / renderGridSize) * renderGridSize;
    const startY = Math.floor(minY / renderGridSize) * renderGridSize;
    const endY = Math.ceil(maxY / renderGridSize) * renderGridSize;

    const dotColor =
      mode === "pcb"
        ? boardTheme === "light"
          ? "#60a5fa"
          : "#3a3a45"
        : "#94a3b8"; // darker grid for light schematic

    const dots = [];
    for (let x = startX; x <= endX; x += renderGridSize) {
      for (let y = startY; y <= endY; y += renderGridSize) {
        dots.push(
          <Circle key={`${x}-${y}`} x={x} y={y} radius={1} fill={dotColor} />,
        );
      }
    }
    return dots;
  }, [pan, zoom, size, mode, boardTheme]);

  const [simTime, setSimTime] = useState(0);

  useEffect(() => {
    let frameId: number;
    let startTime = performance.now() - simTime * 1000;
    const loop = (time: number) => {
      setSimTime((time - startTime) / 1000);
      frameId = requestAnimationFrame(loop);
    };
    if (isSimulating) {
      startTime = performance.now() - simTime * 1000;
      frameId = requestAnimationFrame(loop);
    } else {
      setSimTime(0);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isSimulating]);

  // Reset simulator state when simulation starts
  useEffect(() => {
    if (isSimulating) {
      (window as any).mcuContexts = {};
      (window as any)._transientState = undefined;
      (window as any)._logicState = {};
    }
  }, [isSimulating]);

  const circuitState = useMemo(() => {
    if (mode !== "schematic")
      return {
        active: new Set<string>(),
        hasShortCircuit: false,
        readings: {} as Record<string, string>,
        pointVoltages: {} as Record<string, number>,
      };

    // Execute MCU Emulators
    const mcuMap =
      (window as any).mcuContexts || ((window as any).mcuContexts = {});
    let mcuPinsMap: Record<string, number[]> = {};

    elements.forEach((c) => {
      if (
        c.type === "component" &&
        ["arduino_uno", "esp32", "esp32_cam", "raspberry_pi"].includes(
          c.componentType,
        )
      ) {
        const code = c.customProps?.code;
        let Mcu = mcuMap[c.id];
        if (!Mcu) {
          // ESP32 and Arduino have different numbers of pins, 40 is safe max for now
          Mcu = mcuMap[c.id] = {
            state: {},
            pins: new Array(40).fill(undefined),
            digitalRead: () => 0,
            analogRead: () => 0,
          };
        }

        // Update I/O functions

        const mapPin = (pin: any) => {
          const type = c.componentType;
          let p = String(pin).toUpperCase().replace(/^D/, '');
          if (type === 'arduino_uno') {
            const top = ['13','12','11','10','9','8','7','6','5','4','3','2','TX','RX'];
            const bot = ['IOREF','RST','3V3','5V','GND','GND2','VIN','A0','A1','A2','A3','A4','A5','AREF'];
            if (top.includes(p)) return top.indexOf(p);
            if (bot.includes(p)) return bot.indexOf(p) + 14;
            if (p==='GND') return 18;
          } else if (type === 'esp32') {
            const left = ['3V3','EN','VP','VN','34','35','32','33','25','26','27','14','12','GND','13'];
            const right = ['GND2','23','22','TX0','RX0','21','GND3','19','18','5','17','16','4','2','15'];
            if (left.includes(p)) return left.indexOf(p);
            if (right.includes(p)) return right.indexOf(p) + 15;
            if (p==='GND') return 13;
          } else if (type === 'esp32_cam') {
            const left = ['5V','GND','12','13','15','14','2','4'];
            const right = ['3V3','U0R','U0T','GND2','16','0','VCC','GND3'];
            if (left.includes(p)) return left.indexOf(p);
            if (right.includes(p)) return right.indexOf(p) + 8;
            if (p==='GND') return 1;
          }
          return parseInt(p) || 0;
        };

        Mcu.digitalWrite = (pin: any, value: number) => {
          const idx = mapPin(pin);
          Mcu.pins[idx] = value ? 5 : 0;
        };
        Mcu.analogWrite = (pin: any, value: number) => {
          const idx = mapPin(pin);
          Mcu.pins[idx] = Math.max(0, Math.min(5, value * 5 / 255)); // Assuming 0-255 like arduino
        };

        Mcu.analogRead = (pin: any) => {
          const pinIndex = mapPin(pin);
          const lastV = (window as any)._lastVoltages;
          if (!lastV) return 0;
          const rad = (c.rotation * Math.PI) / 180;
          const pList = pinMap[c.componentType] || [];
          const pLoc = pList[pinIndex];
          if (pLoc) {
            const px =
              Math.round(
                (c.x + pLoc.x * Math.cos(rad) - pLoc.y * Math.sin(rad)) / 5,
              ) * 5;
            const py =
              Math.round(
                (c.y + pLoc.x * Math.sin(rad) + pLoc.y * Math.cos(rad)) / 5,
              ) * 5;
            return lastV[`${px},${py}`] || 0;
          }
          return 0;
        };
        Mcu.digitalRead = (pin: any) => Mcu.analogRead(pin) > 1.5 ? 1 : 0;

        if (code && typeof code === "string") {
          try {
            const fn = new Function("time", "Mcu", code);
            fn(simTime, Mcu);
          } catch (e) {
            // Ignore user code errors quietly or log them
            console.warn("MCU Code Error:", e);
          }
        }
        mcuPinsMap[c.id] = Mcu.pins;
      }
    });

    (window as any).mcu_pins_map = mcuPinsMap;

    return simulateDC(elements, pinMap, simTime);
  }, [elements, mode, isSimulating, simTime]);

  const activeElements = mode === "schematic" ? elements : pcbElements;
  const sortedActiveElements = [...activeElements].sort((a, b) => {
    const isBgA =
      a.type === "board" ||
      (a.type === "component" &&
        [
          "protoboard",
          "arduino_uno",
          "raspberry_pi",
          "esp32",
          "esp32_cam",
        ].includes(a.componentType));
    const isBgB =
      b.type === "board" ||
      (b.type === "component" &&
        [
          "protoboard",
          "arduino_uno",
          "raspberry_pi",
          "esp32",
          "esp32_cam",
        ].includes(b.componentType));
    if (isBgA && !isBgB) return -1;
    if (!isBgA && isBgB) return 1;
    return 0;
  });

  const bgColor = mode === "pcb" ? boardTheme === "light" ? "bg-[#111111]" : "bg-[#000000]" : "bg-[#ffffe6]";

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 relative overflow-hidden", bgColor)}
      style={{ cursor: activeTool === "select" ? "default" : "crosshair" }}
    >
      {isSimulating && circuitState.hasShortCircuit && mode === "schematic" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 border border-red-500/50 text-white px-4 py-2 rounded-md font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse flex items-center space-x-2 pointer-events-none">
          <TriangleAlert className="w-5 h-5 text-red-100" />
          <span>CURTO-CIRCUITO DETECTADO</span>
        </div>
      )}
      
      {elements
        .filter((el) => el.type === "component" && (el as any).componentType === "buzzer")
        .map((buzzer) => (
          <BuzzerAudio key={buzzer.id} isAlive={isSimulating && circuitState.active.has(buzzer.id)} />
      ))}
      
      {size.width > 0 && size.height > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onWheel={handleWheel}
          draggable={activeTool === "select"}
          onDragMove={(e) => {
            if (e.target === e.target.getStage() && activeTool === "select") {
              setPan({ x: e.target.x(), y: e.target.y() });
            }
          }}
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
          onClick={(e) => {
            if (e.target === stageRef.current) setSelectedIds([]);
          }}
          onTap={(e) => {
            if (e.target === stageRef.current) setSelectedIds([]);
          }}
        >
          <Layer listening={false}>{drawGrid}</Layer>

          <Layer>
            {sortedActiveElements.map((el) => {
              const isSelected = selectedIds.includes(el.id);

              if (el.type === "board") {
                const board = el as PcbBoardEntity;
                return (
                  <Rect
                    key={board.id}
                    x={board.x}
                    y={board.y}
                    width={board.width}
                    height={board.height}
                    stroke={isSelected ? "#a78bfa" : "#fbbf24"}
                    strokeWidth={isSelected ? 4 : 2}
                    fill="rgba(0,0,0,0)"
                    draggable={pcbTool === "select"}
                    onDragEnd={(e) => {
                      let newX = snapToGrid(e.target.x());
                      let newY = snapToGrid(e.target.y());
                      e.target.position({ x: newX, y: newY });
                      updateElement(board.id, { x: newX, y: newY });
                    }}
                    onClick={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(board.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([board.id]);
                      }
                    }}
                    onTap={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(board.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([board.id]);
                      }
                    }}
                  />
                );
              }

              if (el.type === "wire") {
                const points = el.points.map((p) => [p.x, p.y]).flat();
                return (
                  <Line
                    key={el.id}
                    points={points}
                    stroke={
                      isSelected
                        ? "#4ade80"
                        : mode === "schematic"
                          ? ((el as any).color || "#008400")
                          : "#22c55e"
                    }
                    strokeWidth={(el as any).width || 2}
                    hitStrokeWidth={10}
                    onClick={(e) => {
                      if (tool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(el.id);
                      } else if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([el.id]);
                      }
                    }}
                    onTap={(e) => {
                      if (tool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(el.id);
                      } else if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([el.id]);
                      }
                    }}
                  />
                );
              }

              if (el.type === "trace") {
                const trace = el as TraceEntity;
                const points = trace.points.map((p) => [p.x, p.y]).flat();
                const isTop = trace.layer === "top";
                let stroke = isSelected
                  ? "#a78bfa"
                  : isTop
                    ? "#ef4444"
                    : "#3b82f6"; // purple if selected, red/blue for layer

                return (
                  <Line
                    key={el.id}
                    points={points}
                    stroke={stroke}
                    strokeWidth={trace.width || 4}
                    hitStrokeWidth={12}
                    opacity={0.8}
                    onClick={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(el.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([el.id]);
                      }
                    }}
                    onTap={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(el.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([el.id]);
                      }
                    }}
                  />
                );
              }

              if (el.type === "component") {
                const comp = el as ComponentEntity;
                const props = {
                  x: comp.x,
                  y: comp.y,
                  rotation: comp.rotation,
                  selected: isSelected,
                };

                let SymbolView;
                switch (comp.componentType) {
                  case "resistor":
                    SymbolView = ResistorSymbol;
                    break;
                  case "capacitor":
                    SymbolView = CapacitorSymbol;
                    break;
                  case "capacitor_elec":
                    SymbolView = CapacitorElectrolyticSymbol;
                    break;
                  case "inductor":
                    SymbolView = InductorSymbol;
                    break;
                  case "diode":
                    SymbolView = DiodeSymbol;
                    break;
                  case "transistor":
                    SymbolView = TransistorSymbol;
                    break;
                  case "transistor_pnp":
                    SymbolView = TransistorPNPSymbol;
                    break;
                  case "mosfet":
                    SymbolView = MosfetSymbol;
                    break;
                  case "mosfet_p":
                    SymbolView = MosfetPSymbol;
                    break;
                  case "timer555":
                    SymbolView = Timer555Symbol;
                    break;
                  case "opamp":
                    SymbolView = OpampSymbol;
                    break;
                  case "logic_gate":
                    SymbolView = LogicGateSymbol;
                    break;
                  case "logic_and":
                    SymbolView = LogicAndSymbol;
                    break;
                  case "logic_or":
                    SymbolView = LogicOrSymbol;
                    break;
                  case "logic_nand":
                    SymbolView = LogicNandSymbol;
                    break;
                  case "logic_nor":
                    SymbolView = LogicNorSymbol;
                    break;
                  case "logic_xor":
                    SymbolView = LogicXorSymbol;
                    break;
                  case "ac_source":
                    SymbolView = ACSourceSymbol;
                    break;
                  case "voltmeter":
                    SymbolView = VoltmeterSymbol;
                    break;
                  case "ammeter":
                    SymbolView = AmmeterSymbol;
                    break;
                  case "oscilloscope":
                    SymbolView = OscilloscopeSymbol;
                    break;
                  case "seven_segment":
                    SymbolView = SevenSegmentSymbol;
                    break;
                  case "led":
                    SymbolView = LEDSymbol;
                    break;
                  case "powersupply":
                    SymbolView = PowerSupplySymbol;
                    break;
                  case "battery":
                    SymbolView = BatterySymbol;
                    break;
                  case "lamp":
                    SymbolView = LampSymbol;
                    break;
                  case "switch":
                    SymbolView = SwitchSymbol;
                    break;
                  case "ic":
                    SymbolView = ICSymbol;
                    break;
                  case "ground":
                    SymbolView = GroundSymbol;
                    break;
                  case "arduino_uno":
                    SymbolView = ArduinoUnoSymbol;
                    break;
                  case "esp32":
                    SymbolView = ESP32Symbol;
                    break;
                  case "esp32_cam":
                    SymbolView = ESP32CamSymbol;
                    break;
                  case "raspberry_pi":
                    SymbolView = RaspberryPiSymbol;
                    break;
                  case "buzzer":
                    SymbolView = BuzzerSymbol;
                    break;
                  case "relay":
                    SymbolView = RelaySymbol;
                    break;
                  case "potentiometer":
                    SymbolView = PotentiometerSymbol;
                    break;
                  case "oled":
                    SymbolView = OLEDSymbol;
                    break;
                  case "motor":
                    SymbolView = MotorSymbol;
                    break;
                  case "protoboard":
                    SymbolView = ProtoboardSymbol;
                    break;
                  case "usb_c":
                    SymbolView = USBCSymbol;
                    break;
                  case "micro_usb":
                    SymbolView = MicroUSBSymbol;
                    break;
                  default:
                    SymbolView = GroundSymbol;
                }

                return (
                  <Group
                    key={el.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation}
                    draggable={tool === "select"}
                    onDragEnd={(e) => {
                      let newX = snapToGrid(e.target.x());
                      let newY = snapToGrid(e.target.y());
                      e.target.position({ x: newX, y: newY });
                      
                      const dx = newX - comp.x;
                      const dy = newY - comp.y;
                      
                      const updates = [{ id: comp.id, updates: { x: newX, y: newY } }];
                      if (comp.componentType === 'protoboard') {
                        elements.forEach(el => {
                          if (el.type === 'component' && el.id !== comp.id) {
                            if (el.x >= comp.x - 315 && el.x <= comp.x + 315 && el.y >= comp.y - 110 && el.y <= comp.y + 110) {
                              const elNewX = snapToGrid(el.x + dx);
                              const elNewY = snapToGrid(el.y + dy);
                              updates.push({
                                id: el.id,
                                updates: { x: elNewX, y: elNewY }
                              });
                            }
                          }
                        });
                      }

                      updateElements(updates);

                      // Run auto-route professionally on component move
                      setTimeout(() => {
                        const currentElements = elements.map((el) => {
                          const matchingUpdate = updates.find(u => u.id === el.id);
                          return matchingUpdate ? { ...el, ...matchingUpdate.updates } as any : el;
                        });
                        doAutoRoute(
                          currentElements,
                          pcbElements,
                          setPcbElements,
                          pinMap,
                          astarRoute,
                          uuidv4,
                        );
                      }, 50);
                    }}
                    onClick={(e) => {
                      if (tool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(comp.id);
                      } else if (tool === "select") {
                        e.cancelBubble = true;
                        if (isSimulating && comp.componentType === "switch") {
                          updateElement(comp.id, {
                            customProps: {
                              ...(comp as any).customProps,
                              closed: !(comp as any).customProps?.closed,
                            },
                          });
                        } else {
                          setSelectedIds([comp.id]);
                        }
                      }
                    }}
                    onTap={(e) => {
                      if (tool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(comp.id);
                      } else if (tool === "select") {
                        e.cancelBubble = true;
                        if (isSimulating && comp.componentType === "switch") {
                          updateElement(comp.id, {
                            customProps: {
                              ...(comp as any).customProps,
                              closed: !(comp as any).customProps?.closed,
                            },
                          });
                        } else {
                          setSelectedIds([comp.id]);
                        }
                      }
                    }}
                  >
                    <SymbolView
                      x={0}
                      y={0}
                      rotation={0}
                      selected={isSelected}
                      isOn={
                        isSimulating &&
                        [
                          "led",
                          "motor",
                          "buzzer",
                          "voltmeter",
                          "ammeter",
                          "oscilloscope",
                          "lamp",
                        ].includes(comp.componentType)
                          ? circuitState.active.has(comp.id)
                          : comp.componentType === "switch"
                            ? comp.customProps?.closed
                            : undefined
                      }
                      voltages={
                        isSimulating &&
                        ["seven_segment", "oled"].includes(comp.componentType)
                          ? (() => {
                              const rad = (comp.rotation * Math.PI) / 180;
                              return (pinMap[comp.componentType] || []).map(
                                (p) => {
                                  const px =
                                    Math.round(
                                      (comp.x +
                                        p.x * Math.cos(rad) -
                                        p.y * Math.sin(rad)) /
                                        5,
                                    ) * 5;
                                  const py =
                                    Math.round(
                                      (comp.y +
                                        p.x * Math.sin(rad) +
                                        p.y * Math.cos(rad)) /
                                        5,
                                    ) * 5;
                                  return (
                                    (circuitState as any).pointVoltages?.[
                                      `${px},${py}`
                                    ] || 0
                                  );
                                },
                              );
                            })()
                          : undefined
                      }
                      reading={
                        isSimulating && circuitState.active.has(comp.id)
                          ? circuitState.readings[comp.id]
                          : undefined
                      }
                      hasAC={
                        isSimulating &&
                        elements.some(
                          (e) =>
                            e.type === "component" &&
                            (e as ComponentEntity).componentType ===
                              "ac_source",
                        )
                      }
                      value={comp.value}
                      broken={
                        isSimulating &&
                        circuitState.readings[comp.id] === "BROKEN!"
                      }
                      customProps={comp.customProps}
                    />

                    <Group x={0} y={-30} rotation={-comp.rotation}>
                      <Text
                        text={comp.name || ""}
                        fill="#9ca3af"
                        fontSize={12}
                        fontFamily="monospace"
                      />
                      {!!comp.value && (
                        <Text
                          text={comp.value}
                          y={14}
                          fill="#4ade80"
                          fontSize={12}
                          fontFamily="monospace"
                        />
                      )}
                    </Group>
                  </Group>
                );
              }

              if (el.type === "pcb_component") {
                const comp = el as PcbComponentEntity;

                let SymbolView;
                switch (comp.componentType) {
                  case "dip8":
                    SymbolView = PCBDIP8Symbol;
                    break;
                  case "smd":
                    SymbolView = PCBSMDSymbol;
                    break;
                  case "pad":
                    SymbolView = PCBPadSymbol;
                    break;
                  case "via":
                    SymbolView = PCBViaSymbol;
                    break;
                  case "sot23":
                    SymbolView = PCBSot23Symbol;
                    break;
                  case "to220":
                    SymbolView = PCBTo220Symbol;
                    break;
                  case "sop":
                    SymbolView = PCBSopSymbol;
                    break;
                  case "qfp":
                    SymbolView = PCBQfpSymbol;
                    break;
                  case "bga":
                    SymbolView = PCBBGASymbol;
                    break;
                  case "pinheader":
                    SymbolView = PCBPinHeaderSymbol;
                    break;
                  case "usb_c":
                    SymbolView = PCBUSBCSymbol;
                    break;
                  case "micro_usb":
                    SymbolView = PCBMicroUSBSymbol;
                    break;
                  case "cr2032":
                    SymbolView = PCBCR2032Symbol;
                    break;
                  case "ldr_smd":
                    SymbolView = PCBLDRSMDSymbol;
                    break;
                  case "ntc_smd":
                    SymbolView = PCBNTCSMDSymbol;
                    break;
                  case "crystal":
                    SymbolView = PCBCrystalSymbol;
                    break;
                  case "copper_pour":
                    SymbolView = PCBCopperPourSymbol;
                    break;
                  case "fiducial":
                    SymbolView = PCBFiducialSymbol;
                    break;
                  case "mounting_hole":
                    SymbolView = PCBMountingHoleSymbol;
                    break;
                  case "test_point":
                    SymbolView = PCBTestPointSymbol;
                    break;
                  default:
                    SymbolView = PCBPadSymbol;
                }

                return (
                  <Group
                    key={el.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation}
                    draggable={pcbTool === "select"}
                    onDragEnd={(e) => {
                      let newX = snapToGrid(e.target.x());
                      let newY = snapToGrid(e.target.y());
                      e.target.position({ x: newX, y: newY });
                      updateElement(comp.id, { x: newX, y: newY });

                      // Run auto-route professionally on component move
                      setTimeout(() => {
                        const currentPcbElements = pcbElements.map((el) =>
                          el.id === comp.id ? { ...el, x: newX, y: newY } : el,
                        );
                        doAutoRoute(
                          elements,
                          currentPcbElements,
                          setPcbElements,
                          pinMap,
                          astarRoute,
                          uuidv4,
                        );
                      }, 50);
                    }}
                    onClick={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(comp.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([comp.id]);
                      }
                    }}
                    onTap={(e) => {
                      if (pcbTool === "eraser") {
                        e.cancelBubble = true;
                        removeElement(comp.id);
                      } else if (pcbTool === "select") {
                        e.cancelBubble = true;
                        setSelectedIds([comp.id]);
                      }
                    }}
                  >
                    <SymbolView
                      x={0}
                      y={0}
                      rotation={0}
                      selected={isSelected}
                      layer={comp.layer}
                      customProps={comp.customProps}
                    />

                    <Group x={0} y={-30} rotation={-comp.rotation}>
                      <Text
                        text={comp.name || ""}
                        fill="#9ca3af"
                        fontSize={12}
                        fontFamily="monospace"
                      />
                    </Group>
                  </Group>
                );
              }

              return null;
            })}

            {wiring.active &&
              wiring.start &&
              wiring.current &&
              (() => {
                const pts = getOrthogonalPoints(wiring.start!, wiring.current!);
                return (
                  <Line
                    points={pts.flatMap((p) => [p.x, p.y])}
                    stroke={
                      mode === "pcb"
                        ? activePcbLayer === "top"
                          ? "#ef4444"
                          : "#3b82f6"
                        : activeWireColor
                    }
                    strokeWidth={mode === "pcb" ? 4 : 2}
                    dash={mode === "pcb" ? [] : [4, 4]}
                    opacity={mode === "pcb" ? 0.8 : 1}
                  />
                );
              })()}

            {activeTool === "probe" &&
              probePos &&
              isSimulating &&
              (() => {
                const ptId =
                  Math.round(probePos.x / 5) * 5 +
                  "," +
                  Math.round(probePos.y / 5) * 5;
                const volt = (circuitState as any).pointVoltages?.[ptId];

                return (
                  <Group x={probePos.x} y={probePos.y}>
                    <Line
                      points={[0, 0, 10, -10, 10, -30]}
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Circle x={0} y={0} radius={4} fill="#f59e0b" />
                    <Rect
                      x={8}
                      y={-45}
                      width={40}
                      height={15}
                      fill="#111827"
                      cornerRadius={2}
                      stroke="#f59e0b"
                      strokeWidth={1}
                    />
                    <Text
                      x={10}
                      y={-41}
                      text={
                        volt !== undefined && !isNaN(volt) && isFinite(volt)
                          ? `${volt >= 1e-3 || volt === 0 ? volt.toFixed(2) : (volt * 1000).toFixed(2)} ${Math.abs(volt) < 1e-3 && volt !== 0 ? "mV" : "V"}`
                          : "N/C"
                      }
                      fill="#10b981"
                      fontSize={8}
                      fontFamily="monospace"
                      fontStyle="bold"
                    />
                  </Group>
                );
              })()}
          </Layer>
        </Stage>
      )}

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center bg-[#1a1a1f] border border-[#2d2d33] rounded-md shadow-lg overflow-hidden pointer-events-auto">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#2d2d33] transition"
          title="Reduzir (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="px-2 w-14 text-center text-xs font-mono text-gray-300">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.min(10, zoom + 0.1))}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#2d2d33] transition"
          title="Ampliar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
