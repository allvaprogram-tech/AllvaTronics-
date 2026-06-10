import React, { useState } from "react";
import {
  Calculator,
  BookOpen,
  Layers,
  Cpu,
  Code,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { ResistorCalculator } from "./ResistorCalculator";
import { ProjectManager } from "./ProjectManager";

export function Dashboard({ onLaunchEditor }: { onLaunchEditor: () => void }) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "home" | "components" | "pcb" | "projects"
  >("projects");

  return (
    <div className="h-[100dvh] w-full bg-[#0f0f13] flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-[#16161a] border-b md:border-b-0 md:border-r border-[#2d2d33] flex flex-col pt-2 md:pt-6 shrink-0 z-20 shadow-xl md:shadow-none relative">
        <div className="px-3 md:px-6 mb-2 md:mb-8 flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <div className="w-5 h-5 md:w-8 md:h-8 rounded-md flex items-center justify-center shadow-lg mr-2 md:mr-3 bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-500/20 p-[1px] md:p-1">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-white"
                fill="currentColor"
              >
                <path
                  d="M 50 25 L 75 70"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 37.5 47.5 L 75 70"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="25" r="12" />
                <circle cx="75" cy="70" r="12" />
                <circle cx="25" cy="70" r="12" />
                <circle cx="37.5" cy="47.5" r="6" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight text-sm md:text-base hidden sm:inline">
              Hub de Estudo
            </span>
          </div>
          <button
            onClick={() => {
              import("../firebase").then(({ auth }) => {
                import("firebase/auth").then(({ signOut }) => {
                  signOut(auth).then(() => window.location.reload());
                });
              });
            }}
            className="flex items-center text-gray-400 hover:text-red-400 p-2 rounded hover:bg-[#2d2d33] transition-colors"
            title="Terminar Sessão"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex px-2 md:px-4 pb-2 md:pb-0 gap-1 md:gap-0 md:space-y-2 overflow-x-auto md:flex-col md:overflow-visible shrink-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-shrink-0 md:w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors ${activeTab === "projects" ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:text-white hover:bg-[#2d2d33]"}`}
          >
            <Layers className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 shrink-0" />
            <span className="font-medium text-xs md:text-sm whitespace-nowrap">
              Projetos
            </span>
          </button>

          <button
            onClick={() => setActiveTab("home")}
            className={`flex-shrink-0 md:w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors ${activeTab === "home" ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:text-white hover:bg-[#2d2d33]"}`}
          >
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 shrink-0" />
            <span className="font-medium text-xs md:text-sm whitespace-nowrap">
              Resistores
            </span>
          </button>

          <button
            onClick={() => setActiveTab("components")}
            className={`flex-shrink-0 md:w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors ${activeTab === "components" ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:text-white hover:bg-[#2d2d33]"}`}
          >
            <Cpu className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 shrink-0" />
            <span className="font-medium text-xs md:text-sm whitespace-nowrap">
              Biblioteca
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pcb")}
            className={`flex-shrink-0 md:w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors ${activeTab === "pcb" ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:text-white hover:bg-[#2d2d33]"}`}
          >
            <Layers className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 shrink-0" />
            <span className="font-medium text-xs md:text-sm whitespace-nowrap">
              PCB
            </span>
          </button>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex-shrink-0 md:w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d2d33] transition-colors relative"
          >
            <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 shrink-0" />
            <span className="font-medium text-xs md:text-sm whitespace-nowrap">
              Calculadora
            </span>
            {showCalculator && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full" />
            )}
          </button>
        </nav>

        <div className="hidden md:block p-4 border-t border-[#2d2d33] mt-auto">
          <button
            onClick={onLaunchEditor}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center py-3 text-base rounded-lg font-medium transition shadow-lg shadow-teal-500/20"
          >
            <Layers className="w-5 h-5 mr-2 shrink-0" />
            Abrir Editor
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-6 relative scroll-smooth">
        {activeTab === "projects" && (
          <ProjectManager onLaunchEditor={onLaunchEditor} />
        )}
        {activeTab === "home" && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-white mb-1">
              Código de Cores de Resistores
            </h1>
            <p className="text-xs text-gray-400 mb-4">
              Aprenda a decifrar a resistência usando as faixas coloridas.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
              <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 shadow-lg">
                <h2 className="text-sm font-semibold text-white mb-1">
                  Como Ler as Faixas
                </h2>
                <div className="space-y-2 text-xs text-gray-300">
                  <p>
                    <strong>Resistores de 4 Faixas:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>1ª Faixa: Primeiro dígito da resistência</li>
                    <li>2ª Faixa: Segundo dígito</li>
                    <li>3ª Faixa: Multiplicador (número de zeros)</li>
                    <li>4ª Faixa: Tolerância (%)</li>
                  </ul>
                  <p>
                    A resistência pode ser calculada com nossa ferramenta de
                    calculadora clicando no menu lateral esquerdo.
                  </p>
                </div>
              </div>

              <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 flex items-center justify-center shadow-lg">
                {/* Visual Resistor Example */}
                <div className="flex flex-col items-center">
                  <div className="w-40 h-8 bg-[#eee4d6] rounded-lg flex items-center justify-between px-3 shadow-inner border border-[#d6cfc5] mb-2 relative overflow-hidden isolate">
                    <div className="absolute h-1 w-full bg-gray-400 top-1/2 -mt-[2px] z-0 left-0" />
                    <div
                      className="w-3 h-full bg-[#8B4513] rounded-sm relative z-10"
                      title="Marrom (1)"
                    />
                    <div
                      className="w-3 h-full bg-[#000000] rounded-sm relative z-10"
                      title="Preto (0)"
                    />
                    <div
                      className="w-3 h-full bg-[#FF0000] rounded-sm relative z-10"
                      title="Vermelho (x100)"
                    />
                    <div className="flex-1" />
                    <div
                      className="w-3 h-full bg-[#FFD700] rounded-sm relative z-10"
                      title="Dourado (±5%)"
                    />
                  </div>
                  <div className="text-teal-400 font-mono text-sm font-bold">
                    1000 Ω (1kΩ)
                  </div>
                  <div className="text-gray-500 text-[9px] font-mono">
                    Tolerância ±5%
                  </div>
                </div>
              </div>
            </div>

            {/* Color Table */}
            <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg shadow-lg max-h-[45vh] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-[#2d2d33]">
              <table className="w-full text-left text-xs text-gray-300 min-w-[500px]">
                <thead className="bg-[#0f0f13] border-b border-[#2d2d33] text-gray-400 uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Cor</th>
                    <th className="px-4 py-2 font-semibold">Dígito</th>
                    <th className="px-4 py-2 font-semibold">Multiplicador</th>
                    <th className="px-4 py-2 font-semibold">Tolerância</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d33]">
                  {[
                    {
                      name: "Preto",
                      dig: 0,
                      mult: "x1",
                      tol: "-",
                      bg: "#000",
                      text: "#fff",
                    },
                    {
                      name: "Marrom",
                      dig: 1,
                      mult: "x10",
                      tol: "±1%",
                      bg: "#8B4513",
                      text: "#fff",
                    },
                    {
                      name: "Vermelho",
                      dig: 2,
                      mult: "x100",
                      tol: "±2%",
                      bg: "#FF0000",
                      text: "#fff",
                    },
                    {
                      name: "Laranja",
                      dig: 3,
                      mult: "x1k",
                      tol: "-",
                      bg: "#FFA500",
                      text: "#000",
                    },
                    {
                      name: "Amarelo",
                      dig: 4,
                      mult: "x10k",
                      tol: "-",
                      bg: "#FFFF00",
                      text: "#000",
                    },
                    {
                      name: "Verde",
                      dig: 5,
                      mult: "x100k",
                      tol: "±0.5%",
                      bg: "#008000",
                      text: "#fff",
                    },
                    {
                      name: "Azul",
                      dig: 6,
                      mult: "x1M",
                      tol: "±0.25%",
                      bg: "#0000FF",
                      text: "#fff",
                    },
                    {
                      name: "Violeta",
                      dig: 7,
                      mult: "x10M",
                      tol: "±0.1%",
                      bg: "#EE82EE",
                      text: "#000",
                    },
                    {
                      name: "Cinza",
                      dig: 8,
                      mult: "x100M",
                      tol: "±0.05%",
                      bg: "#808080",
                      text: "#fff",
                    },
                    {
                      name: "Branco",
                      dig: 9,
                      mult: "x1G",
                      tol: "-",
                      bg: "#FFFFFF",
                      text: "#000",
                    },
                    {
                      name: "Dourado",
                      dig: "-",
                      mult: "x0.1",
                      tol: "±5%",
                      bg: "#FFD700",
                      text: "#000",
                    },
                    {
                      name: "Prateado",
                      dig: "-",
                      mult: "x0.01",
                      tol: "±10%",
                      bg: "#C0C0C0",
                      text: "#000",
                    },
                  ].map((color) => (
                    <tr
                      key={color.name}
                      className="hover:bg-[#2d2d33] transition-colors"
                    >
                      <td className="px-4 py-1.5">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: color.bg,
                            color: color.text,
                          }}
                        >
                          {color.name}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 font-mono">{color.dig}</td>
                      <td className="px-4 py-1.5 font-mono">{color.mult}</td>
                      <td className="px-4 py-1.5 font-mono">{color.tol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "components" && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-white mb-1">
              Biblioteca de Componentes
            </h1>
            <p className="text-xs text-gray-400 mb-4">
              Informações resumidas dos componentes suportados na aplicação.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[
                {
                  name: "Arduino Uno",
                  type: "Microcontrolador",
                  desc: "Placa baseada no chip ATmega328P. Ideal para prototipagem.",
                  spec1: "Voltagem: 5V",
                  spec2: "Pinos: 14 Dig / 6 Ana",
                },
                {
                  name: "ESP32",
                  type: "Microcontrolador WiFi/BT",
                  desc: "Chip de rede e dual-core.",
                  spec1: "Voltagem: 3.3V",
                  spec2: "Frequência: 160-240 MHz",
                },
                {
                  name: "Raspberry Pi",
                  type: "SBC",
                  desc: "Mini computador completo (Linux).",
                  spec1: "Voltagem: 5V",
                  spec2: "GPIO: 40 pinos",
                },
                {
                  name: "Led",
                  type: "Componente Ativo / Opto",
                  desc: "Diodo Emissor de Luz.",
                  spec1: "Corrente máx: 20mA",
                  spec2: "Queda de tensão: 1.8-3.3V",
                },
                {
                  name: "Capacitor",
                  type: "Componente Passivo",
                  desc: "Armazena energia em campo elétrico.",
                  spec1: "Unidade: Farads (F)",
                  spec2: "Tipos: Cerâmico, Filme",
                },
                {
                  name: "Capacitor Eletrolítico",
                  type: "Componente Passivo",
                  desc: "Capacitor polarizado de grande valor.",
                  spec1: "Possui polaridade",
                  spec2: "Alta capacitância",
                },
                {
                  name: "Resistor",
                  type: "Componente Passivo",
                  desc: "Limita o fluxo de corrente (Lei de Ohm).",
                  spec1: "Unidade: Ohms (Ω)",
                  spec2: "Potência Típica: 1/4W",
                },
                {
                  name: "Indutor",
                  type: "Componente Passivo",
                  desc: "Armazena energia em campo magnético.",
                  spec1: "Unidade: Henrys (H)",
                  spec2: "Reativo a corrente alternada",
                },
                {
                  name: "Diodo",
                  type: "Semicondutor",
                  desc: "Permite corrente em única direção.",
                  spec1: "V de bloqueio",
                  spec2: "Queda silício: 0.7V",
                },
                {
                  name: "Transistor NPN",
                  type: "Semicondutor/BJT",
                  desc: "Amplificador / Chave controlada por corrente base.",
                  spec1: "Polaridade: NPN",
                  spec2: "Conduz quando Vb > Ve",
                },
                {
                  name: "Transistor PNP",
                  type: "Semicondutor/BJT",
                  desc: "Semelhante ao NPN, ativado com tensão invertida na base.",
                  spec1: "Polaridade: PNP",
                  spec2: "Conduz quando Ve > Vb",
                },
                {
                  name: "MOSFET Canal N",
                  type: "Semicondutor",
                  desc: "Chave controlada por tensão no gate.",
                  spec1: "Canal: N",
                  spec2: "Alta impedância de entrada",
                },
                {
                  name: "MOSFET Canal P",
                  type: "Semicondutor",
                  desc: "Chave controlada por tensão, inverso do N.",
                  spec1: "Canal: P",
                  spec2: "Liga com Gate em GND",
                },
                {
                  name: "Timer 555",
                  type: "Circuito Integrado",
                  desc: "Usado para osciladores e timers.",
                  spec1: "Modos: Astável, Mono",
                  spec2: "Faixa de tensão: 4.5V-15V",
                },
                {
                  name: "Amplificador Op (OpAmp)",
                  type: "Circuito Integrado",
                  desc: "Amplificador diferencial de alta impedância.",
                  spec1: "Ganho ideal: Infinito",
                  spec2: "Pinos: Inversor / Não-Inv",
                },
                {
                  name: "Portas Lógicas",
                  type: "Circuito Integrado",
                  desc: "Realiza álgebra booleana (AND, OR, NAND, XOR).",
                  spec1: "Tensão: 3.3V/5V (TTL/CMOS)",
                  spec2: "Base dos computadores",
                },
                {
                  name: "Relé",
                  type: "Eletromecânico",
                  desc: "Chave mecânica operada por eletroímã.",
                  spec1: "Isolamento galvânico",
                  spec2: "Comuta altas correntes",
                },
                {
                  name: "Bateria",
                  type: "Fonte de Energia",
                  desc: "Fonte DC independente.",
                  spec1: "Fornece energia DC",
                  spec2: "Voltagem fixa",
                },
                {
                  name: "Fonte AC",
                  type: "Fonte de Energia",
                  desc: "Tensões alternadas como tomada residencial.",
                  spec1: "Amplitude",
                  spec2: "Frequência (Hz)",
                },
                {
                  name: "Osciloscópio / Medidor",
                  type: "Instrumento",
                  desc: "Mede o sinal ou estado de um nó.",
                  spec1: "Gera gráfico no tempo",
                  spec2: "Mede Amplitude/Frequência",
                },
                {
                  name: "Buzzer",
                  type: "Atuador Sonora",
                  desc: "Emite som a uma frequência.",
                  spec1: "Tipos: Ativo / Passivo",
                  spec2: "Frequência em Hz",
                },
                {
                  name: "Potenciômetro",
                  type: "Componente Passivo",
                  desc: "Resistor variável",
                  spec1: "Ajuste mecânico",
                  spec2: "Ideal p/ divisores tensão",
                },
                {
                  name: "Motor DC",
                  type: "Atuador",
                  desc: "Gera energia mecânica.",
                  spec1: "RPM",
                  spec2: "Consumo de corrente alto",
                },
              ].map((c) => (
                <ComponentCard key={c.name} {...c} />
              ))}
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Code className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-md font-bold text-white mb-1">
                Pronto para criar?
              </h3>
              <p className="text-blue-200 text-xs mb-4 max-w-md">
                No editor você poderá arrastar componentes e conectá-los.
              </p>
              <button
                onClick={onLaunchEditor}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center"
              >
                Acessar Banco <ArrowRight className="w-3 h-3 ml-2" />
              </button>
            </div>
          </div>
        )}
        {activeTab === "pcb" && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-white mb-1">Placas & PCB</h1>
            <p className="text-xs text-gray-400 mb-4">
              Conceitos fundamentais sobre fabricação de placas de circuito
              impresso (PCB).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 shadow-lg">
                <h3 className="text-sm font-bold text-teal-400 mb-1">
                  Protoboard
                </h3>
                <p className="text-gray-300 text-[10px] mb-2 leading-relaxed">
                  Usada para prototipagem rápida. Furos internamente conectados,
                  permitindo montar sem solda.
                </p>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Vant: Reutilizável.
                </div>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Desvant: Mal contato.
                </div>
              </div>

              <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 shadow-lg">
                <h3 className="text-sm font-bold text-teal-400 mb-1">
                  PCB Rígida
                </h3>
                <p className="text-gray-300 text-[10px] mb-2 leading-relaxed">
                  Suporta e conecta componentes eletrônicos através de trilhas
                  condutoras de cobre.
                </p>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Substrato: FR-4.
                </div>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Trilhas: Cobre (Cu).
                </div>
              </div>

              <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 shadow-lg">
                <h3 className="text-sm font-bold text-teal-400 mb-1">
                  PCB Flexível
                </h3>
                <p className="text-gray-300 text-[10px] mb-2 leading-relaxed">
                  Circuitos montados em plástico flexível (poliimida) permitindo
                  ser dobrado.
                </p>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Uso: Espaços apertados.
                </div>
                <div className="text-[9px] text-gray-500 font-mono">
                  - Durável e leve.
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-white mb-3">
              Camadas de uma PCB (Layers)
            </h2>
            <div className="bg-[#16161a] border border-[#2d2d33] rounded-xl overflow-hidden shadow-xl mb-6">
              <ul className="divide-y divide-[#2d2d33] text-xs">
                <li className="p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-3 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <div>
                    <div className="font-bold text-white">
                      Top Layer (Superior)
                    </div>
                    <div className="text-gray-400">
                      Camada de cobre na parte superior, trilhas vermelhas no
                      editor.
                    </div>
                  </div>
                </li>
                <li className="p-3 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <div>
                    <div className="font-bold text-white">
                      Bottom Layer (Inferior)
                    </div>
                    <div className="text-gray-400">
                      Camada de cobre na base. Trilhas azuis no editor.
                    </div>
                  </div>
                </li>
                <li className="p-3 flex items-center">
                  <div className="flex mr-3 shrink-0 items-center justify-center relative w-3 h-3">
                    <div className="w-3 h-3 rounded-full border-2 border-yellow-500 absolute"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 absolute"></div>
                  </div>
                  <div>
                    <div className="font-bold text-white">Pads e Vias</div>
                    <div className="text-gray-400">
                      Pads: pontos para soldar. Vias: furos metalizados que
                      conectam camadas.
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Layers className="w-6 h-6 text-teal-400 mb-2" />
              <h3 className="text-md font-bold text-white mb-1">
                Simulação de PCB
              </h3>
              <p className="text-teal-200 text-xs mb-4 max-w-md">
                Use o menu "Placa PCB" no painel superior para começar a rotear.
              </p>
              <button
                onClick={onLaunchEditor}
                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center"
              >
                Abrir Editor PCB <ArrowRight className="w-3 h-3 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCalculator && (
        <ResistorCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <button
          onClick={onLaunchEditor}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center py-3 text-sm rounded-xl font-bold shadow-[0_4px_20px_rgba(20,184,166,0.4)] border border-teal-400/20 active:scale-95 transition-all"
        >
          <Layers className="w-5 h-5 mr-2 shrink-0" />
          ABRIR EDITOR DE CIRCUITOS
        </button>
      </div>
    </div>
  );
}

function ComponentCard({ name, type, desc, spec1, spec2 }: any) {
  return (
    <div className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-3 hover:border-teal-500/50 transition duration-300 shadow-lg">
      <div className="flex flex-col mb-1">
        <h3 className="text-sm font-bold text-teal-400">{name}</h3>
        <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500 bg-[#0f0f13] px-1.5 py-0.5 mt-1 self-start rounded border border-[#2d2d33]">
          {type}
        </span>
      </div>
      <p className="text-[10px] text-gray-300 mb-2 line-clamp-2 leading-snug">
        {desc}
      </p>
      <div className="space-y-0.5 border-t border-[#2d2d33]/50 pt-2">
        <div className="flex items-center text-[9px] text-gray-400 font-mono">
          <span className="w-1 h-1 rounded-full bg-gray-500 mr-1.5"></span>
          {spec1}
        </div>
        <div className="flex items-center text-[9px] text-gray-400 font-mono">
          <span className="w-1 h-1 rounded-full bg-gray-500 mr-1.5"></span>
          {spec2}
        </div>
      </div>
    </div>
  );
}
