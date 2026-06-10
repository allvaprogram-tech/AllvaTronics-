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

  const oscComponents = useMemo(() => {
    return elements.filter(
      (el) =>
        el.type === "component" && ((el as any).componentType === "oscilloscope" || (el as any).componentType === "ammeter"),
    );
  }, [elements]);

  useEffect(() => {
    if (closed || !isSimulating || oscComponents.length === 0) {
      setChannelsData((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    let intervalId = setInterval(() => {
      const readings = (window as any)._circuitReadings || {};

      setChannelsData((prev) => {
        const now = Date.now();
        const nextData: Record<string, { time: number; value: number }[]> = {};

        oscComponents.forEach((osc) => {
          const readingStr = readings[osc.id] || "0V";
          const val = parseFloat(readingStr.replace(/[^\d.-]/g, ""));
          const existing = prev[osc.id] || [];
          const filtered = existing.filter((p) => now - p.time < 3000); // 3 seconds window
          nextData[osc.id] = [
            ...filtered,
            { time: now, value: isNaN(val) ? 0 : val },
          ];
        });

        return nextData;
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, [isSimulating, oscComponents]);

  useEffect(() => {
    if (oscComponents.length > 0 && closed && isSimulating) setClosed(false);
  }, [oscComponents.length, isSimulating]);

  if (closed || oscComponents.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-6 right-6 md:left-auto md:right-6 z-50 bg-[#16161a] border border-[#2d2d33] rounded-lg shadow-2xl overflow-hidden w-[500px] h-[350px] flex flex-col pointer-events-auto"
      >
        <div className="min-h-12 py-2 border-b border-[#2d2d33] flex items-center px-3 bg-[#111] shrink-0 justify-between">
          <div className="flex items-center">
            <Activity className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-xs font-semibold text-gray-300">
              Osciloscópio ({oscComponents.length} Canais)
            </span>
          </div>
          <div className="flex items-center gap-6 pr-4">
            {oscComponents.map((osc, idx) => {
              const dataPoints = channelsData[osc.id] || [];
              const latest = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0;
              const values = dataPoints.map(p => p.value);
              const max = values.length > 0 ? Math.max(...values) : 0;
              const min = values.length > 0 ? Math.min(...values) : 0;
              const vpp = max - min;
              const isAmmeter = (osc as any).componentType === "ammeter";
              const unit = isAmmeter ? "A" : "V";
              const threshold = isAmmeter ? 0.001 : 0.1;
              const isAC = vpp > threshold && max > 0 && min < 0;

              return (
              <span key={osc.id} style={{ color: COLORS[idx % COLORS.length] }} className="flex flex-col items-end leading-tight tracking-wider bg-black/40 px-3 py-1 bg-opacity-50 rounded border border-white/5">
                <span className="font-bold text-xs uppercase tracking-wide">CH{idx + 1}</span>
                <span className="text-gray-100 font-mono text-xs whitespace-nowrap">
                  {isAC 
                    ? `Amp: ${(vpp/2).toFixed(1)}${unit} | pp: ${vpp.toFixed(1)}${unit}` 
                    : `DC ${latest.toFixed(2)}${unit}`
                  }
                </span>
                {isAC && (
                  <span className="text-xs font-mono text-gray-400 mt-0.5">
                    Max: {max.toFixed(1)} Min: {min.toFixed(1)}
                  </span>
                )}
              </span>
            )})}
            <button
              onClick={() => setClosed(true)}
              className="ml-2 text-gray-500 hover:text-white transition bg-gray-800 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative p-2" ref={containerRef}>
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 25 0 L 0 0 0 25"
                  fill="none"
                  stroke="#2d2d33"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Center Line (0V) */}
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#555"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {(() => {
              const firstOsc = oscComponents[0];
              const scale = firstOsc ? (firstOsc as any).customProps?.scale || ((firstOsc as any).componentType === "ammeter" ? 5 : 20) : 20;
              return (
                <>
                  <text x="5" y="10" fill="#555" fontSize="10" fontFamily="monospace">+{scale}</text>
                  <text x="5" y="47%" fill="#555" fontSize="10" fontFamily="monospace">+{scale/2}</text>
                  <text x="5" y="52%" fill="#555" fontSize="10" fontFamily="monospace">0</text>
                  <text x="5" y="95%" fill="#555" fontSize="10" fontFamily="monospace">-{scale}</text>
                </>
              );
            })()}

            {/* Data Lines */}
            {oscComponents.map((osc, idx) => {
              const dataPoints = channelsData[osc.id] || [];
              if (dataPoints.length < 2) return null;

              const now = Date.now();
              const maxTime = 3000;
              const w = containerRef.current?.offsetWidth || 300;
              const h = containerRef.current?.offsetHeight || 150;

              // Map values. Range maps to 0 to H based on customProps.scale
              const defaultScale = (osc as any).componentType === "ammeter" ? 5 : 20;
              const scaleFactor = (osc as any).customProps?.scale || defaultScale;
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
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0px 0px 3px ${color}80)` }} // Glowing effect
                />
              );
            })}
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
