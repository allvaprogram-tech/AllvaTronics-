import React from "react";
import { useEditor } from "../store";
import { ComponentEntity, PcbComponentEntity, AnyElement } from "../types";
import {
  Settings2,
  RotateCw,
  AlignVerticalSpaceAround,
  Crosshair,
  Layers,
  Zap,
  Type,
  AlignLeft,
  Scale3d,
  Code,
} from "lucide-react";
import { cn } from "../lib/utils";

interface SectionProps {
  title: string;
  icon: React.ElementType<{ className?: string }>;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <div className="pb-4 mb-4 border-b border-[#2d2d33] last:border-0">
      <div className="flex items-center gap-2 mb-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <h4 className="text-xs font-semibold tracking-wider uppercase">
          {title}
        </h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500 min-w-[70px]">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function getDefaultUnit(type: string) {
  if (type.includes("resistor") || type === "potentiometer") return "Ω";
  if (type.includes("capacitor")) return "F";
  if (type === "inductor") return "H";
  if (["powersupply", "battery", "ac_source", "voltmeter"].includes(type))
    return "V";
  if (type === "ammeter") return "A";
  if (type === "motor") return "rpm";
  if (type === "buzzer") return "Hz";
  return "";
}

function ValueUnitInput({
  value,
  onChange,
  componentType,
}: {
  value: string;
  onChange: (val: string) => void;
  componentType: string;
}) {
  const unit = getDefaultUnit(componentType);
  if (!unit) {
    return (
      <Input
        value={value || ""}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder="Valor"
      />
    );
  }

  // Extract number and scale (k, m, u, n, p, M)
  const match = (value || "").match(/^([\d.]+)\s*([kKmMunp]?)/);
  const numVal = match ? match[1] : "";
  const scaleVal = match ? match[2] : "";

  const handleNumChange = (e: any) =>
    onChange(`${e.target.value}${scaleVal}${unit}`);
  const handleScaleChange = (e: any) =>
    onChange(`${numVal}${e.target.value}${unit}`);

  return (
    <div className="flex bg-[#0f0f13] border border-[#2d2d33] rounded overflow-hidden focus-within:border-blue-500 w-full transition-all">
      <input
        type="number"
        step="any"
        value={numVal}
        onChange={handleNumChange}
        className="w-full bg-transparent px-2 py-1 outline-none text-white text-xs font-mono text-right"
        placeholder="10"
      />
      <select
        value={scaleVal}
        onChange={handleScaleChange}
        className="bg-[#2d2d33] text-gray-300 text-[10px] outline-none px-1 border-l border-[#2d2d33] cursor-pointer"
      >
        <option value="">-</option>
        <option value="p">p</option>
        <option value="n">n</option>
        <option value="u">µ</option>
        <option value="m">m</option>
        <option value="k">k</option>
        <option value="M">M</option>
      </select>
      <div className="bg-[#2d2d33] text-gray-400 text-xs px-2 py-1 flex items-center justify-center font-mono">
        {unit}
      </div>
    </div>
  );
}
function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  max,
  step,
  className,
}: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn(
        "w-full bg-[#0f0f13] px-2 py-1 rounded border border-[#2d2d33] text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-white text-xs transition-all",
        type === "number" && "font-mono",
        className,
      )}
    />
  );
}

