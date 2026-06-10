import React from "react";
import { useEditor } from "../store";
import {
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Undo2,
  Trash2,
  Cpu,
  Grid,
  Menu,
  SlidersHorizontal,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Play,
  Square,
  RotateCw,
  Box,
  GitCommitHorizontal,
} from "lucide-react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { saveProject } from "../services/projects";
import { compileCppToJS } from "../lib/compiler";

export function Toolbar({
  toggleLeft,
  toggleRight,
  onExit,
}: {
  toggleLeft?: () => void;
  toggleRight?: () => void;
  onExit?: () => void;
}) {
  const {
    zoom,
    setZoom,
    elements,
    setElements,
    clearElements,
    mode,
    setMode,
    selectedIds,
    setSelectedIds,
    updateElement,
    pcbElements,
    setPcbElements,
    currentProjectId,
    setCurrentProjectId,
    boardTheme,
    setBoardTheme,
    isSimulating,
    setIsSimulating,
    undo,
    isCodePanelOpen,
    setIsCodePanelOpen,
    is3DView,
    setIs3DView,
    activePcbLayer,
    setActivePcbLayer,
    code,
  } = useEditor();
  const [isSaving, setIsSaving] = React.useState(false);

  const hasMCU = [...elements, ...pcbElements].some(
    (e) =>
      e.type === "component" &&
      ["arduino_uno", "esp32", "esp32_cam", "raspberry_pi"].includes(
        (e as any).componentType,
      ),
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const hasSelection = selectedIds && selectedIds.length > 0;

  const handleRotate = () => {
    if (!selectedIds) return;
    selectedIds.forEach((id) => {
      let el: any = elements.find((e) => e.id === id);
      if (!el) {
        el = pcbElements.find((e) => e.id === id);
      }
      if (el && (el.type === "component" || el.type === "pcb_component")) {
        updateElement(id, { rotation: (el.rotation + 90) % 360 });
      }
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("Faça login para salvar seus projetos na nuvem.");
      return;
    }
    setIsSaving(true);
    try {
      const id = await saveProject(
        auth.currentUser.uid,
        `Projeto ${new Date().toLocaleDateString()}`,
        elements,
        pcbElements,
        currentProjectId || undefined,
      );
      if (!currentProjectId) {
        setCurrentProjectId(id);
      }
      alert("Projeto salvo com sucesso!");
    } catch (error) {
      console.warn("Could not save project:", error);
      alert(
        "Erro ao salvar. Verifique se você tem permissão ou faça login novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-14 shrink-0 bg-[#16161a] border-b border-[#2d2d33] flex items-center justify-between px-2 md:px-4 overflow-x-auto z-10 w-full relative">
      <div className="flex items-center min-w-max space-x-1 md:space-x-2">
        {onExit && (
          <button
            onClick={onExit}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2d2d33] rounded transition mr-1 flex"
            title="Voltar ao Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {toggleLeft && (
          <button
            onClick={toggleLeft}
            className="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-[#2d2d33] rounded transition mr-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          className="flex items-center justify-center shrink-0 mr-2 bg-gradient-to-br from-teal-400 to-teal-600 rounded-md p-1 shadow-inner cursor-pointer w-8 h-8"
          onClick={onExit}
          title="Voltar ao Painel"
        >
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
        <h1 className="hidden md:flex text-lg font-semibold tracking-tight text-white items-center mr-6">
          AllvaTronics{" "}
          <span className="text-gray-500 font-normal ml-2 text-sm border border-[#2d2d33] px-1.5 py-0.5 rounded">
            Pro
          </span>
        </h1>

        <div className="flex border border-[#2d2d33] p-0.5 rounded-lg bg-[#0f0f13] ml-1 md:ml-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => {
              setMode("schematic");
              setSelectedIds([]);
            }}
            className={cn(
              "flex shrink-0 items-center text-xs px-2 md:px-3 py-1.5 rounded-md font-medium transition-colors",
              mode === "schematic"
                ? "bg-[#2d2d33] text-white"
                : "text-gray-400 hover:text-gray-200",
            )}
          >
            <Grid className="w-3.5 h-3.5 sm:mr-2" />{" "}
            <span className="hidden sm:inline">Esquemático</span>
          </button>
          <button
            onClick={() => {
              setMode("pcb");
              setSelectedIds([]);
            }}
            className={cn(
              "flex shrink-0 items-center text-xs px-2 md:px-3 py-1.5 rounded-md font-medium transition-colors",
              mode === "pcb"
                ? "bg-[#2d2d33] text-white"
                : "text-gray-400 hover:text-gray-200",
            )}
          >
            <Cpu className="w-3.5 h-3.5 sm:mr-2" />{" "}
            <span className="hidden sm:inline">Placa PCB</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1 md:space-x-4 min-w-max pl-2">
        {hasMCU && (
          <div className="flex items-center space-x-1 border border-[#2d2d33] rounded-md overflow-hidden mr-1">
            <button
              onClick={() => setIsCodePanelOpen(!isCodePanelOpen)}
              className={cn(
                "flex items-center text-xs md:text-sm px-3 py-1.5 transition font-semibold",
                isCodePanelOpen
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-[#2d2d33] text-gray-300 hover:text-white",
              )}
            >
              <Menu className="w-4 h-4 mr-2" />
              {"C++ Editor"}
            </button>
            {isCodePanelOpen && (
              <button
                onClick={() => {
                  try {
                    const jsCode = compileCppToJS(code);
                    const runCode = new Function(jsCode);
                    runCode();
                    alert(
                      "C++ Compilado com sucesso! Simulação iniciada em background.",
                    );
                  } catch (e: any) {
                    alert("Erro ao compilar: " + e.message);
                  }
                }}
                className="flex items-center text-xs md:text-sm px-3 py-1.5 transition font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                <Cpu className="w-4 h-4 mr-2" />
                {"Compilar"}
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setIs3DView(!is3DView)}
          className={cn(
            "flex items-center text-xs md:text-sm px-3 py-1.5 rounded-md transition font-semibold border",
            is3DView
              ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
              : "bg-[#2d2d33] text-gray-300 border-[#2d2d33] hover:text-white",
          )}
        >
          <Box className="w-4 h-4 mr-2" />
          {"Vista 3D"}
        </button>

        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={cn(
            "flex items-center text-xs md:text-sm px-3 py-1.5 rounded-md transition font-semibold border",
            isSimulating
              ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30",
          )}
        >
          {isSimulating ? (
            <Square className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isSimulating ? "Parar" : "Começar Simulação"}
        </button>

        {mode === "pcb" && (
          <button
            onClick={() =>
              setBoardTheme(boardTheme === "dark" ? "light" : "dark")
            }
            className="flex items-center text-xs md:text-sm text-gray-300 hover:text-white px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
            title="Alternar Cor da Placa"
          >
            {boardTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}{" "}
            <span className="hidden md:inline">Fundo</span>
          </button>
        )}

        {hasSelection && (
          <button
            onClick={handleRotate}
            className="flex items-center text-xs md:text-sm text-blue-400 hover:text-blue-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-blue-500/30"
            title="Rotacionar"
          >
            <RotateCw className="w-4 h-4" />{" "}
            <span className="hidden md:inline">Rotar</span>
          </button>
        )}

        <button
          onClick={undo}
          className="flex items-center text-xs md:text-sm text-gray-300 hover:text-white px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
          title="Desfazer"
        >
          <Undo2 className="w-4 h-4" />{" "}
          <span className="hidden md:inline">Desfazer</span>
        </button>

        <button
          onClick={clearElements}
          className="flex items-center text-xs md:text-sm text-red-500 hover:text-red-400 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
        >
          <Trash2 className="w-4 h-4" />{" "}
          <span className="hidden md:inline">Limpar</span>
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center text-xs md:text-sm text-teal-400 hover:text-teal-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />{" "}
          <span className="hidden md:inline">
            {isSaving ? "Salvando..." : "Salvar"}
          </span>
        </button>

        <button
          onClick={() => {
            const data = JSON.stringify({ elements, pcbElements });
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "allvatronics_project.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center text-xs md:text-sm text-indigo-400 hover:text-indigo-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
          title="Exportar Arquivo"
        >
          <Download className="w-4 h-4" />{" "}
          <span className="hidden md:inline">Exportar</span>
        </button>

        <label
          className="flex items-center text-xs md:text-sm text-orange-400 hover:text-orange-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 cursor-pointer"
          title="Importar Projeto"
        >
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const json = JSON.parse(e.target?.result as string);
                    if (json.elements) {
                      setElements(json.elements);
                      if (json.pcbElements) {
                        setPcbElements(json.pcbElements);
                      }
                    }
                  } catch (err) {
                    alert("Erro ao importar arquivo: formato inválido.");
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
          <GitCommitHorizontal className="w-4 h-4" />{" "}
          <span className="hidden md:inline">Importar</span>
        </label>

        {mode === "schematic" && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("export-to-pcb"))
            }
            className="flex items-center text-xs md:text-sm text-yellow-500 hover:text-yellow-400 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-yellow-500/30"
          >
            <Cpu className="w-4 h-4" />{" "}
            <span className="hidden md:inline">Exportar para PCB</span>
          </button>
        )}

        {mode === "pcb" && (
          <>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("auto-route-pcb"))
              }
              className="flex items-center text-xs md:text-sm text-fuchsia-400 hover:text-fuchsia-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-fuchsia-500/30"
              title="Auto-Router"
            >
              <Cpu className="w-4 h-4" />{" "}
              <span className="hidden md:inline">Auto-Rotas</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("run-drc"))}
              className="flex items-center text-xs md:text-sm text-yellow-500 hover:text-yellow-400 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-yellow-500/30"
              title="Design Rules Check"
            >
              <SlidersHorizontal className="w-4 h-4" />{" "}
              <span className="hidden md:inline">DRC Check</span>
            </button>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("export-gerber"))
              }
              className="flex items-center text-xs md:text-sm text-green-500 hover:text-green-400 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-green-500/30"
              title="Exportar Gerber (Para Fabricação)"
            >
              <Download className="w-4 h-4" />{" "}
              <span className="hidden md:inline">Exportar Gerber</span>
            </button>
          </>
        )}

        {mode === "pcb" && (
          <div className="flex items-center space-x-1 mx-2 border-l border-[#2d2d33] pl-2 hidden sm:flex">
            <span className="text-xs text-gray-500 mr-2 uppercase tracking-wide">
              Trilhas
            </span>
            <button
              onClick={() => setActivePcbLayer("top")}
              className={cn(
                "px-2 py-1 flex items-center text-xs rounded transition-colors",
                activePcbLayer === "top"
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "text-gray-400 hover:text-gray-200 border border-transparent",
              )}
              title="Trilha Superior (Positiva/Vermelha)"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5 shadow-[0_0_8px_#ef4444]"></div>{" "}
              Topo
            </button>
            <button
              onClick={() => setActivePcbLayer("bottom")}
              className={cn(
                "px-2 py-1 flex items-center text-xs rounded transition-colors",
                activePcbLayer === "bottom"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "text-gray-400 hover:text-gray-200 border border-transparent",
              )}
              title="Trilha Inferior (Negativa/Azul)"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 shadow-[0_0_8px_#3b82f6]"></div>{" "}
              Fundo
            </button>
          </div>
        )}

        {mode === "pcb" && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("auto-route-pcb"))
            }
            className="flex items-center text-xs md:text-sm text-blue-400 hover:text-blue-300 px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2 border border-blue-500/30"
          >
            <GitCommitHorizontal className="w-4 h-4" />{" "}
            <span className="hidden md:inline">Auto-Route</span>
          </button>
        )}

        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("export-canvas", { detail: { format: "png" } }),
            )
          }
          className="flex items-center text-xs md:text-sm text-gray-300 hover:text-white px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
          title="Exportar como PNG"
        >
          <Download className="w-4 h-4" />{" "}
          <span className="hidden md:inline">PNG</span>
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("export-canvas", { detail: { format: "pdf" } }),
            )
          }
          className="flex items-center text-xs md:text-sm text-gray-300 hover:text-white px-2 md:px-3 py-1.5 rounded hover:bg-[#2d2d33] transition gap-1 md:gap-2"
          title="Exportar como PDF"
        >
          <Download className="w-4 h-4" />{" "}
          <span className="hidden md:inline">PDF</span>
        </button>

        {toggleRight && (
          <button
            onClick={toggleRight}
            className="md:hidden p-1.5 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded transition ml-1"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
