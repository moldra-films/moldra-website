"use client";

import { useState } from "react";
import { useAdmin, Task } from "@/context/AdminContext";
import { Plus, CheckSquare, Clock, Tag, X, User } from "lucide-react";

export default function TasksTab() {
  const { tasks, projects, addTask, updateTaskStatus, toggleTaskItem } = useAdmin();
  const [showAddTask, setShowAddTask] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: "",
    project: projects[0]?.name || "Outro",
    assignedTo: "Natália Camurça",
    dueDate: "",
    priority: "Média" as Task["priority"],
    tags: "Edição",
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title: newTask.title,
      project: newTask.project,
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      priority: newTask.priority,
      status: "A Fazer",
      checklist: [],
      tags: newTask.tags.split(",").map((t) => t.trim()),
    });
    setNewTask({
      title: "",
      project: projects[0]?.name || "Outro",
      assignedTo: "Natália Camurça",
      dueDate: "",
      priority: "Média",
      tags: "Edição",
    });
    setShowAddTask(false);
  };

  const handleMoveTask = (taskId: number, currentStatus: Task["status"], direction: "next" | "prev") => {
    const statuses: Task["status"][] = ["A Fazer", "Em Produção", "Revisão", "Concluído"];
    const currentIndex = statuses.indexOf(currentStatus);
    if (direction === "next" && currentIndex < statuses.length - 1) {
      updateTaskStatus(taskId, statuses[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      updateTaskStatus(taskId, statuses[currentIndex - 1]);
    }
  };

  const columns: { status: Task["status"]; label: string; color: string }[] = [
    { status: "A Fazer", label: "A Fazer", color: "bg-gray-500/10 border-gray-500/20 text-gray-400" },
    { status: "Em Produção", label: "Em Produção", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { status: "Revisão", label: "Revisão", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
    { status: "Concluído", label: "Concluído", color: "bg-green-500/10 border-green-500/20 text-green-400" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Quadro Scrum (Tarefas)</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">Gerencie a carga de trabalho de editores, videomakers, fotógrafos e produtores.</p>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="px-5 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Tarefa
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adicionar Nova Tarefa</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  placeholder="Editar teaser de 15 segundos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Projeto Vinculado</label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Responsável</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Natália Camurça">Natália Camurça</option>
                    <option value="Mikelly Maduro">Mikelly Maduro</option>
                    <option value="Carlos Silva">Carlos Silva</option>
                    <option value="Bruna Lins">Bruna Lins</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Prazo Limite</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Etiquetas (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  placeholder="Edição, Finalização"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Criar Tarefa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col rounded-2xl bg-dark-card border border-white/5 min-h-[450px]">
              {/* Header */}
              <div className={`px-4 py-3 border-b border-white/5 rounded-t-2xl flex items-center justify-between ${col.color}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider">{col.label}</span>
                <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5">{colTasks.length}</span>
              </div>

              {/* Cards wrapper */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-black/50 border border-white/5 hover:border-white/10 transition-all space-y-4"
                  >
                    <div>
                      {/* Priority Tag & Badges */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                            task.priority === "Alta"
                              ? "bg-red-500/15 text-red-400"
                              : task.priority === "Média"
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-gray-500/15 text-gray-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[9px] text-gray-500 font-sans">{task.project.split(" ")[0]}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white mt-2 leading-snug font-display">{task.title}</h4>
                    </div>

                    {/* Checkbox item interactive tracker */}
                    {task.checklist.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-primary" /> Subtarefas
                        </span>
                        <div className="space-y-1">
                          {task.checklist.map((item, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-white cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() => toggleTaskItem(task.id, idx)}
                                className="w-3 h-3 rounded bg-black border-white/10 accent-primary"
                              />
                              <span className={item.done ? "line-through text-gray-600" : ""}>{item.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Assignee, Date, Action Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-sans truncate max-w-[80px]">{task.assignedTo.split(" ")[0]}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveTask(task.id, task.status, "prev")}
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-[10px]"
                        >
                          &larr;
                        </button>
                        <button
                          onClick={() => handleMoveTask(task.id, task.status, "next")}
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-[10px]"
                        >
                          &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-[10px] text-gray-600 font-sans">Sem tarefas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