export function PropertiesPanel() {
  const { mode, elements, pcbElements, selectedIds, updateElement } =
    useEditor();

  const activeElements = mode === "schematic" ? elements : pcbElements;
  const selectedElement = activeElements.find((el) => el.id === selectedIds[0]);

  if (!selectedElement) {
    return (
      <div className="w-64 h-full shrink-0 bg-[#16161a] md:border-l border-[#2d2d33] flex flex-col shadow-xl z-20">
        <div className="h-10 border-b border-[#2d2d33] flex items-center px-4">
          <span className="text-xs font-medium text-gray-400">
            PROPRIEDADES
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
          <Settings2 className="w-8 h-8 mb-3 opacity-20" />
          <span className="text-sm">Nenhum elemento selecionado</span>
          <span className="text-[10px] mt-2 opacity-60">
            Selecione um componente para editar suas propriedades
          </span>
        </div>
      </div>
    );
  }

  const isSchemaComponent = selectedElement.type === "component";
  const isPcbComponent = selectedElement.type === "pcb_component";
  const isBoard = selectedElement.type === "board";
  const isComponent = isSchemaComponent || isPcbComponent;

  const comp = selectedElement as ComponentEntity | PcbComponentEntity;

  const getTypeName = (el: AnyElement) => {
    if (el.type === "component") return el.componentType.replace("_", " ");
    if (el.type === "pcb_component") return el.componentType.replace("_", " ");
    if (el.type === "trace") return "Trilha (Track)";
    if (el.type === "board") return "Placa (Board)";
    return "Fio (Wire)";
  };

  return (
    <div className="w-64 h-full shrink-0 bg-[#16161a] md:border-l border-[#2d2d33] flex flex-col shadow-xl z-20">
      <div className="h-10 border-b border-[#2d2d33] flex items-center px-4 bg-[#1a1a1f]">
        <span className="text-xs font-medium text-gray-200">INSPECTOR</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Section title="Geral" icon={AlignLeft}>
          <PropertyRow label="Tipo">
            <span className="text-xs text-blue-400 capitalize bg-blue-400/10 px-2 py-0.5 rounded font-medium">
              {getTypeName(selectedElement)}
            </span>
          </PropertyRow>

          {isComponent && (
            <PropertyRow label="Name">
              <Input
                value={comp.name}
                onChange={(e: any) =>
                  updateElement(comp.id, { name: e.target.value })
                }
              />
            </PropertyRow>
          )}
        </Section>

        {isComponent && (
          <Section title="Posição / Transformação" icon={Crosshair}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  X (mm)
                </label>
                <Input
                  type="number"
                  value={comp.x}
                  onChange={(e: any) =>
                    updateElement(comp.id, { x: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Y (mm)
                </label>
                <Input
                  type="number"
                  value={comp.y}
                  onChange={(e: any) =>
                    updateElement(comp.id, { y: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <PropertyRow label="Rotação">
              <div className="flex bg-[#0f0f13] rounded border border-[#2d2d33] overflow-hidden focus-within:border-blue-500 transition-colors w-full">
                <input
                  type="number"
                  value={comp.rotation}
                  onChange={(e) =>
                    updateElement(comp.id, {
                      rotation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-transparent px-2 py-1 outline-none text-white text-xs font-mono text-right"
                />
                <button
                  onClick={() =>
                    updateElement(comp.id, {
                      rotation: (comp.rotation + 90) % 360,
                    })
                  }
                  className="px-2 bg-[#2d2d33] hover:bg-gray-600 transition text-gray-300 border-l border-[#2d2d33] flex items-center justify-center"
                  title="Rotacionar 90°"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
            </PropertyRow>
          </Section>
        )}

        {(isPcbComponent || selectedElement.type === "trace") && (
          <Section title="Camada Física" icon={Layers}>
            <PropertyRow label="Layer">
              <div className="flex bg-[#0f0f13] p-0.5 rounded border border-[#2d2d33] w-full">
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, { layer: "top" })
                  }
                  className={cn(
                    "flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors tracking-wider",
                    (selectedElement as any).layer === "top"
                      ? "bg-red-500 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#2d2d33]",
                  )}
                >
                  Top
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, { layer: "bottom" })
                  }
                  className={cn(
                    "flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors tracking-wider",
                    (selectedElement as any).layer === "bottom"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#2d2d33]",
                  )}
                >
                  Bottom
                </button>
              </div>
            </PropertyRow>
          </Section>
        )}

        {["arduino_uno", "esp32", "esp32_cam", "raspberry_pi"].includes(
          (comp as ComponentEntity).componentType,
        ) && (
          <Section title="Código Emulado (JS)" icon={Code}>
            <p className="text-[9px] text-gray-500 mb-2 leading-tight">
              Ex:{" "}
              <code className="text-teal-400">
                Mcu.pins[13] = Mcu.digitalRead(0) ? 5 : 0;
              </code>
            </p>
            <textarea
              value={(comp as ComponentEntity).customProps?.code || ""}
              onChange={(e: any) =>
                updateElement(comp.id, {
                  customProps: {
                    ...(comp as ComponentEntity).customProps,
                    code: e.target.value,
                  },
                })
              }
              className="w-full h-40 bg-[#0f0f13] text-gray-300 font-mono text-[10px] p-2 border border-[#2d2d33] rounded focus:border-blue-500 outline-none resize-none custom-scrollbar"
              placeholder="// function(time, Mcu)\n// Mcu.pins[13] = 5;\n// let v = Mcu.analogRead(0);\n// Mcu.state.myVar = 1;"
            />
          </Section>
        )}

        {isSchemaComponent &&
          (comp as ComponentEntity).componentType !== "ground" && (
            <Section title="Parâmetros" icon={Zap}>
              <PropertyRow
                label={
                  ["powersupply", "battery", "ac_source"].includes(
                    (comp as ComponentEntity).componentType,
                  )
                    ? "Tensão"
                    : "Valor"
                }
              >
                <ValueUnitInput
                  value={(comp as ComponentEntity).value || ""}
                  componentType={(comp as ComponentEntity).componentType}
                  onChange={(val: string) =>
                    updateElement(comp.id, { value: val })
                  }
                />
              </PropertyRow>

              {["powersupply", "battery", "ac_source"].includes(
                (comp as ComponentEntity).componentType,
              ) && (
                <PropertyRow label="Corrente Max.">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      (comp as ComponentEntity).customProps?.currentLimit ?? 2
                    }
                    onChange={(e: any) =>
                      updateElement(comp.id, {
                        customProps: {
                          ...(comp as ComponentEntity).customProps,
                          currentLimit: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </PropertyRow>
              )}

              {(comp as ComponentEntity).componentType === "resistor" && (
                <PropertyRow label="Potência Máx. (W)">
                  <select
                    value={
                      (
                        comp as ComponentEntity
                      ).customProps?.maxPower?.toString() || "0.25"
                    }
                    onChange={(e: any) =>
                      updateElement(comp.id, {
                        customProps: {
                          ...(comp as ComponentEntity).customProps,
                          maxPower: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="bg-[#0f0f13] border border-[#2d2d33] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500 w-full"
                  >
                    <option value="0.125">1/8 W (0.125W)</option>
                    <option value="0.25">1/4 W (0.25W)</option>
                    <option value="0.5">1/2 W (0.5W)</option>
                    <option value="1">1 W</option>
                    <option value="3">3 W</option>
                    <option value="5">5 W</option>
                    <option value="10">10 W</option>
                  </select>
                </PropertyRow>
              )}

              {["transistor", "transistor_pnp", "mosfet", "mosfet_p", "ic"].includes((comp as ComponentEntity).componentType) && (
                <PropertyRow label="Referência / Modelo">
                  <Input
                    value={(comp as ComponentEntity).value || ""}
                    onChange={(val) => updateElement(comp.id, { value: val })}
                    placeholder="e.g. 2N3904, IRFZ44N"
                  />
                </PropertyRow>
              )}

              {(comp as ComponentEntity).componentType === "potentiometer" && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Ajuste Real</span>
                    <span className="text-teal-400 font-mono">
                      {(comp as ComponentEntity).customProps?.setting ?? 50}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(comp as ComponentEntity).customProps?.setting ?? 50}
                    onChange={(e) =>
                      updateElement(comp.id, {
                        customProps: {
                          ...(comp as ComponentEntity).customProps,
                          setting: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full accent-teal-500 h-1.5 bg-[#2d2d33] rounded-lg appearance-none"
                  />
                </div>
              )}
              {(comp as ComponentEntity).componentType === "oscilloscope" && (
                <div className="space-y-2 mt-2">
                  <PropertyRow label="Escala (V/div)">
                    <Input
                      type="number"
                      value={(comp as ComponentEntity).customProps?.scale ?? 20}
                      onChange={(val) =>
                        updateElement(comp.id, {
                          customProps: {
                            ...(comp as ComponentEntity).customProps,
                            scale: parseFloat(val) || 20,
                          },
                        })
                      }
                      placeholder="e.g. 20"
                    />
                  </PropertyRow>
                </div>
              )}

              {(comp as ComponentEntity).componentType === "led" && (
                <PropertyRow label="Cor do LED">
                  <select
                    className="w-full bg-[#1e1e24] text-xs text-gray-300 rounded border border-[#2d2d33] px-2 py-1 outline-none focus:border-blue-500"
                    value={(comp as ComponentEntity).customProps?.color || "red"}
                    onChange={(e) =>
                      updateElement(comp.id, {
                        customProps: {
                          ...(comp as ComponentEntity).customProps,
                          color: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="red">Vermelho (1.8V)</option>
                    <option value="green">Verde (2.2V)</option>
                    <option value="blue">Azul (3.0V)</option>
                    <option value="yellow">Amarelo (2.1V)</option>
                    <option value="white">Branco (3.0V)</option>
                  </select>
                </PropertyRow>
              )}
            </Section>
          )}

        {["wire", "trace"].includes(selectedElement.type) && (
          <Section
            title="Propriedades de Linha"
            icon={AlignVerticalSpaceAround}
          >
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Espessura (Largura)</span>
                <span className="font-mono text-gray-300">
                  {(selectedElement as any).width ||
                    (selectedElement.type === "trace" ? 4 : 2)}{" "}
                  px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={
                  (selectedElement as any).width ||
                  (selectedElement.type === "trace" ? 4 : 2)
                }
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    width: parseInt(e.target.value) || 2,
                  })
                }
                className="w-full accent-blue-500 h-1.5 bg-[#2d2d33] rounded-lg appearance-none"
              />
            </div>
          </Section>
        )}

        {isBoard && (
          <Section title="Dimensões da Placa" icon={Scale3d}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Largura (mm)
                </label>
                <Input
                  type="number"
                  value={(selectedElement as any).width}
                  onChange={(e: any) =>
                    updateElement(selectedElement.id, {
                      width: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Altura (mm)
                </label>
                <Input
                  type="number"
                  value={(selectedElement as any).height}
                  onChange={(e: any) =>
                    updateElement(selectedElement.id, {
                      height: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>
            <PropertyRow label="Camadas">
              <Input
                type="number"
                step="2"
                min="2"
                max="16"
                value={(selectedElement as any).customProps?.layers || 2}
                onChange={(e: any) =>
                  updateElement(selectedElement.id, {
                    customProps: {
                      ...(selectedElement as any).customProps,
                      layers: parseInt(e.target.value) || 2,
                    },
                  })
                }
              />
            </PropertyRow>
          </Section>
        )}
      </div>
    </div>
  );
}
