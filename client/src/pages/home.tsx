import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Check, X, ClipboardList, Calendar as CalendarIcon, Flag, Tag, ArrowUpDown } from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from "date-fns";
import type { Task, Priority, FilterType } from "@shared/schema";

const STORAGE_KEY = "todo-tasks";
const CATEGORIES_KEY = "todo-categories";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tasks = JSON.parse(stored);
      return tasks.map((task: Partial<Task>) => ({
        id: task.id || generateId(),
        text: task.text || "",
        completed: task.completed || false,
        priority: task.priority || "medium",
        dueDate: task.dueDate || null,
        category: task.category || null,
      }));
    }
  } catch (e) {
    console.error("Failed to load tasks from localStorage:", e);
  }
  return [];
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks to localStorage:", e);
  }
}

function loadCategories(): string[] {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load categories:", e);
  }
  return ["Work", "Personal", "Shopping", "Health"];
}

function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories:", e);
  }
}

function formatDueDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

function isOverdue(dateStr: string | null, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  const date = startOfDay(parseISO(dateStr));
  const today = startOfDay(new Date());
  return date.getTime() < today.getTime();
}

type SortType = "manual" | "dueDate" | "priority";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskCategory, setNewTaskCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("manual");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setCategories(loadCategories());
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (sortBy === "dueDate") {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      });
    } else if (sortBy === "priority") {
      const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return result;
  }, [tasks, filter, sortBy]);

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;

    const newTask: Task = {
      id: generateId(),
      text,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate ? format(newTaskDueDate, "yyyy-MM-dd") : null,
      category: newTaskCategory,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText("");
    setNewTaskPriority("medium");
    setNewTaskDueDate(undefined);
    setNewTaskCategory(null);
    newTaskInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = () => {
    const text = editingText.trim();
    if (!text || !editingId) {
      cancelEditing();
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingId ? { ...task, text } : task
      )
    );
    cancelEditing();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const updateTaskPriority = (id: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, priority } : task
      )
    );
  };

  const updateTaskDueDate = (id: string, date: Date | undefined) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, dueDate: date ? format(date, "yyyy-MM-dd") : null } : task
      )
    );
  };

  const updateTaskCategory = (id: string, category: string | null) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, category } : task
      )
    );
  };

  const addCategory = () => {
    const cat = newCategoryInput.trim();
    if (cat && !categories.includes(cat)) {
      setCategories((prev) => [...prev, cat]);
    }
    setNewCategoryInput("");
    setShowNewCategory(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight" data-testid="text-app-title">
            Todo List
          </h1>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-task-count">
              {activeCount} active, {completedCount} completed
            </p>
          )}
        </header>

        <Card className="p-4 mb-6" data-testid="card-add-task">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Input
                ref={newTaskInputRef}
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-new-task"
              />
              <Button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                size="lg"
                data-testid="button-add-task"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Priority)}>
                <SelectTrigger className="w-[120px]" data-testid="select-new-priority">
                  <Flag className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" data-testid="select-item-priority-low">Low</SelectItem>
                  <SelectItem value="medium" data-testid="select-item-priority-medium">Medium</SelectItem>
                  <SelectItem value="high" data-testid="select-item-priority-high">High</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="default" data-testid="button-new-due-date">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {newTaskDueDate ? format(newTaskDueDate, "MMM d") : "Due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    initialFocus
                  />
                  {newTaskDueDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewTaskDueDate(undefined)}
                        className="w-full"
                        data-testid="button-clear-new-due-date"
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Select value={newTaskCategory || "none"} onValueChange={(v) => setNewTaskCategory(v === "none" ? null : v)}>
                <SelectTrigger className="w-[140px]" data-testid="select-new-category">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" data-testid="select-item-category-none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} data-testid={`select-item-category-${cat}`}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              data-testid="button-filter-all"
            >
              All ({totalCount})
            </Button>
            <Button
              variant={filter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("active")}
              data-testid="button-filter-active"
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("completed")}
              data-testid="button-filter-completed"
            >
              Completed ({completedCount})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
              <SelectTrigger className="w-[130px]" data-testid="select-sort">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual" data-testid="select-item-sort-manual">Manual</SelectItem>
                <SelectItem value="dueDate" data-testid="select-item-sort-duedate">Due date</SelectItem>
                <SelectItem value="priority" data-testid="select-item-sort-priority">Priority</SelectItem>
              </SelectContent>
            </Select>

            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-muted-foreground"
                data-testid="button-clear-completed"
              >
                Clear completed
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="p-8" data-testid="card-empty-state">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground" data-testid="text-empty-state">
                  {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks.`}
                </p>
              </div>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 transition-all duration-200 group"
                data-testid={`card-task-${task.id}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id)}
                    className="h-5 w-5 rounded mt-0.5"
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    data-testid={`checkbox-task-${task.id}`}
                  />

                  {editingId === task.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        ref={editInputRef}
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1"
                        data-testid={`input-edit-task-${task.id}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={saveEdit}
                        aria-label="Save edit"
                        data-testid={`button-save-edit-${task.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEditing}
                        aria-label="Cancel edit"
                        data-testid={`button-cancel-edit-${task.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-base leading-relaxed transition-all duration-200 ${
                            task.completed
                              ? "line-through text-muted-foreground opacity-60"
                              : "text-foreground"
                          }`}
                          data-testid={`text-task-${task.id}`}
                        >
                          {task.text}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:opacity-100 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(task)}
                            aria-label="Edit task"
                            data-testid={`button-edit-task-${task.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                            aria-label="Delete task"
                            className="text-destructive"
                            data-testid={`button-delete-task-${task.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={`cursor-pointer ${PRIORITY_COLORS[task.priority]}`}
                              data-testid={`badge-priority-${task.id}`}
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              {task.priority}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="flex flex-col gap-1">
                              {(["low", "medium", "high"] as Priority[]).map((p) => (
                                <Button
                                  key={p}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateTaskPriority(task.id, p)}
                                  className={`justify-start ${task.priority === p ? "bg-accent" : ""}`}
                                  data-testid={`button-set-priority-${p}-${task.id}`}
                                >
                                  <Flag className={`h-4 w-4 mr-2 ${p === "high" ? "text-red-500" : p === "medium" ? "text-amber-500" : "text-emerald-500"}`} />
                                  {p.charAt(0).toUpperCase() + p.slice(1)}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={`cursor-pointer ${isOverdue(task.dueDate, task.completed) ? "bg-red-500/20 text-red-700 dark:text-red-400" : ""}`}
                              data-testid={`badge-due-date-${task.id}`}
                            >
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {task.dueDate ? formatDueDate(task.dueDate) : "No date"}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                              onSelect={(date) => updateTaskDueDate(task.id, date)}
                              initialFocus
                            />
                            {task.dueDate && (
                              <div className="p-2 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateTaskDueDate(task.id, undefined)}
                                  className="w-full"
                                  data-testid={`button-clear-due-date-${task.id}`}
                                >
                                  Clear date
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer"
                              data-testid={`badge-category-${task.id}`}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {task.category || "No category"}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" align="start">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateTaskCategory(task.id, null)}
                                className={`justify-start ${!task.category ? "bg-accent" : ""}`}
                                data-testid={`button-set-category-none-${task.id}`}
                              >
                                No category
                              </Button>
                              {categories.map((cat) => (
                                <Button
                                  key={cat}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateTaskCategory(task.id, cat)}
                                  className={`justify-start ${task.category === cat ? "bg-accent" : ""}`}
                                  data-testid={`button-set-category-${cat}-${task.id}`}
                                >
                                  {cat}
                                </Button>
                              ))}
                              {showNewCategory ? (
                                <div className="flex gap-1 mt-1">
                                  <Input
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    placeholder="New category"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") addCategory();
                                      if (e.key === "Escape") setShowNewCategory(false);
                                    }}
                                    autoFocus
                                    data-testid={`input-new-category-${task.id}`}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={addCategory}
                                    data-testid={`button-save-new-category-${task.id}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowNewCategory(true)}
                                  className="justify-start text-muted-foreground"
                                  data-testid={`button-add-new-category-${task.id}`}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add category
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
