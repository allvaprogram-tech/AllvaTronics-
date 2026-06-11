import React, { useEffect, useState, useRef, useMemo } from "react";
import { useEditor } from "../store";
import { Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ec4899"];

export function RealTimeOscilloscope() {
  const { isSimulating, elements } = useEditor();
  const [channelsData, setChannelsData] = useState<
    Record<string, { time: number; value: number }[]>
  >({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(false);

  // Filtra os componentes que atuam como osciloscópio ou amperímetro
  const oscComponents = useMemo(() => {
    return elements.filter(
      (el) =>
        el.type === "component" && 
        ((el as any).componentType === "oscilloscope" || (el as any).componentType === "ammeter"),
    );
  }, [elements]);

  // Efeito principal de varredura dos dados (polling a cada 50ms)
  useEffect(() => {
    if (closed || !isSimulating || oscComponents.length === 0) {
      setChannelsData((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const intervalId = setInterval(() => {
      const readings = (window as any)._circuitReadings || {};

      setChannelsData((prev) => {
        const now = Date.now();
        const nextData: Record<string, { time: number; value: number }[]> = {};

        oscComponents.forEach((osc) => {
          const readingStr = readings[osc.id] || "0V";
          // Extrai apenas números, pontos e sinais negativos da string (ex: "12.5V" -> 12.5)
          const val = parseFloat(readingStr.replace(/[^\d.-]/g, ""));
          
          const existing = prev[osc.id] || [];
          // Janela de memória de 3 segundos (3000ms) para renderização do histórico
          const filtered = existing.filter((p) => now - p.time < 3000); 
          
          nextData[osc.id] = [
            ...filtered,
            { time: now, value: isNaN(val) ? 0 : val },
          ];
        });

        return nextData;
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, [isSimulating, oscComponents, closed]);

  // Reseta o estado de fechado caso novos componentes entrem na simulação ativa
  useEffect(() => {
    if (oscComponents.length > 0 && closed && isSimulating) setClosed(false);
  }, [oscComponents.length, isSimulating, closed]);

  if (closed || oscComponents.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-6 right-6 md:left-auto md:right-6 z-50 bg-[#16161a] border border-[#2d2d33] rounded-lg shadow-2xl overflow-hidden w-[520px] h-[360px] flex flex-col pointer-events-auto"
      >
        {/* Cabeçalho e Painel de Medições */}
        <div className="min-h-14 py-2 border-b border-[#2d2d33] flex items-center px-3 bg-[#111] shrink-0 justify-between">
          <div className="flex items-center">
            <Activity className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-xs font-semibold text-gray-300">
              Osciloscópio ({oscComponents.length} CH)
            </span>
          </div>
          
          <div className="flex items-center gap-4 pr-2 overflow-x-auto max-w-[75%] scrollbar-none">
            {oscComponents.map((osc, idx) => {
              const dataPoints = channelsData[osc.id] || [];
              const latest = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0;
              const values = dataPoints.map(p => p.value);
              
              const max = values.length > 0 ? Math.max(...values) : 0;
              const min = values.length > 0 ? Math.min(...values) : 0;
              const vpp = max - min;
              
              const isAmmeter = (osc as any).componentType === "ammeter";
              const unit = isAmmeter ? "A" : "V";
              const threshold = isAmmeter ? 0.002 : 0.1; // Margem de ruído adaptada para corrente/tensão

              // Lógica corrigida: se houver variação perceptível, há componente AC ativa
              const isAC = vpp > threshold;
              
              // Cálculo de Offset DC (Média do sinal) e do valor RMS (Eficaz para senoides)
              const dcOffset = values.reduce((sum, val) => sum + val, 0) / (values.length || 1);
              const vrms = vpp / (2 * Math.sqrt(2));

              return (
                <div 
                  key={osc.id} 
                  style={{ borderColor: `${COLORS[idx % COLORS.length]}33` }}
                  className="flex flex-col items-end leading-tight bg-black/40 px-2.5 py-1 rounded border text-right min-w-[110px]"
                >
                  <span style={{ color: COLORS[idx % COLORS.length] }} className="font-bold text-[10px] uppercase tracking-wider">
                    CH{idx + 1}
                  </span>
                  
                  <span className="text-gray-100 font-mono text-[11px] font-semibold whitespace-nowrap">
                    {isAC 
                      ? `${vrms.toFixed(2)}${unit} RMS` 
                      : `DC ${latest.toFixed(2)}${unit}`
                    }
                  </span>
                  
                  {isAC && (
                    <span className="text-[9px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                      Vpp: {vpp.toFixed(1)} | Off: {dcOffset.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
            
            <button
              onClick={() => setClosed(true)}
              className="ml-1 text-gray-500 hover:text-white transition bg-gray-800 hover:bg-gray-700 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tela Gráfica (Grid e Formas de Onda) */}
        <div className="flex-1 relative p-2" ref={containerRef}>
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Definição do Grid de fundo */}
            <defs>
              <pattern
                id="osc-grid"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 25 0 L 0 0 0 25"
                  fill="none"
                  stroke="#232329"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#osc-grid)" />

            {/* Linha Central de Referência (0V / 0A) */}
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#44444b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            
            {/* Escala Dinâmica de Textos na Tela baseada no primeiro canal */}
            {(() => {
              const firstOsc = oscComponents[0];
              const scale = firstOsc ? (firstOsc as any).customProps?.scale || ((firstOsc as any).componentType === "ammeter" ? 5 : 20) : 20;
              return (
                <>
                  <text x="5" y="12" fill="#666" fontSize="9" fontFamily="monospace">+{scale}</text>
                  <text x="5" y="48%" fill="#666" fontSize="9" fontFamily="monospace">+{scale/2}</text>
                  <text x="5" y="55%" fill="#666" fontSize="9" fontFamily="monospace">0</text>
                  <text x="5" y="98%" fill="#666" fontSize="9" fontFamily="monospace">-{scale}</text>
                </>
              );
            })()}

            {/* Renderização das Linhas de Sinais */}
            {oscComponents.map((osc, idx) => {
              const dataPoints = channelsData[osc.id] || [];
              if (dataPoints.length < 2) return null;

              const now = Date.now();
              const maxTime = 3000; // Janela correspondente ao filtro (3 segundos)
              const w = containerRef.current?.offsetWidth || 500;
              const h = containerRef.current?.offsetHeight || 280;

              const defaultScale = (osc as any).componentType === "ammeter" ? 5 : 20;
              const scaleFactor = (osc as any).customProps?.scale || defaultScale;
              
              // Mapeamento matemático das coordenadas cartesianas para o viewBox SVG
              const mapY = (v: number) => h / 2 - (v / scaleFactor) * (h / 2);
              const mapX = (t: number) => w - ((now - t) / maxTime) * w;

              const d = dataPoints
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${mapX(p.time)} ${mapY(p.value)}`,
                )
                .join(" ");
              const color = COLORS[idx % COLORS.length];

              return (
                <path
                  key={osc.id}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0px 0px 3px ${color}aa)` }} // Efeito de fósforo/neon realista
                />
              );
            })}
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
