"use client";

import { useState } from "react";
import { useAdmin, Task } from "@/context/AdminContext";
import { Plus, CheckSquare, Clock, Tag, X, User, Edit, Trash2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksTab() {
  const { tasks, projects, addTask, updateTaskStatus, updateTask, deleteTask, toggleTaskItem, confirmModal } = useAdmin();
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Task["status"] | null>(null);

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
    if (editingTask) {
      updateTask(editingTask.id, {
        title: newTask.title,
        project: newTask.project,
        assignedTo: newTask.assignedTo,
        dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
        priority: newTask.priority,
        tags: newTask.tags.split(",").map((t) => t.trim()),
      });
      setEditingTask(null);
    } else {
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
    }
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

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      project: task.project,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      priority: task.priority,
      tags: task.tags.join(", "),
    });
    setShowAddTask(true);
  };

  const handleCloseTaskDrawer = () => {
    setEditingTask(null);
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent, status: Task["status"]) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStatus === status) {
      setDragOverStatus(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const rawId = e.dataTransfer.getData("text/plain");
    const taskId = rawId ? Number(rawId) : draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
    setDragOverStatus(null);
    setDraggedTaskId(null);
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
          <p className="text-xs text-gray-500 font-sans mt-1">
            Arraste e solte os cards entre as colunas para atualizar o status em tempo real.
          </p>
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
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseTaskDrawer}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingTask ? "Editar Tarefa" : "Adicionar Nova Tarefa"}
                </h3>
                <button
                  onClick={handleCloseTaskDrawer}
                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                >
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
                  {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Board Columns with Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          const isOver = dragOverStatus === col.status;
          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOverColumn(e, col.status)}
              onDragLeave={(e) => handleDragLeaveColumn(e, col.status)}
              onDrop={(e) => handleDropOnColumn(e, col.status)}
              className={`flex flex-col rounded-2xl bg-dark-card border transition-all duration-200 min-h-[460px] ${
                isOver 
                  ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04] shadow-xl shadow-primary/5" 
                  : "border-white/5"
              }`}
            >
              {/* Column Header */}
              <div className={`px-4 py-3 border-b border-white/5 rounded-t-2xl flex items-center justify-between transition-colors ${col.color} ${isOver ? "bg-primary/20" : ""}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider">{col.label}</span>
                <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5">{colTasks.length}</span>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto min-h-[350px]">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => {
                    const isBeingDragged = draggedTaskId === task.id;
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, task.id)}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        whileHover={{ y: -2, borderColor: "rgba(200, 169, 106, 0.3)", boxShadow: "0 4px 20px -10px rgba(200, 169, 106, 0.15)" }}
                        className={`p-4 rounded-xl bg-black/50 border transition-all space-y-3.5 group relative cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? "opacity-40 border-dashed border-primary scale-[0.98] shadow-none"
                            : "border-white/5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/40 hover:bg-black/70"
                        }`}
                      >
                        <div>
                          {/* Priority Tag & Badges */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors shrink-0" />
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
                              <span className="text-[9px] text-gray-500 font-sans truncate max-w-[90px]">{task.project.split(" ")[0]}</span>
                            </div>

                            {/* Edit & Delete Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTaskClick(task);
                                }}
                                className="p-1 hover:bg-white/15 rounded text-gray-400 hover:text-white cursor-pointer transition-colors"
                                title="Editar Tarefa"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmModal({
                                    title: "Excluir Tarefa",
                                    message: `Tem certeza de que deseja excluir a tarefa "${task.title}"?`,
                                    confirmText: "Excluir Tarefa",
                                    onConfirm: () => deleteTask(task.id)
                                  });
                                }}
                                className="p-1 hover:bg-red-500/15 rounded text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                                title="Excluir Tarefa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white mt-2 leading-snug font-display">{task.title}</h4>
                        </div>

                        {/* Checkbox item interactive tracker */}
                        {task.checklist.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <span className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-primary" /> Subtarefas ({task.checklist.filter(c => c.done).length}/{task.checklist.length})
                            </span>
                            <div className="space-y-1">
                              {task.checklist.map((item, idx) => (
                                <label
                                  key={idx}
                                  className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-white cursor-pointer select-none"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => toggleTaskItem(task.id, idx)}
                                    className="w-3 h-3 rounded bg-black border-white/10 accent-primary cursor-pointer"
                                  />
                                  <span className={item.done ? "line-through text-gray-600 font-light" : "font-light"}>{item.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata Assignee, Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-sans truncate max-w-[90px]">{task.assignedTo.split(" ")[0]}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{task.dueDate ? new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "--/--"}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div className="text-center py-12 text-[11px] text-gray-600 font-sans border-2 border-dashed border-white/[0.03] rounded-xl">
                    Arraste tarefas aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
