import { Group, Rect, Circle, Line, Text, Path, Ellipse } from "react-konva";
import Konva from "konva";
import React from "react";

export interface SymbolProps {
  x: number;
  y: number;
  rotation: number;
  selected?: boolean;
  value?: string;
  isOn?: boolean;
  reading?: string;
  broken?: boolean;
  hasAC?: boolean;
  voltages?: Record<string, number> | number[];
  customProps?: any;
}

const color = "#840000";
const pinColor = "#008484";
const textColor = "#000084";
const selectedColor = "#008400";

export function getCapacitorCode(value: string | undefined): string {
  if (!value) return "104";
  const match = value.match(/^([\d.]+)\s*(p|n|u|m)?(?:[fF])?$/);
  if (!match) return value;
  let val = parseFloat(match[1]);
  const multStr = match[2];
  let multiplier = 1; // pf
  if (multStr === "n") multiplier = 1000;
  if (multStr === "u") multiplier = 1000000;
  if (multStr === "m") multiplier = 1000000000;
  let pf = val * multiplier;
  if (pf < 10) return Math.floor(pf).toString();
  let exp = 0;
  while (pf >= 100 && exp < 9) { pf /= 10; exp++; }
  const digit12 = Math.floor(pf);
  return `${digit12}${exp}`;
}

export function getResistorColors(value: string | undefined): string[] {
  let v = value ? value.replace(/,/g, ".") : "150";
  let multiplierValue = 1;
  const numStr = v.replace(/[^0-9.]/g, "");
  if (v.toLowerCase().includes("k")) multiplierValue = 1000;
  if (v.toLowerCase().includes("m")) multiplierValue = 1000000;

  let ohms = parseFloat(numStr) * multiplierValue;
  if (isNaN(ohms)) ohms = 1500;

  const colors = [
    "#000000",
    "#8b4513",
    "#ff0000",
    "#ffa500",
    "#ffff00",
    "#008000",
    "#0000ff",
    "#ee82ee",
    "#808080",
    "#ffffff",
  ];
  if (ohms === 0) return [colors[0], colors[0], colors[0], "#d4af37"];

  let exponent = Math.floor(Math.log10(ohms));
  let digits = Math.round(ohms / Math.pow(10, exponent - 1));
  if (digits < 10) {
    digits *= 10;
    exponent -= 1;
  }

  let first = Math.floor(digits / 10) % 10;
  let second = Object.is(digits % 10, -0) ? 0 : digits % 10;
  let multiplier = exponent - 1;

  if (multiplier < 0) multiplier = 0;
  if (multiplier > 9) multiplier = 9;

  return [
    colors[first] || "#000",
    colors[second] || "#000",
    colors[multiplier] || "#000",
    "#d4af37",
  ];
}

const FallbackSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
  label,
}: SymbolProps & { label: string }) => {
  const isPcb = label.startsWith("PCB");
  const fallbackStroke = isPcb ? "#0ea5e9" : color;
  const fallbackText = isPcb ? "#0ea5e9" : textColor;

  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-15}
        y={-15}
        width={30}
        height={30}
        fill="transparent"
        stroke={selected ? selectedColor : fallbackStroke}
        strokeWidth={isPcb ? 1 : 2}
        cornerRadius={4}
      />
      <Text
        text={label.replace("PCB", "")}
        fontSize={isPcb ? 6 : 4}
        x={-12}
        y={-5}
        fill={selected ? selectedColor : fallbackText}
      />
    </Group>
  );
};

export function ResistorSymbol({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "#e2c290";
  const bands = getResistorColors(value?.toString());
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-30, 0, -12, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[12, 0, 30, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Rect
        x={-12}
        y={-4}
        width={24}
        height={8}
        fill="#e4c596"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.3}
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={2}
      />
      <Rect x={-8} y={-4} width={2} height={8} fill={bands[0]} />
      <Rect x={-4} y={-4} width={2} height={8} fill={bands[1]} />
      <Rect x={0} y={-4} width={2} height={8} fill={bands[2]} />
      <Rect x={6} y={-4} width={2} height={8} fill={bands[3]} />

      {/* 3D highlights */}
      <Rect
        x={-12}
        y={-3}
        width={24}
        height={2}
        fill="#ffffff"
        opacity={0.3}
        cornerRadius={1}
      />

      <Circle
        x={-30}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={25}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      {value ? (
        <Text
          text={value + "Ω"}
          x={-10}
          y={-18}
          fontSize={10}
          fill={textColor}
        />
      ) : null}
    </Group>
  );
}

