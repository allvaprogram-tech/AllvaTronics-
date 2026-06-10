import React, { useEffect, useState } from "react";
import { getProjects, deleteProject, ProjectData } from "../services/projects";
import { auth } from "../firebase";
import { useEditor } from "../store";
import { Trash2, Edit, Layers, Plus } from "lucide-react";

export function ProjectManager({
  onLaunchEditor,
}: {
  onLaunchEditor: () => void;
}) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { setElements, setPcbElements, setCurrentProjectId } = useEditor();

  const fetchProjects = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    try {
      const data = await getProjects(auth.currentUser.uid);
      setProjects(data);
    } catch (error: any) {
      console.warn("Could not fetch projects:", error);
      setErrorMsg("Erro ao buscar projetos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenProject = (project: ProjectData) => {
    try {
      setElements(JSON.parse(project.elements));
      setPcbElements(JSON.parse(project.pcbElements));
      setCurrentProjectId(project.id!);
      onLaunchEditor();
    } catch (e) {
      console.error("Failed to parse project data", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este projeto?")) {
      try {
        await deleteProject(id);
        setProjects((p) => p.filter((x) => x.id !== id));
      } catch (e) {
        console.warn("Could not delete project:", e);
        setErrorMsg("Erro ao excluir projeto: " + (e as Error).message);
      }
    }
  };

  const handleNewProject = () => {
    setElements([]);
    setPcbElements([]);
    setCurrentProjectId(null);
    onLaunchEditor();
  };

  if (loading) {
    return <div className="text-gray-400">Carregando projetos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Projetos</h1>
          <p className="text-gray-400">
            Gerencie seus arquivos de esquemático e PCB.
          </p>
        </div>
        <button
          onClick={handleNewProject}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Projeto
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-[#16161a] border border-[#2d2d33] rounded-xl p-12 text-center shadow-xl">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum projeto</h3>
          <p className="text-gray-400 mb-6">
            Você ainda não tem nenhum projeto salvo.
          </p>
          <button
            onClick={handleNewProject}
            className="bg-[#2d2d33] hover:bg-teal-600 hover:text-white text-gray-300 px-6 py-2 rounded-lg font-medium transition"
          >
            Criar meu primeiro projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-[#16161a] border border-[#2d2d33] rounded-lg p-4 hover:border-teal-500/50 transition duration-300 shadow-xl flex flex-col h-full group"
            >
              <div className="flex-1">
                <h3
                  className="text-md font-bold text-white mb-1 truncate"
                  title={p.name}
                >
                  {p.name}
                </h3>
                <p className="text-[10px] text-gray-500 mb-4">
                  Atualizado:{" "}
                  {p.updateAt?.toDate
                    ? p.updateAt.toDate().toLocaleDateString()
                    : "N/A"}
                </p>
                <div className="flex gap-3 mb-4">
                  <div className="bg-[#0f0f13] px-2 py-1 rounded text-[10px] text-gray-400 font-mono border border-[#2d2d33]">
                    SCH:{" "}
                    {(() => {
                      try {
                        return JSON.parse(p.elements || "[]").length;
                      } catch {
                        return 0;
                      }
                    })()}
                  </div>
                  <div className="bg-[#0f0f13] px-2 py-1 rounded text-[10px] text-gray-400 font-mono border border-[#2d2d33]">
                    PCB:{" "}
                    {(() => {
                      try {
                        return JSON.parse(p.pcbElements || "[]").length;
                      } catch {
                        return 0;
                      }
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2d2d33]">
                <button
                  onClick={() => handleOpenProject(p)}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center transition"
                >
                  <Edit className="w-3 h-3 mr-1" /> Abrir no Editor
                </button>
                <button
                  onClick={() => handleDeleteProject(p.id!)}
                  className="text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1"
                  title="Deletar Projeto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
