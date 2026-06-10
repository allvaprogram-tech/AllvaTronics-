import React, { useState } from "react";
import { useEditor } from "../store";
import {
  MousePointer2,
  GitCommitHorizontal,
  CircleDot,
  Zap,
  TriangleAlert,
  BoxSelect,
  Eraser,
  Activity,
  ArrowRightToLine,
  Battery as BatteryIcon,
  ToggleLeft,
  Layers,
  SquareChartGantt,
  Lightbulb,
  PlugZap,
  Cpu,
  Volume2,
  Ratio,
  RotateCw,
  Monitor,
  Fan,
  Gauge,
  Waypoints,
  AudioWaveform,
  Play,
  Search,
  Grid,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ToolType, PcbToolType } from "../types";
import { cn } from "../lib/utils";

function Accordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-1.5 flex items-center justify-between text-[10px] font-bold text-gray-400 hover:text-gray-200 uppercase tracking-wider bg-[#1a1a1f] border-y border-[#2d2d33]"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      {isOpen && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-[#121215]">
          {children}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const {
    mode,
    tool,
    setTool,
    pcbTool,
    setPcbTool,
    activePcbLayer,
    setActivePcbLayer,
    activeWireColor,
    setActiveWireColor,
  } = useEditor();
  const [search, setSearch] = useState("");

  const wireColors = [
    { value: "#bcc2c2", label: "Padrão" },
    { value: "#ef4444", label: "Vermelho" },
    { value: "#000000", label: "Preto" },
    { value: "#3b82f6", label: "Azul" },
    { value: "#22c55e", label: "Verde" },
    { value: "#eab308", label: "Amarelo" },
    { value: "#f97316", label: "Laranja" },
  ];

  const schematicToolItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "select", icon: MousePointer2, label: "Selecionar" },
    { type: "probe", icon: Activity, label: "Ponta de Prova" },
    { type: "wire", icon: GitCommitHorizontal, label: "Fio" },
    { type: "eraser", icon: Eraser, label: "Borracha" },
  ];

  const passiveItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "resistor", icon: Zap, label: "Resistor" },
    { type: "capacitor", icon: CircleDot, label: "Cap Cerâmico" },
    { type: "capacitor_elec", icon: CircleDot, label: "Cap Eletrolítico" },
    { type: "potentiometer", icon: RotateCw, label: "Potenciômetro" },
    { type: "inductor", icon: Activity, label: "Indutor" },
  ];

  const semiconductorItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "diode", icon: ArrowRightToLine, label: "Diodo" },
    { type: "led", icon: Lightbulb, label: "LED" },
    { type: "lamp", icon: Lightbulb, label: "Lâmpada" },
    { type: "transistor", icon: Layers, label: "NPN" },
    { type: "transistor_pnp", icon: Layers, label: "PNP" },
    { type: "mosfet", icon: Layers, label: "MOSFET-N" },
    { type: "mosfet_p", icon: Layers, label: "MOSFET-P" },
  ];

  const icItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "timer555", icon: BoxSelect, label: "555 Timer" },
    { type: "opamp", icon: Play, label: "Amp Op" },
    { type: "logic_and", icon: Waypoints, label: "AND" },
    { type: "logic_or", icon: Waypoints, label: "OR" },
    { type: "logic_nand", icon: Waypoints, label: "NAND" },
    { type: "logic_nor", icon: Waypoints, label: "NOR" },
    { type: "logic_xor", icon: Waypoints, label: "XOR" },
    { type: "ic", icon: BoxSelect, label: "CI Geral" },
  ];

  const powerItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "powersupply", icon: PlugZap, label: "DC" },
    { type: "battery", icon: BatteryIcon, label: "Bateria" },
    { type: "ac_source", icon: Activity, label: "AC" },
    { type: "ground", icon: TriangleAlert, label: "GND" },
  ];

  const instrumentItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "voltmeter", icon: Gauge, label: "Voltímetro" },
    { type: "ammeter", icon: Gauge, label: "Amperímetro" },
    { type: "oscilloscope", icon: AudioWaveform, label: "Osciloscópio" },
  ];

  const mcuItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "arduino_uno", icon: Cpu, label: "Arduino Uno" },
    { type: "esp32", icon: Cpu, label: "ESP32" },
    { type: "esp32_cam", icon: Cpu, label: "ESP32-CAM" },
    { type: "raspberry_pi", icon: Cpu, label: "Raspberry Pi" },
  ];

  const electroItems: { type: ToolType; icon: any; label: string }[] = [
    { type: "switch", icon: ToggleLeft, label: "Pulsador" },
    { type: "buzzer", icon: Volume2, label: "Buzzer" },
    { type: "relay", icon: Ratio, label: "Relé" },
    { type: "oled", icon: Monitor, label: "OLED" },
    { type: "seven_segment", icon: Monitor, label: "7-Seg" },
    { type: "motor", icon: Fan, label: "Motor" },
    { type: "protoboard", icon: Grid, label: "Protoboard" },
    { type: "usb_c", icon: BoxSelect, label: "USB-C" },
    { type: "micro_usb", icon: BoxSelect, label: "Micro-USB" },
  ];

  const pcbToolItems: { type: PcbToolType; icon: any; label: string }[] = [
    { type: "select", icon: MousePointer2, label: "Selecionar" },
    { type: "trace", icon: GitCommitHorizontal, label: "Trilha" },
    { type: "board", icon: SquareChartGantt, label: "Borda" },
    { type: "eraser", icon: Eraser, label: "Lixeira" },
  ];

  const pcbComponentItems: { type: PcbToolType; icon: any; label: string }[] = [
    { type: "pad", icon: CircleDot, label: "Trough Hole" },
    { type: "via", icon: Zap, label: "Via" },
    { type: "dip8", icon: BoxSelect, label: "DIP-8" },
    { type: "smd", icon: BoxSelect, label: "Pad SMD" },
    { type: "sot23", icon: BoxSelect, label: "SOT-23" },
    { type: "to220", icon: BoxSelect, label: "TO-220" },
    { type: "sop", icon: BoxSelect, label: "SOP/SOIC" },
    { type: "qfp", icon: BoxSelect, label: "QFP/LQFP" },
    { type: "bga", icon: BoxSelect, label: "BGA" },
    { type: "pinheader", icon: CircleDot, label: "Pin Header" },
    { type: "usb_c", icon: BoxSelect, label: "USB-C" },
    { type: "micro_usb", icon: BoxSelect, label: "Micro-USB" },
    { type: "cr2032", icon: CircleDot, label: "CR2032" },
    { type: "ldr_smd", icon: BoxSelect, label: "LDR SMD" },
    { type: "ntc_smd", icon: BoxSelect, label: "NTC SMD" },
    { type: "crystal", icon: BoxSelect, label: "Cristal" },
    { type: "copper_pour", icon: BoxSelect, label: "Polígono" },
    { type: "fiducial", icon: CircleDot, label: "Fiducial" },
    { type: "mounting_hole", icon: CircleDot, label: "Montagem" },
    { type: "test_point", icon: CircleDot, label: "Test Point" },
  ];

  const allSchematicComponents = [
    ...passiveItems,
    ...semiconductorItems,
    ...icItems,
    ...powerItems,
    ...mcuItems,
    ...electroItems,
    ...instrumentItems,
  ];

  const realPartsCatalog: { type: ToolType; icon: any; label: string }[] = [
    { type: "diode", icon: Zap, label: "1N4148 (Fast Diode)" },
    { type: "diode", icon: Zap, label: "1N4007 (Rectifier)" },
    { type: "led", icon: Lightbulb, label: "CREE LED (Alta Potência)" },
    { type: "opamp", icon: Cpu, label: "LM358 (Dual OpAmp)" },
    { type: "timer555", icon: Cpu, label: "NE555 (Timer)" },
    { type: "logic_and", icon: Cpu, label: "74HC08 (Quad AND)" },
    { type: "logic_or", icon: Cpu, label: "74HC32 (Quad OR)" },
  ];

  const matchSearch = (lbl: string) =>
    lbl.toLowerCase().includes(search.toLowerCase());

  const filteredSchematic = search
    ? (allSchematicComponents.filter((i) =>
        matchSearch(i.label),
      ) as typeof allSchematicComponents)
    : [];
  const filteredPcb = search
    ? (pcbComponentItems.filter((i) =>
        matchSearch(i.label),
      ) as typeof pcbComponentItems)
    : [];

  const renderGridButton = (item: any, isPcb = false) => {
    const isSelected = isPcb ? pcbTool === item.type : tool === item.type;
    const onClick = () => (isPcb ? setPcbTool(item.type) : setTool(item.type));

    return (
      <button
        key={`${item.type}-${item.label}`}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-md text-[10px] transition-all border border-transparent h-[60px]",
          isSelected
            ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]"
            : "bg-[#16161a] border-[#2d2d33] text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200 hover:border-gray-600",
        )}
      >
        <item.icon
          className={cn(
            "w-5 h-5 mb-1.5 shrink-0 transition-opacity",
            isSelected ? "opacity-100 text-blue-400" : "opacity-70",
          )}
        />
        <span className="truncate w-full text-center leading-tight">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="w-56 lg:w-64 h-full shrink-0 bg-[#121215] border-r border-[#2d2d33] flex flex-col pt-0 shadow-2xl md:shadow-none z-20">
      <div className="p-3 bg-[#16161a] border-b border-[#2d2d33] flex-shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={
              mode === "schematic"
                ? "Buscar símbolos..."
                : "Buscar footprints..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f0f13] border border-[#2d2d33] rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        {mode === "schematic" ? (
          <>
            {!search && (
              <div className="p-2 mb-2 bg-[#16161a]">
                <div className="grid grid-cols-3 gap-1">
                  {schematicToolItems.map((item) => (
                    <button
                      key={`${item.type}-${item.label}`}
                      onClick={() => setTool(item.type as any)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-md text-[10px] transition-colors border",
                        tool === item.type
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                          : "bg-[#1f1f24] text-gray-400 border-transparent hover:bg-[#2d2d33] hover:text-gray-200",
                      )}
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4 mb-1" />
                      <span className="truncate w-full text-center">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                {tool === "wire" && (
                  <div className="mt-2 flex space-x-1 justify-center p-1 bg-[#121215] rounded border border-[#2d2d33]">
                    {wireColors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setActiveWireColor(c.value)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-transform",
                          activeWireColor === c.value ? "scale-110 border-white" : "border-transparent"
                        )}
                        style={{ backgroundColor: c.value === '#000000' ? '#333' : c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {search ? (
              <div className="p-2 space-y-1">
                <div className="px-2 mb-2 text-[10px] font-bold text-gray-500 tracking-wider flex items-center justify-between">
                  <span>RESULTADOS</span>
                  <span className="bg-[#2d2d33] px-1.5 py-0.5 rounded text-white">
                    {filteredSchematic.length}
                  </span>
                </div>
                {filteredSchematic.map((item) => (
                  <button
                    key={`${item.type}-${item.label}`}
                    onClick={() => setTool(item.type as any)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded-md text-xs transition-colors",
                      tool === item.type
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : "text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200 border border-transparent",
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3 shrink-0 opacity-70" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <Accordion title="Catálogo de Componentes Reais">
                  {realPartsCatalog.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Bibliotecas Básicas">
                  {passiveItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Semicondutores">
                  {semiconductorItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Fontes / GND" defaultOpen={false}>
                  {powerItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="CIs e Lógica" defaultOpen={false}>
                  {icItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Microcontroladores" defaultOpen={false}>
                  {mcuItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Eletromecânica & I/O" defaultOpen={false}>
                  {electroItems.map((i) => renderGridButton(i))}
                </Accordion>
                <Accordion title="Instrumentação" defaultOpen={false}>
                  {instrumentItems.map((i) => renderGridButton(i))}
                </Accordion>
              </>
            )}
          </>
        ) : (
          <>
            {!search && (
              <div className="p-2 mb-2 bg-[#16161a] border-b border-[#2d2d33]">
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setActivePcbLayer("top")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-1.5 rounded-md text-[10px] font-bold transition-all border",
                      activePcbLayer === "top"
                        ? "bg-red-500/20 text-red-500 border-red-500/50"
                        : "bg-[#1f1f24] text-gray-500 border-transparent hover:bg-red-500/10 hover:text-red-400",
                    )}
                  >
                    <Layers className="w-3.5 h-3.5 mb-1" /> TOP (F.Cu)
                  </button>
                  <button
                    onClick={() => setActivePcbLayer("bottom")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-1.5 rounded-md text-[10px] font-bold transition-all border",
                      activePcbLayer === "bottom"
                        ? "bg-blue-500/20 text-blue-500 border-blue-500/50"
                        : "bg-[#1f1f24] text-gray-500 border-transparent hover:bg-blue-500/10 hover:text-blue-400",
                    )}
                  >
                    <Layers className="w-3.5 h-3.5 mb-1" /> BOT (B.Cu)
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {pcbToolItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.label || index}`}
                      onClick={() => setPcbTool(item.type as any)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-md text-[10px] transition-colors border",
                        pcbTool === item.type
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                          : "bg-[#1f1f24] text-gray-400 border-transparent hover:bg-[#2d2d33] hover:text-gray-200",
                      )}
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {search ? (
              <div className="p-2 space-y-1">
                <div className="px-2 mb-2 text-[10px] font-bold text-gray-500 tracking-wider flex items-center justify-between">
                  <span>RESULTADOS</span>
                  <span className="bg-[#2d2d33] px-1.5 py-0.5 rounded text-white">
                    {filteredPcb.length}
                  </span>
                </div>
                {filteredPcb.map((item, index) => (
                  <button
                    key={`${item.type}-${item.label || index}`}
                    onClick={() => setPcbTool(item.type as any)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded-md text-xs transition-colors",
                      pcbTool === item.type
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : "text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200 border border-transparent",
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3 shrink-0 opacity-70" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <Accordion title="Mecânicos e Pads">
                  {pcbComponentItems
                    .filter((i) =>
                      ["pad", "via", "copper_pour", "fiducial", "mounting_hole", "test_point"].includes(i.type),
                    )
                    .map((i) => renderGridButton(i, true))}
                </Accordion>
                <Accordion title="Standard Footprints">
                  {pcbComponentItems
                    .filter(
                      (i) =>
                        ![
                          "pad",
                          "via",
                          "copper_pour",
                          "usb_c",
                          "micro_usb",
                          "cr2032",
                          "crystal",
                          "ldr_smd",
                          "ntc_smd",
                        ].includes(i.type),
                    )
                    .map((i) => renderGridButton(i, true))}
                </Accordion>
                <Accordion title="Módulos & Outros">
                  {pcbComponentItems
                    .filter((i) =>
                      [
                        "usb_c",
                        "micro_usb",
                        "cr2032",
                        "crystal",
                        "ldr_smd",
                        "ntc_smd",
                      ].includes(i.type),
                    )
                    .map((i) => renderGridButton(i, true))}
                </Accordion>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