export function CapacitorSymbol({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Ceramic disc capacitor: a nice orange/brown circle slightly squashed */}
      <Ellipse
        x={0}
        y={0}
        radiusX={9}
        radiusY={6}
        fill="#e67e22"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
      />
      <Path
        data="M -4 -3 Q 0 -5 4 -3"
        stroke="#f39c12"
        strokeWidth={1}
        fill="transparent"
      />
      <Text
        text={getCapacitorCode(value)}
        x={-6}
        y={-2}
        fontSize={4}
        fill="#333"
        fontStyle="bold"
      />
      <Line points={[-20, 0, -5, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[5, 0, 20, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Circle
        x={-20}
        y={0}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={20}
        y={0}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}
export function InductorSymbol({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#aaa" strokeWidth={2} />
      <Rect
        x={-10}
        y={-4}
        width={20}
        height={8}
        fill="#111"
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={2}
      />
      <Line points={[-8, -4, -6, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[-4, -4, -2, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[0, -4, 2, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[4, -4, 6, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Line points={[8, -4, 10, 4]} stroke="#b87333" strokeWidth={1.5} />
      <Circle
        x={-15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}

export function SwitchSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#1a1a1a";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Base Tactile switch */}
      <Rect
        x={-8}
        y={-8}
        width={16}
        height={16}
        fill="#303030"
        shadowColor="#000"
        shadowBlur={3}
        shadowOffsetX={1}
        shadowOffsetY={1}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={2}
      />
      <Line points={[-15, 0, -8, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[15, 0, 8, 0]} stroke="#bcc2c2" strokeWidth={2} />

      {/* Button center */}
      <Circle x={0} y={0} radius={4.5} fill="#111" />
      <Circle x={0} y={0} radius={3.5} fill="#e11d48" />
      <Circle x={0} y={-1} radius={3.5} fill="#ff4d79" opacity={0.6} />

      <Circle
        x={-15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}
export function DiodeSymbol({ x, y, rotation, selected, value }: SymbolProps) {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[-15, 0, 15, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Rect
        x={-8}
        y={-4}
        width={16}
        height={8}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={2}
      />
      <Rect x={4} y={-4} width={2} height={8} fill="#bdc3c7" />
      <Rect
        x={-8}
        y={-3}
        width={16}
        height={2}
        fill="#ffffff"
        opacity={0.2}
        cornerRadius={1}
      />
      <Circle
        x={-15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}
export function BatterySymbol({
  x,
  y,
  rotation,
  selected,
  voltages,
  value,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "#1e1e1e";
  // 9V Battery Realistic Look
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-15}
        y={-25}
        width={30}
        height={50}
        fill="#222"
        shadowColor="#000"
        shadowBlur={5}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.5}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={3}
      />
      {/* Label wrap */}
      <Rect x={-15} y={-15} width={30} height={35} fill="#d97706" />
      <Rect x={-15} y={0} width={30} height={20} fill="#111" />
      <Text
        text="9V"
        x={-8}
        y={-10}
        fontSize={12}
        fill="#fff"
        fontStyle="bold"
      />
      <Text text="POWER" x={-10} y={5} fontSize={5} fill="#d97706" />
      <Text
        text="+"
        x={-10}
        y={-23}
        fontSize={8}
        fill="#fff"
        fontStyle="bold"
      />
      <Text text="-" x={4} y={-23} fontSize={8} fill="#fff" fontStyle="bold" />

      {/* Terminals */}
      {/* Left terminal: Positive (smaller) */}
      <Rect
        x={-7}
        y={-29}
        width={5}
        height={4}
        fill="#bcc2c2"
        cornerRadius={0.5}
      />
      {/* Right terminal: Negative (larger) */}
      <Rect
        x={1}
        y={-30}
        width={7}
        height={5}
        fill="#bcc2c2"
        cornerRadius={1}
      />

      <Circle x={-4.5} y={-29} radius={1} fill="#777" />
      <Circle x={4.5} y={-30} radius={3.5} fill="#777" />

      {/* Wire from positive (left) */}
      <Line
        points={[-7, -29, -10, -32, -10, -40]}
        stroke="#ef4444"
        strokeWidth={2.5}
      />
      {/* Wire from negative (right) */}
      <Line
        points={[4.5, -30, 10, -32, 10, -40]}
        stroke="#3b82f6"
        strokeWidth={2.5}
      />

      <Circle
        x={-10}
        y={-40}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={-40}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}
export const TransistorPNPSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Path
        data="M -16 -10 L 16 -10 A 15 15 0 0 1 16 8 L -16 8 Z"
        fill="#222"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
      />
      <Rect x={-8} y={-8} width={4} height={16} fill="#111" />
      <Text
        text={value || "2N3906"}
        x={-2}
        y={-7}
        fontSize={5}
        fill="#aaa"
        rotation={90}
      />
      <Text text="PNP" x={2} y={-4} fontSize={3} fill="#777" rotation={90} />
      <Line points={[-15, 8, -15, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[0, 8, 0, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[15, 8, 15, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Text text="E" x={-16} y={16} fontSize={3} fill="#777" />
      <Text text="B" x={-1} y={16} fontSize={3} fill="#777" />
      <Text text="C" x={14} y={16} fontSize={3} fill="#777" />
      <Circle
        x={-15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};
export const PCBBGASymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-15} width={30} height={30} fill="#111827" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Circle x={-10} y={-10} radius={1} fill="#4b5563" />
      {/* 5x5 Grid */}
      {[...Array(5)].map((_, r) => 
        [...Array(5)].map((_, c) => 
          <Circle key={`bga_${r}_${c}`} x={-10 + c * 5} y={-10 + r * 5} radius={1.2} fill="#9ca3af" />
        )
      )}
    </Group>
  );
};

export const PCBPinHeaderSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-20} y={-5} width={40} height={10} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      {[...Array(4)].map((_, i) => (
        <Group key={i} x={-15 + i * 10} y={0}>
          <Rect x={-3} y={-3} width={6} height={6} fill="#fbbf24" cornerRadius={1} />
          <Circle x={0} y={0} radius={1.5} fill="#374151" />
        </Group>
      ))}
    </Group>
  );
};

export const PCBUSBCSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-10} width={30} height={20} fill="#e5e7eb" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Rect x={-13} y={-10} width={26} height={10} fill="#9ca3af" cornerRadius={1} />
      {/* SMT Pads */}
      {[...Array(12)].map((_, i) => <Rect key={`pad_${i}`} x={-11 + i * 2} y={10} width={1} height={4} fill="#9ca3af" />)}
      {/* Mounting holes */}
      <Circle x={-12} y={2} radius={2} fill="#d1d5db" />
      <Circle x={12} y={2} radius={2} fill="#d1d5db" />
    </Group>
  );
};

export const PCBMicroUSBSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-10} y={-8} width={20} height={16} fill="#e5e7eb" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Path data="M -8 -8 L -6 -6 L 6 -6 L 8 -8" fill="#9ca3af" />
      {/* 5 SMT Pads */}
      {[...Array(5)].map((_, i) => <Rect key={`pad_${i}`} x={-4 + i * 2} y={8} width={1.2} height={4} fill="#9ca3af" />)}
      {/* Mounting holes */}
      <Rect x={-11} y={0} width={3} height={3} fill="#d1d5db" />
      <Rect x={8} y={0} width={3} height={3} fill="#d1d5db" />
    </Group>
  );
};

export const MosfetSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* TO-220 Package */}
      <Rect
        x={-10}
        y={-16}
        width={20}
        height={12}
        fill="#d1d5db"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.3}
      />
      <Circle x={0} y={-10} radius={3} fill="#374151" />
      <Rect
        x={-10}
        y={-4}
        width={20}
        height={15}
        fill="#1f2937"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={1}
        shadowOpacity={0.3}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={1}
      />
      <Text text={value || "IRFZ44N"} x={-8} y={2} fontSize={4} fill="#ccc" />
      <Text text="N-CH" x={-4} y={8} fontSize={3} fill="#777" />

      {/* Pins */}
      <Line points={[-15, 11, -15, 15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[0, 11, 0, 15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[15, 11, 15, 15]} stroke="#bcc2c2" strokeWidth={2.5} />

      <Text text="G" x={-16} y={17} fontSize={3} fill="#777" />
      <Text text="D" x={-1} y={17} fontSize={3} fill="#777" />
      <Text text="S" x={14} y={17} fontSize={3} fill="#777" />

      <Circle
        x={-15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const MosfetPSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* TO-220 Package */}
      <Rect
        x={-10}
        y={-16}
        width={20}
        height={12}
        fill="#d1d5db"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.3}
      />
      <Circle x={0} y={-10} radius={3} fill="#374151" />
      <Rect
        x={-10}
        y={-4}
        width={20}
        height={15}
        fill="#1f2937"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={1}
        shadowOpacity={0.3}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={1}
      />
      <Text text={value || "IRF9Z34N"} x={-8} y={2} fontSize={4} fill="#ccc" />
      <Text text="P-CH" x={-4} y={8} fontSize={3} fill="#777" />

      {/* Pins */}
      <Line points={[-15, 11, -15, 15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[0, 11, 0, 15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[15, 11, 15, 15]} stroke="#bcc2c2" strokeWidth={2.5} />

      <Text text="G" x={-16} y={17} fontSize={3} fill="#777" />
      <Text text="D" x={-1} y={17} fontSize={3} fill="#777" />
      <Text text="S" x={14} y={17} fontSize={3} fill="#777" />

      <Circle
        x={-15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const Timer555Symbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-8 IC Body (Horizontal) */}
      <Rect
        x={-20}
        y={-16}
        width={40}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-12} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -20 -4 A 4 4 0 0 0 -20 4" fill="#111" />
      <Text text={value || "NE555"} x={-14} y={-2} fontSize={7} fill="#ccc" />

      {/* 4 bottom pins (-15, -5, 5, 15 y=20) */}
      {[...Array(4)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-17 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-15 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-16 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 4 top pins (-15, -5, 5, 15 y=-20) - numbering goes from right to left (8 to 5) */}
      {[...Array(4)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={13 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={15 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(8 - i)}
            x={14 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const OpampSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-8 IC Body (Horizontal) */}
      <Rect
        x={-20}
        y={-16}
        width={40}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-12} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -20 -4 A 4 4 0 0 0 -20 4" fill="#111" />
      <Text text={value || "LM741"} x={-14} y={-2} fontSize={7} fill="#ccc" />

      {/* 4 bottom pins (-15, -5, 5, 15 y=20) */}
      {[...Array(4)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-17 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-15 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-16 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 4 top pins (-15, -5, 5, 15 y=-20) - numbering goes from right to left (8 to 5) */}
      {[...Array(4)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={13 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={15 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(8 - i)}
            x={14 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicGateSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text text={value || "Gate"} x={-20} y={-2} fontSize={7} fill="#ccc" />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicAndSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text
        text={value || "74HC08 AND"}
        x={-20}
        y={-2}
        fontSize={7}
        fill="#ccc"
      />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicOrSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text
        text={value || "74HC32 OR"}
        x={-20}
        y={-2}
        fontSize={7}
        fill="#ccc"
      />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicNandSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text
        text={value || "74HC00 NAND"}
        x={-20}
        y={-2}
        fontSize={7}
        fill="#ccc"
      />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicNorSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text
        text={value || "74HC02 NOR"}
        x={-20}
        y={-2}
        fontSize={7}
        fill="#ccc"
      />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export const LogicXorSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text
        text={value || "74HC86 XOR"}
        x={-20}
        y={-2}
        fontSize={7}
        fill="#ccc"
      />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};
export const ACSourceSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#ccc";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Wall Socket / AC Generator look */}
      <Circle
        x={0}
        y={0}
        radius={22}
        fill="#2a2a2a"
        shadowColor="#000"
        shadowBlur={6}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.5}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1}
      />
      <Circle x={0} y={0} radius={20} fill="#333" />
      <Path
        data="M -8 0 Q -4 -8 0 0 T 8 0"
        stroke="#3b82f6"
        strokeWidth={2}
        fill="transparent"
      />
      <Text text={(value || "220V").replace("V", "") + "V AC"} x={-14} y={10} fontSize={6} fill="#aaa" />
      <Line points={[0, -22, 0, -35]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[0, 22, 0, 35]} stroke="#bcc2c2" strokeWidth={2} />
      <Circle
        x={0}
        y={-35}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={35}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Text text="L" x={4} y={-32} fontSize={6} fill="#ef4444" />
      <Text text="N" x={4} y={28} fontSize={6} fill="#3b82f6" />
    </Group>
  );
};
export const VoltmeterSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-20}
        y={-15}
        width={40}
        height={30}
        fill="#e11d48"
        stroke={stroke}
        strokeWidth={2}
        cornerRadius={4}
      />
      <Rect x={-16} y={-10} width={32} height={12} fill="#111" />
      <Text text="0.00" x={-10} y={-8} fontSize={8} fill="#0f0" />

      <Line points={[-10, 15, -10, 20]} stroke="#aaa" strokeWidth={2} />
      <Line points={[10, 15, 10, 20]} stroke="#aaa" strokeWidth={2} />

      <Text text="+" x={-13} y={11} fontSize={6} fill="#fff" />
      <Text text="-" x={7} y={11} fontSize={6} fill="#fff" />

      <Circle
        x={-10}
        y={20}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={20}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const AmmeterSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#333";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-20}
        y={-15}
        width={40}
        height={30}
        fill="#0284c7"
        stroke={stroke}
        strokeWidth={2}
        cornerRadius={4}
      />
      <Rect x={-16} y={-10} width={32} height={12} fill="#111" />
      <Text text="0.00" x={-10} y={-8} fontSize={8} fill="#0f0" />

      <Line points={[-10, 15, -10, 20]} stroke="#aaa" strokeWidth={2} />
      <Line points={[10, 15, 10, 20]} stroke="#aaa" strokeWidth={2} />

      <Text text="+" x={-13} y={11} fontSize={6} fill="#fff" />
      <Text text="-" x={7} y={11} fontSize={6} fill="#fff" />

      <Circle
        x={-10}
        y={20}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={20}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const OscilloscopeSymbol = ({
  x,
  y,
  rotation,
  selected,
  isOn,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  const pathRef = React.useRef<Konva.Path>(null);
  const textRef = React.useRef<Konva.Text>(null);

  const latestValue = React.useRef(0);
  React.useEffect(() => {
    if (value) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        latestValue.current = parsed;
      }
    } else {
      latestValue.current = 0;
    }
  }, [value]);

  React.useEffect(() => {
    if (!pathRef.current) return;
    if (!isOn) {
      pathRef.current.data("M -32 -7 L 18 -7");
      pathRef.current.getLayer()?.batchDraw();
      if (textRef.current) textRef.current.text("");
      return;
    }
    let animId: number;
    let history: number[] = Array(50).fill(0);
    const updateOscilloscope = () => {
      history.push(latestValue.current);
      if (history.length > 50) history.shift();

      let d = "";
      const maxAbs = Math.max(...history.map(Math.abs));
      const scale = Math.max(15, maxAbs * 1.2); 

      for (let i = 0; i < history.length; i++) {
        const px = -32 + (i / 49) * 50; 
        const py = -7 - (history[i] / scale) * 12; 
        d += `${i === 0 ? "M " : "L "}${px} ${py} `;
      }
      if (pathRef.current) {
        pathRef.current.data(d);
      }

      const minVal = Math.min(...history);
      const isAC = (maxAbs - minVal) > 2; // if variation > 2V, it's AC

      if (textRef.current) {
        textRef.current.text(isAC ? "AC" : "DC");
      }

      pathRef.current?.getLayer()?.batchDraw();
      animId = requestAnimationFrame(updateOscilloscope);
    };
    updateOscilloscope();
    return () => cancelAnimationFrame(animId);
  }, [isOn]);

  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-40}
        y={-30}
        width={80}
        height={60}
        fill="#333"
        stroke={stroke}
        strokeWidth={2}
        cornerRadius={4}
      />
      <Rect
        x={-32}
        y={-22}
        width={50}
        height={30}
        fill="#0ea5e9"
        opacity={0.3}
      />
      <Path
        ref={pathRef}
        data="M -32 -7 L 18 -7"
        stroke="#38bdf8"
        strokeWidth={1}
      />
      <Text
        ref={textRef}
        text=""
        x={-30}
        y={-20}
        fontSize={6}
        fill="#38bdf8"
        fontFamily="monospace"
      />
      <Circle x={26} y={-10} radius={4} fill="#666" />
      <Circle x={26} y={5} radius={4} fill="#666" />

      <Line points={[-20, 30, -20, 40]} stroke="#aaa" strokeWidth={2} />
      <Line points={[20, 30, 20, 40]} stroke="#aaa" strokeWidth={2} />

      <Text text="CH1" x={-26} y={23} fontSize={5} fill="#fff" />
      <Text text="CH2" x={14} y={23} fontSize={5} fill="#fff" />

      <Circle
        x={-20}
        y={40}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={20}
        y={40}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const SevenSegmentSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
  voltages,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  // Pin mapping: Top: [G, F, COM, A, B], Bot: [E, D, COM, C, DP]
  // Indices: 0:G, 1:F, 2:COM, 3:A, 4:B  |  5:E, 6:D, 7:COM, 8:C, 9:DP
  // Segment to voltage index map:
  const segIdx: Record<string, number> = {
    A: 3,
    B: 4,
    C: 8,
    D: 6,
    E: 5,
    F: 1,
    G: 0,
    DP: 9,
  };

  const isSegmentLit = (segName: string) => {
    if (voltages && voltages.length > 0) {
      // Basic common-cathode logic: if voltage at segment pin is high (>1.5V)
      return (voltages[segIdx[segName]] || 0) > 1.5;
    }
    // Fallback logic for basic generic numeric values
    if (!value) return false;
    const digitMap: Record<string, string[]> = {
      "0": ["A", "B", "C", "D", "E", "F"],
      "1": ["B", "C"],
      "2": ["A", "B", "D", "E", "G"],
      "3": ["A", "B", "C", "D", "G"],
      "4": ["B", "C", "F", "G"],
      "5": ["A", "C", "D", "F", "G"],
      "6": ["A", "C", "D", "E", "F", "G"],
      "7": ["A", "B", "C"],
      "8": ["A", "B", "C", "D", "E", "F", "G"],
      "9": ["A", "B", "C", "D", "F", "G"],
    };
    return (digitMap[String(value).trim()] || []).includes(segName);
  };
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-25}
        y={-35}
        width={50}
        height={70}
        fill="#111111"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.5}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={3}
      />
      {[
        { n: "A", c: [-10, -26, 20, 6] },
        { n: "G", c: [-10, -3, 20, 6] },
        { n: "D", c: [-10, 20, 20, 6] },
        { n: "F", c: [-16, -22, 6, 17] },
        { n: "B", c: [10, -22, 6, 17] },
        { n: "E", c: [-16, 1, 6, 17] },
        { n: "C", c: [10, 1, 6, 17] },
      ].map((seg, i) => {
        const lit = isSegmentLit(seg.n);
        return (
          <Rect
            key={"sgbg" + i}
            x={seg.c[0]}
            y={seg.c[1]}
            width={seg.c[2]}
            height={seg.c[3]}
            fill={lit ? "#ff0000" : "#222"}
            shadowColor="#ff0000"
            shadowBlur={15}
            shadowEnabled={lit}
            cornerRadius={2}
            opacity={lit ? 1 : 0.8}
          />
        );
      })}

      <Circle
        x={20}
        y={23}
        radius={3}
        fill={isSegmentLit("DP") ? "#ff0000" : "#222"}
        shadowColor="#ff0000"
        shadowBlur={15}
        shadowEnabled={isSegmentLit("DP")}
      />

      {[...Array(5)].map((_, i) => (
        <Group key={"tpin" + i}>
          <Line
            points={[-20 + i * 10, -45, -20 + i * 10, -35]}
            stroke="#bcc2c2"
            strokeWidth={2}
          />
          <Circle
            x={-20 + i * 10}
            y={-45}
            radius={4.5}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={["G", "F", "COM", "A", "B"][i]}
            x={-22 + i * 10}
            y={-32}
            fontSize={4}
            fill="#777"
          />
        </Group>
      ))}
      {[...Array(5)].map((_, i) => (
        <Group key={"bpin" + i}>
          <Line
            points={[-20 + i * 10, 35, -20 + i * 10, 45]}
            stroke="#bcc2c2"
            strokeWidth={2}
          />
          <Circle
            x={-20 + i * 10}
            y={45}
            radius={4.5}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={["E", "D", "COM", "C", "DP"][i]}
            x={-22 + i * 10}
            y={28}
            fontSize={4}
            fill="#777"
          />
        </Group>
      ))}
    </Group>
  );
};

export const PCBCR2032Symbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "#4b5563";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Battery Holder circular plastic outline */}
      <Circle x={0} y={0} radius={22} fill="#111827" stroke={stroke} strokeWidth={selected ? 2 : 1} />
      {/* Internal coin cell metal representation */}
      <Circle x={0} y={0} radius={18} fill="#374151" stroke="#9ca3af" strokeWidth={1} />
      {/* Plus polarity sign engraved */}
      <Text text="+" x={10} y={-15} fontSize={14} fill="#fbbf24" fontStyle="bold" />
      <Text text="CR2032" x={-15} y={-4} fontSize={7} fill="#9ca3af" fontStyle="bold" />
      <Text text="3V LITHIUM" x={-18} y={4} fontSize={5} fill="#6b7280" />

      {/* Left solder tab centered exactly at x = -20 */}
      <Rect x={-24} y={-5} width={8} height={10} fill="#cbd5e1" cornerRadius={1} />
      {/* Metal connection track */}
      <Rect x={-16} y={-2} width={6} height={4} fill="#e2e8f0" />

      {/* Right solder tab centered exactly at x = 20 */}
      <Rect x={16} y={-5} width={8} height={10} fill="#cbd5e1" cornerRadius={1} />
      {/* Metal connection track */}
      <Rect x={10} y={-2} width={6} height={4} fill="#e2e8f0" />
    </Group>
  );
};

