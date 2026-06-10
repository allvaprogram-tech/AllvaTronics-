import React, { useState } from "react";
import { Calculator, X } from "lucide-react";

const COLORS = [
  {
    name: "Preto",
    value: 0,
    mult: 1,
    tol: null,
    color: "#000000",
    text: "white",
  },
  {
    name: "Marrom",
    value: 1,
    mult: 10,
    tol: 1,
    color: "#8B4513",
    text: "white",
  },
  {
    name: "Vermelho",
    value: 2,
    mult: 100,
    tol: 2,
    color: "#FF0000",
    text: "white",
  },
  {
    name: "Laranja",
    value: 3,
    mult: 1000,
    tol: null,
    color: "#FFA500",
    text: "black",
  },
  {
    name: "Amarelo",
    value: 4,
    mult: 10000,
    tol: null,
    color: "#FFFF00",
    text: "black",
  },
  {
    name: "Verde",
    value: 5,
    mult: 100000,
    tol: 0.5,
    color: "#008000",
    text: "white",
  },
  {
    name: "Azul",
    value: 6,
    mult: 1000000,
    tol: 0.25,
    color: "#0000FF",
    text: "white",
  },
  {
    name: "Violeta",
    value: 7,
    mult: 10000000,
    tol: 0.1,
    color: "#EE82EE",
    text: "black",
  },
  {
    name: "Cinza",
    value: 8,
    mult: 100000000,
    tol: 0.05,
    color: "#808080",
    text: "white",
  },
  {
    name: "Branco",
    value: 9,
    mult: 1000000000,
    tol: null,
    color: "#FFFFFF",
    text: "black",
  },
  {
    name: "Ouro",
    value: null,
    mult: 0.1,
    tol: 5,
    color: "#FFD700",
    text: "black",
  },
  {
    name: "Prata",
    value: null,
    mult: 0.01,
    tol: 10,
    color: "#C0C0C0",
    text: "black",
  },
];

export function ResistorCalculator({ onClose }: { onClose: () => void }) {
  const [band1, setBand1] = useState(1); // Brown
  const [band2, setBand2] = useState(0); // Black
  const [band3, setBand3] = useState(2); // Red (Multiplier)
  const [band4, setBand4] = useState(10); // Gold (Tolerance)

  const calcResistance = () => {
    const b1 = COLORS[band1].value ?? 0;
    const b2 = COLORS[band2].value ?? 0;
    const mult = COLORS[band3].mult;
    const val = (b1 * 10 + b2) * mult;

    if (val >= 1000000)
      return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")} MΩ`;
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, "")} kΩ`;
    return `${val.toFixed(1).replace(/\.0$/, "")} Ω`;
  };

  const getTol = () => {
    return COLORS[band4].tol ? `±${COLORS[band4].tol}%` : "";
  };

  return (
    <div className="absolute top-16 right-4 left-4 md:left-auto md:w-80 max-h-[calc(100vh-5rem)] bg-[#16161a] border border-[#2d2d33] shadow-2xl rounded-lg z-50 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-[#2d2d33] bg-[#0f0f13]">
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-white">
            Calculadora de Resistores
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-sm hover:bg-[#2d2d33] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Visual Resistor */}
        <div className="flex items-center justify-center py-4 relative">
          <div className="absolute h-1 w-full bg-gray-500 top-1/2 -mt-0.5 -z-10" />
          <div className="w-40 h-12 bg-[#eee4d6] rounded-xl flex items-center justify-between px-2 shadow-inner border border-[#d6cfc5]">
            <div
              className="w-3 h-full rounded-sm"
              style={{ backgroundColor: COLORS[band1].color }}
            />
            <div
              className="w-3 h-full rounded-sm"
              style={{ backgroundColor: COLORS[band2].color }}
            />
            <div
              className="w-3 h-full rounded-sm"
              style={{ backgroundColor: COLORS[band3].color }}
            />
            <div className="w-1" />
            <div
              className="w-3 h-full rounded-sm"
              style={{ backgroundColor: COLORS[band4].color }}
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-green-400">
            {calcResistance()}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            Tolerância {getTol()}
          </div>
        </div>

        <div className="space-y-3 mt-2">
          <SelectBand
            label="Faixa 1 (1º Dígito)"
            value={band1}
            onChange={setBand1}
            options={COLORS.slice(0, 10)}
          />
          <SelectBand
            label="Faixa 2 (2º Dígito)"
            value={band2}
            onChange={setBand2}
            options={COLORS.slice(0, 10)}
          />
          <SelectBand
            label="Faixa 3 (Multiplicador)"
            value={band3}
            onChange={setBand3}
            options={COLORS}
          />
          <SelectBand
            label="Faixa 4 (Tolerância)"
            value={band4}
            onChange={setBand4}
            options={COLORS.filter((c) => c.tol !== null)}
          />
        </div>
      </div>
    </div>
  );
}

function SelectBand({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-[#0f0f13] border border-[#2d2d33] text-sm text-white rounded p-1.5 focus:border-green-500 outline-none"
      >
        {options.map((opt: any) => {
          const originalIndex = COLORS.findIndex((c) => c.name === opt.name);
          return (
            <option key={opt.name} value={originalIndex}>
              {opt.name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