export const PCBLDRSMDSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Outer red/maroon body for CdS sensor */}
      <Rect x={-7} y={-5} width={14} height={10} fill="#7f1d1d" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={1} />
      
      {/* Left Solder pad centered at x = -10 */}
      <Rect x={-13} y={-5.5} width={6} height={11} fill="#cbd5e1" cornerRadius={1} />
      
      {/* Right Solder pad centered at x = 10 */}
      <Rect x={7} y={-5.5} width={6} height={11} fill="#cbd5e1" cornerRadius={1} />

      {/* Yellow CdS serpentine zig-zag photoresist track inside */}
      <Line
        points={[-5, -3, -5, 3, -1.5, 3, -1.5, -3, 1.5, -3, 1.5, 3, 5, 3, 5, -3]}
        stroke="#fbbf24"
        strokeWidth={1.2}
        tension={0.1}
      />
    </Group>
  );
};

export const PCBNTCSMDSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-8} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={4} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={-5} y={-4.5} width={10} height={9} fill="#4b5563" stroke={stroke} strokeWidth={selected ? 2 : 0} />
    </Group>
  );
};

export const PCBCrystalSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Ellipse x={0} y={0} radiusX={12} radiusY={6} fill="#d1d5db" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Rect x={-11} y={-3} width={4} height={6} fill="#9ca3af" />
      <Rect x={7} y={-3} width={4} height={6} fill="#9ca3af" />
      <Text text="Y" x={-4} y={-5} fontSize={10} fill="#4b5563" />
    </Group>
  );
};

export const PCBCopperPourSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "#b91c1c";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-30} y={-20} width={60} height={40} fill="rgba(185, 28, 28, 0.1)" stroke={stroke} strokeWidth={1} dash={[4, 4]} />
      <Text text="GND" x={-15} y={-6} fontSize={12} fill="#b91c1c" fontStyle="bold" opacity={0.5} />
    </Group>
  );
};

export const ProtoboardSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#94a3b8";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Plastic base */}
      <Rect
        x={-315}
        y={-110}
        width={630}
        height={220}
        fill="#f8fafc"
        stroke={stroke}
        strokeWidth={2}
        cornerRadius={4}
        shadowColor="#000"
        shadowBlur={10}
        shadowOffsetX={4}
        shadowOffsetY={6}
        shadowOpacity={0.25}
      />
      {/* Center divider channel */}
      <Rect
        x={-310}
        y={-10}
        width={620}
        height={20}
        fill="#e2e8f0"
        cornerRadius={2}
        shadowColor="#000"
        shadowBlur={2}
        shadowOpacity={0.3}
        shadowOffsetY={1}
      />

      {/* Power Rails Lines */}
      <Line
        points={[-305, -80, 305, -80]}
        stroke="#ef4444"
        strokeWidth={1.5}
        opacity={0.6}
      />
      <Line
        points={[-305, -100, 305, -100]}
        stroke="#3b82f6"
        strokeWidth={1.5}
        opacity={0.6}
      />

      <Line
        points={[-305, 90, 305, 90]}
        stroke="#3b82f6"
        strokeWidth={1.5}
        opacity={0.6}
      />
      <Line
        points={[-305, 70, 305, 70]}
        stroke="#ef4444"
        strokeWidth={1.5}
        opacity={0.6}
      />

      <Text text="+" x={-312} y={-83} fontSize={8} fill="#ef4444" />
      <Text text="-" x={-312} y={-103} fontSize={8} fill="#3b82f6" />
      <Text text="-" x={-312} y={87} fontSize={8} fill="#3b82f6" />
      <Text text="+" x={-312} y={67} fontSize={8} fill="#ef4444" />

      {/* Holes Grid top power */}
      {[...Array(60)].map((_, c) =>
        Math.floor(c / 5) % 2 === 0 ? (
          <Group key={"pt" + c}>
            <Rect
              x={-293 + c * 10}
              y={-93}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={-91}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
            <Rect
              x={-293 + c * 10}
              y={-83}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={-81}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
          </Group>
        ) : null,
      )}

      {/* Holes Grid bottom power */}
      {[...Array(60)].map((_, c) =>
        Math.floor(c / 5) % 2 === 0 ? (
          <Group key={"pb" + c}>
            <Rect
              x={-293 + c * 10}
              y={87}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={89}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
            <Rect
              x={-293 + c * 10}
              y={77}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={79}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
          </Group>
        ) : null,
      )}

      {/* Holes Grid middle top/bot */}
      {[...Array(60)].map((_, c) =>
        [...Array(5)].map((_, r) => (
          <Group key={"ct" + c + "_" + r}>
            <Rect
              x={-293 + c * 10}
              y={-63 + r * 10}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={-61 + r * 10}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
          </Group>
        )),
      )}
      {[...Array(60)].map((_, c) =>
        [...Array(5)].map((_, r) => (
          <Group key={"cb" + c + "_" + r}>
            <Rect
              x={-293 + c * 10}
              y={17 + r * 10}
              width={6}
              height={6}
              cornerRadius={0.5}
              fill="#e2e8f0"
            />
            <Rect
              x={-291 + c * 10}
              y={19 + r * 10}
              width={2}
              height={2}
              cornerRadius={0.5}
              fill="#1e293b"
            />
          </Group>
        )),
      )}

      {/* Indexing numbers and Letters */}
      {[...Array(12)].map((_, c) => (
        <Text
          key={"tnum" + c}
          text={String(1 + c * 5)}
          x={-293 + c * 50}
          y={-73}
          fontSize={6}
          fill="#64748b"
        />
      ))}
      {[...Array(12)].map((_, c) => (
        <Text
          key={"bnum" + c}
          text={String(1 + c * 5)}
          x={-293 + c * 50}
          y={9}
          fontSize={6}
          fill="#64748b"
        />
      ))}
      {["A", "B", "C", "D", "E"].map((letter, i) => (
        <Text
          key={letter}
          text={letter}
          x={-305}
          y={-62 + i * 10}
          fontSize={6}
          fill="#64748b"
        />
      ))}
      {["F", "G", "H", "I", "J"].map((letter, i) => (
        <Text
          key={letter}
          text={letter}
          x={-305}
          y={18 + i * 10}
          fontSize={6}
          fill="#64748b"
        />
      ))}
      {["A", "B", "C", "D", "E"].map((letter, i) => (
        <Text
          key={letter + "R"}
          text={letter}
          x={299}
          y={-62 + i * 10}
          fontSize={6}
          fill="#64748b"
        />
      ))}
      {["F", "G", "H", "I", "J"].map((letter, i) => (
        <Text
          key={letter + "R"}
          text={letter}
          x={299}
          y={18 + i * 10}
          fontSize={6}
          fill="#64748b"
        />
      ))}
    </Group>
  );
};
export const USBCSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-25}
        y={-25}
        width={50}
        height={40}
        fill="#ef4444"
        shadowColor="#000"
        shadowBlur={3}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.3}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={3}
      />
      <Text
        text="USB-C"
        x={-15}
        y={-5}
        fontSize={8}
        fill="#ffffff"
        fontStyle="bold"
      />
      <Rect
        x={-35}
        y={-15}
        width={10}
        height={30}
        fill="#cbd5e1"
        stroke="#94a3b8"
        strokeWidth={1}
        cornerRadius={[2, 0, 0, 2]}
      />
      <Rect
        x={-33}
        y={-10}
        width={6}
        height={20}
        fill="#0b0f19"
        cornerRadius={1}
      />
      <Line points={[25, -15, 35, -15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Line points={[25, 15, 35, 15]} stroke="#bcc2c2" strokeWidth={2.5} />
      <Circle
        x={20}
        y={-15}
        radius={3}
        fill="#e2e8f0"
        stroke="#d4af37"
        strokeWidth={1}
      />
      <Circle
        x={20}
        y={15}
        radius={3}
        fill="#e2e8f0"
        stroke="#d4af37"
        strokeWidth={1}
      />
      <Circle
        x={20}
        y={0}
        radius={3}
        fill="#e2e8f0"
        stroke="#d4af37"
        strokeWidth={1}
      />
      <Text text="V+" x={8} y={-17} fontSize={6} fill="#fff" />
      <Text text="G" x={10} y={13} fontSize={6} fill="#fff" />
      <Circle
        x={35}
        y={-15}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={35}
        y={15}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const MicroUSBSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-12}
        y={-10}
        width={24}
        height={20}
        fill="#e2ffeb"
        stroke={stroke}
        strokeWidth={2}
        cornerRadius={2}
      />
      <Rect
        x={-10}
        y={-16}
        width={20}
        height={6}
        fill="silver"
        stroke="#aaa"
        strokeWidth={1}
      />

      <Text
        text="+"
        x={-8}
        y={-6}
        fontSize={8}
        fill="#ef4444"
        fontStyle="bold"
      />
      <Text
        text="-"
        x={4}
        y={-6}
        fontSize={8}
        fill="#3b82f6"
        fontStyle="bold"
      />

      <Line points={[-10, 10, -10, 20]} stroke="#ef4444" strokeWidth={1.5} />
      <Line points={[10, 10, 10, 20]} stroke="#3b82f6" strokeWidth={1.5} />

      <Circle
        x={-10}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const RaspberryPiSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  const topPins = [
    "3V3",
    "SDA",
    "SCL",
    "4",
    "GND",
    "17",
    "27",
    "22",
    "3V3",
    "10",
    "9",
    "11",
    "GND",
    "0",
    "5",
    "6",
    "13",
    "19",
    "26",
    "GND",
  ];
  const botPins = [
    "5V",
    "5V",
    "GND",
    "TX",
    "RX",
    "18",
    "GND",
    "23",
    "24",
    "GND",
    "25",
    "8",
    "7",
    "1",
    "GND",
    "12",
    "GND",
    "16",
    "20",
    "21",
  ];
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Group scaleX={1.8} scaleY={1.8}>
        {/* Green PCB */}
        <Rect
          x={-70}
          y={-47.5}
          width={140}
          height={95}
          fill="#116814"
          shadowColor="#000"
          shadowBlur={4}
          shadowOffsetX={2}
          shadowOffsetY={3}
          shadowOpacity={0.4}
          stroke={stroke}
          strokeWidth={selected ? 2 : 0}
          cornerRadius={4}
        />
        <Circle x={-64} y={-41} radius={3.5} fill="#e2e8f0" />
        <Circle x={64} y={-41} radius={3.5} fill="#e2e8f0" />
        <Circle x={-64} y={41} radius={3.5} fill="#e2e8f0" />
        <Circle x={64} y={41} radius={3.5} fill="#e2e8f0" />
        <Rect
          x={-15}
          y={-15}
          width={30}
          height={30}
          fill="#1f2937"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffsetX={1}
          shadowOffsetY={1}
          shadowOpacity={0.6}
          cornerRadius={2}
        />
        <Text text="Broadcom" x={-13} y={0} fontSize={4} fill="#888" />
        <Rect x={-55} y={-43} width={100} height={10} fill="#111" />
        {topPins.map((pin, i) => (
          <Group key={"rpt" + i}>
            <Line
              points={[-52.5 + i * 5, -41, -52.5 + i * 5, -55]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Circle
              x={-52.5 + i * 5}
              y={-55}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={-52.5 + i * 5 - 2}
              y={-38}
              fontSize={3.5}
              fill="#fff"
              rotation={-90}
            />
          </Group>
        ))}
        {botPins.map((pin, i) => (
          <Group key={"rpb" + i}>
            <Line
              points={[-52.5 + i * 5, -36, -52.5 + i * 5, -22]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Circle
              x={-52.5 + i * 5}
              y={-22}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={-52.5 + i * 5 + 2.5}
              y={-25}
              fontSize={3.5}
              fill="#fff"
              rotation={90}
            />
          </Group>
        ))}
        <Rect
          x={45}
          y={10}
          width={35}
          height={25}
          fill="#cbd5e1"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffsetX={1}
          shadowOffsetY={2}
          shadowOpacity={0.4}
          stroke="#94a3b8"
          strokeWidth={1}
          cornerRadius={1}
        />
        <Rect
          x={45}
          y={-25}
          width={35}
          height={25}
          fill="#cbd5e1"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffsetX={1}
          shadowOffsetY={2}
          shadowOpacity={0.4}
          stroke="#94a3b8"
          strokeWidth={1}
          cornerRadius={1}
        />
        <Rect
          x={40}
          y={-10}
          width={40}
          height={18}
          fill="#cbd5e1"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffsetX={1}
          shadowOffsetY={2}
          shadowOpacity={0.4}
          stroke="#94a3b8"
          strokeWidth={1}
        />
        <Circle
          x={-40}
          y={0}
          radius={10}
          stroke="#ffffff"
          strokeWidth={1.5}
          opacity={0.5}
        />
        <Text
          text="Raspberry Pi"
          x={-25}
          y={25}
          fontSize={10}
          fill="#ffffff"
          fontStyle="bold"
          opacity={0.9}
        />
      </Group>
    </Group>
  );
};

export const BuzzerSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Black plastic cylinder body (top view) */}
      <Circle
        x={0}
        y={0}
        radius={12}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={2}
      />
      <Circle x={0} y={0} radius={10} fill="#1f2937" />
      <Circle x={0} y={0} radius={4} fill="#111" />
      {/* Sticker text */}
      <Text text="+" x={-4} y={3} fontSize={8} fill="#ef4444" />

      {/* Legs (bottom) */}
      <Line points={[-5, 12, -5, 20]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[5, 12, 5, 20]} stroke="#bcc2c2" strokeWidth={2} />

      <Circle
        x={-5}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={5}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};
export const RelaySymbol = ({
  x,
  y,
  rotation,
  selected,
  isOn,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-15}
        y={-15}
        width={30}
        height={30}
        fill="#1d4ed8"
        shadowColor="#000"
        shadowBlur={3}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 1 : 0}
        cornerRadius={2}
      />
      <Text text="SRD-05VDC" x={-12} y={-4} fontSize={4.5} fill="#fff" />
      <Text text="SONGLE" x={-10} y={3} fontSize={4} fill="#93c5fd" />

      {/* 2 Top pins (NC, NO) */}
      <Line points={[-10, 15, -10, 20]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[10, 15, 10, 20]} stroke="#bcc2c2" strokeWidth={2} />

      {/* 3 Bottom pins (Coil1, COM, Coil2) */}
      <Line points={[-10, -15, -10, -20]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[0, -15, 0, -20]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[10, -15, 10, -20]} stroke="#bcc2c2" strokeWidth={2} />

      <Text text="NC" x={-14} y={12} fontSize={3} fill="#fff" />
      <Text text="NO" x={6} y={12} fontSize={3} fill="#fff" />
      <Text text="COIL" x={-13} y={-12} fontSize={3} fill="#fff" />
      <Text text="COM" x={-3} y={-12} fontSize={3} fill="#fff" />
      <Text text="COIL" x={7} y={-12} fontSize={3} fill="#fff" />

      <Circle
        x={-10}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={-10}
        y={-20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={-20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={-20}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />

      {isOn && (
        <Circle
          x={5}
          y={-5}
          radius={3.5}
          fill="#fbbf24"
          shadowColor="#fbbf24"
          shadowBlur={4}
        />
      )}
    </Group>
  );
};

export const PotentiometerSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "#111";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle
        x={0}
        y={0}
        radius={10}
        fill="#3b82f6"
        stroke={stroke}
        strokeWidth={1}
      />
      <Circle x={0} y={0} radius={4} fill="#fff" />
      <Line points={[-4, 0, 4, 0]} stroke="#ccc" strokeWidth={2} />
      <Line points={[-10, 10, -10, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[0, 10, 0, 15]} stroke="#aaa" strokeWidth={2} />
      <Line points={[10, 10, 10, 15]} stroke="#aaa" strokeWidth={2} />
      <Circle
        x={-10}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const OLEDSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Group scaleX={2.2} scaleY={2.2} y={-5}>
        <Rect
          x={-30}
          y={-25}
          width={60}
          height={55}
          fill="#003366"
          shadowColor="#000"
          shadowBlur={4}
          shadowOffsetX={2}
          shadowOffsetY={3}
          shadowOpacity={0.4}
          stroke={stroke}
          strokeWidth={selected ? 2 / 2.2 : 0}
          cornerRadius={3}
        />
        <Rect
          x={-25}
          y={-20}
          width={50}
          height={28}
          fill="#0d0d0d"
          stroke="#1f2937"
          strokeWidth={1}
          shadowColor="#fff"
          shadowBlur={1}
          shadowOpacity={0.1}
        />
        <Line
          points={[-25, -6, 25, -6]}
          stroke="#a5f3fc"
          strokeWidth={0.5}
          opacity={0.1}
        />
        <Text
          text="OLED I2C"
          x={-18}
          y={8}
          fontSize={6}
          fill="#a5f3fc"
          opacity={0.8}
          fontStyle="bold"
        />

        <Rect x={-15} y={15} width={30} height={8} fill="#1f2937" />

        <Line points={[-10, 23, -10, 27]} stroke="#eab308" strokeWidth={2} />
        <Line
          points={[-3.33, 23, -3.33, 27]}
          stroke="#eab308"
          strokeWidth={2}
        />
        <Line points={[3.33, 23, 3.33, 27]} stroke="#eab308" strokeWidth={2} />
        <Line points={[10, 23, 10, 27]} stroke="#eab308" strokeWidth={2} />

        <Text text="GND" x={-13} y={16.5} fontSize={4} fill="#fff" />
        <Text text="VCC" x={-6} y={16.5} fontSize={4} fill="#fff" />
        <Text text="SCL" x={1} y={16.5} fontSize={4} fill="#fff" />
        <Text text="SDA" x={8} y={16.5} fontSize={4} fill="#fff" />
      </Group>

      <Circle
        x={-22}
        y={55}
        radius={3.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={-7.3}
        y={55}
        radius={3.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={7.3}
        y={55}
        radius={3.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={22}
        y={55}
        radius={3.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const MotorSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
  isOn,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DC Motor realistic body */}
      <Rect
        x={-16}
        y={-22}
        width={32}
        height={44}
        fill="#d1d5db"
        shadowColor="#000"
        shadowBlur={3}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={16}
      />
      {/* Front axle cap */}
      <Rect x={-8} y={-26} width={16} height={4} fill="#9ca3af" />
      {/* Spinning Spindle effect if isOn */}
      <Rect
        x={-2}
        y={-32}
        width={4}
        height={6}
        fill={isOn ? "#fbbf24" : "#f3f4f6"}
        shadowColor="#fbbf24"
        shadowBlur={8}
        shadowEnabled={isOn}
      />

      {/* Detail vents */}
      <Circle x={-6} y={-10} radius={4} fill="#374151" opacity={0.6} />
      <Circle x={6} y={-10} radius={4} fill="#374151" opacity={0.6} />
      <Circle x={-6} y={10} radius={4} fill="#374151" opacity={0.6} />
      <Circle x={6} y={10} radius={4} fill="#374151" opacity={0.6} />

      {/* Terminals */}
      <Line points={[-6, 22, -10, 35]} stroke="#ef4444" strokeWidth={2} />
      <Line points={[6, 22, 10, 35]} stroke="#3b82f6" strokeWidth={2} />
      <Text
        text="+"
        x={-16}
        y={15}
        fontSize={8}
        fill="#ef4444"
        fontStyle="bold"
      />
      <Text
        text="-"
        x={12}
        y={15}
        fontSize={8}
        fill="#3b82f6"
        fontStyle="bold"
      />

      <Circle
        x={-10}
        y={35}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={35}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export function CapacitorElectrolyticSymbol({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect
        x={-12}
        y={-15}
        width={24}
        height={30}
        fill="#0f172a"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.5}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={1}
      />
      <Rect
        x={-10}
        y={-15}
        width={4}
        height={30}
        fill="#ffffff"
        opacity={0.15}
      />
      <Rect x={4} y={-15} width={6} height={30} fill="#cbd5e1" />
      <Text text="-" x={5.5} y={-5} fontSize={8} fill="#000" fontStyle="bold" />
      <Rect
        x={-10}
        y={-18}
        width={20}
        height={3}
        fill="#e2e8f0"
        cornerRadius={1}
      />
      <Path
        data="M -5 -18 L 5 -18 M 0 -18 L 0 -15"
        stroke="#94a3b8"
        strokeWidth={1}
      />
      <Text
        text={value || "10uF"}
        x={-9}
        y={0}
        fontSize={5}
        fill="#38bdf8"
        fontStyle="bold"
        rotation={-90}
      />
      <Line points={[-10, 15, -10, 30]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[10, 15, 10, 30]} stroke="#bcc2c2" strokeWidth={2} />
      <Circle
        x={-10}
        y={30}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={30}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}

export const ICSymbol = ({ x, y, rotation, selected, value }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* DIP-14 IC Body (Horizontal) */}
      <Rect
        x={-35}
        y={-16}
        width={70}
        height={32}
        fill="#222"
        shadowColor="#000"
        shadowBlur={4}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={2}
      />
      <Circle x={-27} y={-8} radius={4.5} fill="#0c0c0c" />
      <Path data="M -35 -4 A 4 4 0 0 0 -35 4" fill="#111" />
      <Text text={value || "IC"} x={-20} y={-2} fontSize={7} fill="#ccc" />

      {/* 7 bottom pins (y=20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"B" + i}>
          <Rect x={-32 + i * 10} y={16} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={-30 + i * 10}
            y={20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(i + 1)}
            x={-31 + i * 10}
            y={10}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
      {/* 7 top pins (y=-20) */}
      {[...Array(7)].map((_, i) => (
        <Group key={"T" + i}>
          <Rect x={28 - i * 10} y={-20} width={6} height={6} fill="#bcc2c2" />
          <Circle
            x={30 - i * 10}
            y={-20}
            radius={4}
            fill={selected ? selectedColor : "#e2e8f0"}
            stroke={selected ? selectedColor : "#94a3b8"}
            strokeWidth={1.5}
          />
          <Text
            text={String(14 - i)}
            x={29 - i * 10}
            y={-14}
            fontSize={4}
            fill="#555"
          />
        </Group>
      ))}
    </Group>
  );
};

export function GroundSymbol({ x, y, rotation, selected }: SymbolProps) {
  const stroke = selected ? selectedColor : "#ccc";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Line points={[0, 0, 0, 10]} stroke={stroke} strokeWidth={2} />
      <Line points={[-15, 10, 15, 10]} stroke={stroke} strokeWidth={2} />
      <Line points={[-10, 15, 10, 15]} stroke={stroke} strokeWidth={2} />
      <Line points={[-5, 20, 5, 20]} stroke={stroke} strokeWidth={2} />
      <Circle
        x={0}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}

export function LampSymbol({
  x,
  y,
  rotation,
  selected,
  value,
  isOn,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle
        x={0}
        y={0}
        radius={15}
        fill={isOn || value === "1" || value === "true" ? "#fde047" : "#ffffff"}
        opacity={0.9}
        shadowColor="#fde047"
        shadowBlur={15}
        shadowEnabled={isOn || value === "1" || value === "true"}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1}
      />
      <Path data="M -8 -8 L 8 8 M -8 8 L 8 -8" stroke="#333" strokeWidth={1} />
      <Line points={[-15, 0, -30, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[15, 0, 30, 0]} stroke="#bcc2c2" strokeWidth={2} />
      <Circle
        x={-30}
        y={0}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={30}
        y={0}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
}

export function LEDSymbol({
  x,
  y,
  rotation,
  selected,
  value,
  isOn,
  customProps,
  broken,
}: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  const lit = isOn || value === "1" || value === "true";
  
  // Custom or default color parsing
  let baseColor = customProps?.color?.toLowerCase() || "red";
  let litHex = "#ef4444";
  let darkHex = "#7f1d1d";
  
  switch(baseColor) {
    case "green":
      litHex = "#22c55e";
      darkHex = "#14532d";
      break;
    case "blue":
      litHex = "#3b82f6";
      darkHex = "#1e3a8a";
      break;
    case "yellow":
      litHex = "#eab308";
      darkHex = "#713f12";
      break;
    case "white":
      litHex = "#ffffff";
      darkHex = "#9ca3af";
      break;
  }

  // Override if broken
  if (broken) {
    litHex = "#4b5563";
    darkHex = "#1f2937";
  }

  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* LED Leads (Horizontal) */}
      {/* Anode (left) */}
      <Line points={[-20, 0, -8, 0]} stroke="#bcc2c2" strokeWidth={2.5} />
      {/* Cathode (right) */}
      <Line points={[8, 0, 20, 0]} stroke="#bcc2c2" strokeWidth={2.5} />

      {!broken && <Text text="+" x={-16} y={-10} fontSize={6} fill={litHex} fontStyle="bold" />}
      {broken && <Text text="X" x={-4} y={-4} fontSize={8} fill="#ef4444" fontStyle="bold" />}

      {/* Terminals */}
      <Circle
        x={-20}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={2}
      />
      <Circle
        x={20}
        y={0}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={2}
      />

      {/* LED Plastic Dome base + flat spot for cathode */}
      <Path
        data="M -4 8 C -14 8 -14 -8 -4 -8 L -3 -8 L -3 8 Z"
        fill={broken ? "#4b5563" : lit ? litHex : darkHex}
        shadowColor={litHex}
        shadowBlur={15}
        shadowEnabled={lit && !broken}
        stroke={stroke}
        strokeWidth={selected ? 1 : 0}
      />
      {/* Cathode flat base (Right side of LED dome) */}
      <Path
        data="M 4 -8 C -8 -8 -8 8 4 8 L 5 8 L 5 -8 Z"
        fill={broken ? "#4b5563" : lit ? litHex : darkHex}
        shadowColor={litHex}
        shadowBlur={15}
        shadowEnabled={lit && !broken}
        stroke={stroke}
        strokeWidth={selected ? 1 : 0}
      />
      <Line
        points={[6, -9, 6, 9]}
        stroke={broken ? "#4b5563" : lit ? litHex : darkHex}
        strokeWidth={2}
      />
      <Rect
        x={-2}
        y={-4}
        width={3}
        height={8}
        fill={broken ? "#333" : lit ? "#ffffff" : "#cbd5e1"}
        opacity={0.8}
      />
      <Rect
        x={3}
        y={-2}
        width={2}
        height={4}
        fill={broken ? "#333" : lit ? "#cbd5e1" : "#94a3b8"}
        opacity={0.8}
      />
    </Group>
  );
}

export function ArduinoUnoSymbol({ x, y, rotation, selected }: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  const topPins = [
    "GND",
    "13",
    "12",
    "11",
    "10",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
    "1",
  ];
  const b1Pins = ["RST", "3V3", "5V", "GND", "GND", "VIN"];
  const b2Pins = ["A0", "A1", "A2", "A3", "A4", "A5"];
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Group scaleX={1.6} scaleY={1.6}>
        <Rect
          x={-60}
          y={-45}
          width={120}
          height={90}
          fill="#006468"
          shadowColor="#000"
          shadowBlur={4}
          shadowOffsetX={2}
          shadowOffsetY={3}
          shadowOpacity={0.5}
          stroke={stroke}
          strokeWidth={selected ? 2 : 0}
          cornerRadius={3}
        />
        <Rect
          x={-55}
          y={-35}
          width={30}
          height={20}
          fill="#c0c0c0"
          cornerRadius={2}
        />
        <Rect
          x={-55}
          y={15}
          width={25}
          height={15}
          fill="#111"
          cornerRadius={2}
        />
        <Rect
          x={-10}
          y={-25}
          width={35}
          height={15}
          fill="#111"
          cornerRadius={2}
        />
        <Text
          text="UNO"
          x={-10}
          y={5}
          fontSize={12}
          fill="#fff"
          fontStyle="bold"
          opacity={0.8}
        />

        <Rect x={-45} y={-42} width={90} height={6} fill="#1f2937" />
        {topPins.map((pin, i) => (
          <Group key={"T" + i}>
            <Line
              points={[-41 + i * 6, -39, -41 + i * 6, -55]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={-43 + i * 6}
              y={-41}
              width={4}
              height={4}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={-41 + i * 6}
              y={-55}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={-41 + i * 6 - 2}
              y={-43}
              fontSize={4}
              fill="#fff"
              rotation={-90}
            />
          </Group>
        ))}
        <Rect x={-45} y={36} width={40} height={6} fill="#1f2937" />
        {b1Pins.map((pin, i) => (
          <Group key={"B1" + i}>
            <Line
              points={[-41 + i * 6, 39, -41 + i * 6, 55]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={-43 + i * 6}
              y={37}
              width={4}
              height={4}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={-41 + i * 6}
              y={55}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={-41 + i * 6 + 2}
              y={43}
              fontSize={4}
              fill="#fff"
              rotation={90}
            />
          </Group>
        ))}
        <Rect x={15} y={36} width={40} height={6} fill="#1f2937" />
        {b2Pins.map((pin, i) => (
          <Group key={"B2" + i}>
            <Line
              points={[19 + i * 6, 39, 19 + i * 6, 55]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={17 + i * 6}
              y={37}
              width={4}
              height={4}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={19 + i * 6}
              y={55}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={19 + i * 6 + 2}
              y={43}
              fontSize={4}
              fill="#fff"
              rotation={90}
            />
          </Group>
        ))}
      </Group>
    </Group>
  );
}

export function ESP32Symbol({ x, y, rotation, selected }: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  const leftPins = [
    "3V3",
    "EN",
    "VP",
    "VN",
    "34",
    "35",
    "32",
    "33",
    "25",
    "26",
    "27",
    "14",
    "12",
    "GND",
    "13",
  ];
  const rightPins = [
    "GND",
    "23",
    "22",
    "TXD",
    "RXD",
    "21",
    "GND",
    "19",
    "18",
    "5",
    "17",
    "16",
    "4",
    "2",
    "15",
  ];
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Group scaleX={1.6} scaleY={1.6}>
        <Rect
          x={-32.5}
          y={-60}
          width={65}
          height={120}
          fill="#111111"
          shadowColor="#000"
          shadowBlur={4}
          shadowOffsetX={2}
          shadowOffsetY={3}
          shadowOpacity={0.5}
          stroke={stroke}
          strokeWidth={selected ? 2 : 0}
          cornerRadius={3}
        />
        <Rect x={-20} y={-58} width={40} height={35} fill="#18181b" />
        <Path
          data="M-15 -50 L-15 -55 L-10 -55 L-10 -50 L-5 -50 L-5 -55 L0 -55 L0 -50 L5 -50 L5 -55 L10 -55 L10 -50 L15 -50 L15 -55"
          stroke="#d4af37"
          strokeWidth={2}
        />
        <Rect
          x={-25}
          y={-20}
          width={50}
          height={40}
          fill="#cbd5e1"
          shadowColor="#000"
          shadowBlur={2}
          shadowOffsetX={1}
          shadowOffsetY={2}
          shadowOpacity={0.3}
          cornerRadius={2}
        />
        <Text
          text="ESP-WROOM-32"
          x={-20}
          y={-5}
          fontSize={5}
          fill="#333"
          fontStyle="bold"
        />
        <Rect
          x={-8}
          y={50}
          width={16}
          height={10}
          fill="#cbd5e1"
          cornerRadius={1}
        />
        <Rect x={-6} y={54} width={12} height={6} fill="#4b5563" />
        <Circle x={-15} y={45} radius={4} fill="#222" />
        <Circle x={15} y={45} radius={4} fill="#222" />
        <Text text="EN" x={-20} y={40} fontSize={4} fill="#fff" />
        <Text text="BOOT" x={11} y={40} fontSize={4} fill="#fff" />

        <Rect x={-30} y={-10} width={6} height={100} fill="#1f2937" />
        {leftPins.map((pin, i) => (
          <Group key={"l" + i}>
            <Line
              points={[-27, -6 + i * 6.5, -40, -6 + i * 6.5]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={-29}
              y={-8 + i * 6.5}
              width={4}
              height={4}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={-40}
              y={-6 + i * 6.5}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={-24}
              y={-7.5 + i * 6.5}
              fontSize={4}
              fill="#fff"
            />
          </Group>
        ))}
        <Rect x={24} y={-10} width={6} height={100} fill="#1f2937" />
        {rightPins.map((pin, i) => (
          <Group key={"r" + i}>
            <Line
              points={[27, -6 + i * 6.5, 40, -6 + i * 6.5]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={25}
              y={-8 + i * 6.5}
              width={4}
              height={4}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={40}
              y={-6 + i * 6.5}
              radius={3.5}
              fill={selected ? selectedColor : "#e2e8f0"}
              stroke={selected ? selectedColor : "#94a3b8"}
              strokeWidth={1}
            />
            <Text
              text={pin}
              x={10}
              y={-7.5 + i * 6.5}
              width={13}
              fontSize={4}
              fill="#fff"
              align="right"
            />
          </Group>
        ))}
      </Group>
    </Group>
  );
}

export function ESP32CamSymbol({ x, y, rotation, selected }: SymbolProps) {
  const stroke = selected ? selectedColor : "transparent";
  const leftPins = ["5V", "GND", "12", "13", "15", "14", "2", "4"];
  const rightPins = ["3V3", "U0R", "U0T", "GND", "16", "0", "VCC", "GND"];
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Group scaleX={1.6} scaleY={1.6}>
        <Rect
          x={-40}
          y={-50}
          width={80}
          height={100}
          fill="#18181a"
          stroke={stroke}
          strokeWidth={selected ? 2 : 0}
          cornerRadius={4}
          shadowColor="#000"
          shadowBlur={4}
          shadowOffsetX={2}
          shadowOffsetY={3}
          shadowOpacity={0.5}
        />
        <Text
          text="ESP32-CAM"
          x={-20}
          y={-45}
          fontSize={7}
          fill="#fff"
          fontStyle="bold"
        />
        <Rect x={-38} y={-35} width={8} height={80} fill="#222" />
        {leftPins.map((pin, i) => (
          <Group key={"cl" + i}>
            <Line
              points={[-34, -29 + i * 9.5, -48, -29 + i * 9.5]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={-37}
              y={-32 + i * 9.5}
              width={6}
              height={6}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={-48}
              y={-29 + i * 9.5}
              radius={3.5}
              fill={selected ? selectedColor : "#eee"}
            />
            <Text
              text={pin}
              x={-28}
              y={-31 + i * 9.5}
              fontSize={5}
              fill="#fff"
            />
          </Group>
        ))}
        <Rect x={30} y={-35} width={8} height={80} fill="#222" />
        {rightPins.map((pin, i) => (
          <Group key={"cr" + i}>
            <Line
              points={[34, -29 + i * 9.5, 48, -29 + i * 9.5]}
              stroke="#bcc2c2"
              strokeWidth={1}
            />
            <Rect
              x={31}
              y={-32 + i * 9.5}
              width={6}
              height={6}
              fill="#475569"
              cornerRadius={1}
            />
            <Circle
              x={48}
              y={-29 + i * 9.5}
              radius={3.5}
              fill={selected ? selectedColor : "#eee"}
            />
            <Text
              text={pin}
              x={10}
              y={-31 + i * 9.5}
              width={18}
              fontSize={5}
              fill="#fff"
              align="right"
            />
          </Group>
        ))}
        <Rect
          x={-15}
          y={-10}
          width={30}
          height={30}
          fill="#111"
          shadowColor="#000"
          shadowBlur={4}
          shadowOpacity={0.6}
          cornerRadius={2}
        />
        <Circle
          x={0}
          y={5}
          radius={10}
          fill="#0d0d0d"
          stroke="#333"
          strokeWidth={1}
        />
        <Circle x={0} y={5} radius={4} fill="#0a3a40" opacity={0.8} />
        <Circle x={2} y={3} radius={1} fill="#fff" opacity={0.6} />
      </Group>
    </Group>
  );
}

export const PowerSupplySymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
  customProps,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* Bench Power Supply Case */}
      <Rect
        x={-26}
        y={-30}
        width={52}
        height={60}
        fill="#1f2937"
        shadowColor="#000"
        shadowBlur={6}
        shadowOffsetX={2}
        shadowOffsetY={3}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
        cornerRadius={3}
      />

      {/* Screen */}
      <Rect
        x={-22}
        y={-26}
        width={44}
        height={20}
        fill="#064e3b"
        cornerRadius={2}
      />
      <Text
        text={(value || "12") + ".0 V"}
        x={-20}
        y={-22}
        fontSize={8}
        fill="#34d399"
        fontStyle="bold"
        fontFamily="monospace"
      />
      <Text
        text={(parseFloat(customProps?.maxCurrent?.toString() || "1") ).toFixed(2) + " A"}
        x={-20}
        y={-12}
        fontSize={8}
        fill="#34d399"
        fontStyle="bold"
        fontFamily="monospace"
      />

      {/* Knobs */}
      <Circle
        x={-14}
        y={8}
        radius={5}
        fill="#111"
        stroke="#4b5563"
        strokeWidth={1}
      />
      <Circle
        x={14}
        y={8}
        radius={5}
        fill="#111"
        stroke="#4b5563"
        strokeWidth={1}
      />

      {/* Banana Plug Ports */}
      <Circle x={-12} y={22} radius={4} fill="#7f1d1d" />
      <Circle x={-12} y={22} radius={4} fill="#000" />
      <Text text="+" x={-16} y={28} fontSize={6} fill="#ef4444" />

      <Circle x={12} y={22} radius={4} fill="#1e3a8a" />
      <Circle x={12} y={22} radius={4} fill="#000" />
      <Text text="-" x={14} y={28} fontSize={6} fill="#3b82f6" />

      {/* Bottom Pins (Routing) */}
      <Line points={[-12, 22, -10, 40]} stroke="#ef4444" strokeWidth={2} />
      <Line points={[12, 22, 10, 40]} stroke="#3b82f6" strokeWidth={2} />

      <Circle
        x={-10}
        y={40}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={10}
        y={40}
        radius={4.5}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const TransistorSymbol = ({
  x,
  y,
  rotation,
  selected,
  value,
}: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* TO-92 Package: D shape */}
      <Path
        data="M -16 -10 L 16 -10 A 15 15 0 0 1 16 8 L -16 8 Z"
        fill="#222"
        shadowColor="#000"
        shadowBlur={2}
        shadowOffsetX={1}
        shadowOffsetY={2}
        shadowOpacity={0.4}
        stroke={stroke}
        strokeWidth={selected ? 2 : 0}
      />
      <Rect x={-8} y={-8} width={4} height={16} fill="#111" />
      <Text
        text={value || "2N222"}
        x={-2}
        y={-6}
        fontSize={5}
        fill="#aaa"
        rotation={90}
      />
      <Text text="NPN" x={2} y={-4} fontSize={3} fill="#777" rotation={90} />
      <Line points={[-15, 8, -15, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[0, 8, 0, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Line points={[15, 8, 15, 15]} stroke="#bcc2c2" strokeWidth={2} />
      <Text text="C" x={-16} y={16} fontSize={3} fill="#777" />
      <Text text="B" x={-1} y={16} fontSize={3} fill="#777" />
      <Text text="E" x={14} y={16} fontSize={3} fill="#777" />
      <Circle
        x={-15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
      <Circle
        x={15}
        y={15}
        radius={4}
        fill={selected ? selectedColor : "#e2e8f0"}
        stroke={selected ? selectedColor : "#94a3b8"}
        strokeWidth={1.5}
      />
    </Group>
  );
};

export const PCBDIP8Symbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-15} y={-15} width={30} height={30} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={2} />
      <Path data="M -5 -15 A 5 5 0 0 0 5 -15" stroke="#4b5563" strokeWidth={1} />
      {[-10, -5, 5, 10].map((px) => <Circle key={`p1_${px}`} x={px} y={-12} radius={2.2} fill="#d1d5db" />)}
      {[-10, -5, 5, 10].map((px) => <Circle key={`p2_${px}`} x={px} y={12} radius={2.2} fill="#d1d5db" />)}
    </Group>
  );
};

export const PCBSMDSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-8} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={4} y={-5} width={4} height={10} fill="#9ca3af" cornerRadius={1} />
      <Rect x={-5} y={-4.5} width={10} height={9} fill="#111827" stroke={stroke} strokeWidth={selected ? 2 : 0} />
    </Group>
  );
};

export const PCBPadSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={4} fill="#d1d5db" stroke={stroke} strokeWidth={selected ? 2 : 0} />
    </Group>
  );
};

export const PCBViaSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={3.5} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Circle x={0} y={0} radius={1.5} fill="#0f0f13" />
    </Group>
  );
};

export const PCBSot23Symbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-6} y={-4} width={12} height={8} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={1} />
      <Rect x={-8} y={-6} width={3.5} height={3.5} fill="#d1d5db" />
      <Rect x={4.5} y={-6} width={3.5} height={3.5} fill="#d1d5db" />
      <Rect x={-1.75} y={3} width={3.5} height={3.5} fill="#d1d5db" />
    </Group>
  );
};

export const PCBTo220Symbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-16} y={-4} width={32} height={8} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Rect x={-16} y={-10} width={32} height={6} fill="#9ca3af" />
      <Circle x={0} y={-7} radius={2.5} fill="#374151" />
      {[-10, 0, 10].map((px) => <Circle key={px} x={px} y={0} radius={2.5} fill="#d1d5db" />)}
    </Group>
  );
};

export const PCBSopSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      {/* IC Plastic Body (Central rectangle, width 18, height 26) */}
      <Rect x={-9} y={-13} width={18} height={26} fill="#1e293b" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={1} />
      {/* Pin 1 polarity dot on body */}
      <Circle x={-5} y={-9} radius={1.2} fill="#94a3b8" />
      
      {/* Left side solder pads & metal Gull-wing pins */}
      {[-10, -5, 5, 10].map((py, idx) => (
        <Group key={`left_${idx}`} y={py}>
          {/* Silver/Gold copper Solder Pad at x = -15, width = 6, height = 2.4 */}
          <Rect x={-18} y={-1.2} width={6} height={2.4} fill="#cbd5e1" cornerRadius={0.5} />
          {/* Metal Gull-wing trace pin extending from body edge x = -9 to pad center x = -15 */}
          <Rect x={-13} y={-0.6} width={4} height={1.2} fill="#e2e8f0" />
        </Group>
      ))}

      {/* Right side solder pads & metal Gull-wing pins */}
      {[-10, -5, 5, 10].map((py, idx) => (
        <Group key={`right_${idx}`} y={py}>
          {/* Silver/Gold copper Solder Pad at x = 15, width = 6, height = 2.4 */}
          <Rect x={12} y={-1.2} width={6} height={2.4} fill="#cbd5e1" cornerRadius={0.5} />
          {/* Metal Gull-wing trace pin extending from body edge x = 9 to pad center x = 15 */}
          <Rect x={9} y={-0.6} width={4} height={1.2} fill="#e2e8f0" />
        </Group>
      ))}
    </Group>
  );
};
export const PCBQfpSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? selectedColor : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Rect x={-20} y={-20} width={40} height={40} fill="#1f2937" stroke={stroke} strokeWidth={selected ? 2 : 0} cornerRadius={1} />
      <Circle x={-15} y={-15} radius={1.5} fill="#4b5563" />
      {[...Array(8)].map((_, i) => <Rect key={`t_${i}`} x={-14 + i * 4} y={-23} width={2} height={4} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={`b_${i}`} x={-14 + i * 4} y={19} width={2} height={4} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={`l_${i}`} x={-23} y={-14 + i * 4} width={4} height={2} fill="#9ca3af" />)}
      {[...Array(8)].map((_, i) => <Rect key={`r_${i}`} x={19} y={-14 + i * 4} width={4} height={2} fill="#9ca3af" />)}
    </Group>
  );
};


export const PCBFiducialSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={3.5} fill="transparent" stroke="#b91c1c" strokeWidth={1} />
      <Circle x={0} y={0} radius={1.5} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 1 : 0} />
    </Group>
  );
};

export const PCBMountingHoleSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={4} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 2 : 0} />
      <Circle x={0} y={0} radius={2.5} fill="#1f2937" />
    </Group>
  );
};

export const PCBTestPointSymbol = ({ x, y, rotation, selected }: SymbolProps) => {
  const stroke = selected ? "#008400" : "transparent";
  return (
    <Group x={x} y={y} rotation={rotation} draggable={false}>
      <Circle x={0} y={0} radius={2.5} fill="#fbbf24" stroke={stroke} strokeWidth={selected ? 1 : 0} />
      <Text text="TP" x={3} y={-10} fontSize={8} fill="#ffffff" />
    </Group>
  );
};
