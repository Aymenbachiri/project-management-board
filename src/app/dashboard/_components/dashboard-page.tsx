"use client";

import { useState, useMemo, type JSX } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskFilters } from "./task-filters";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3 } from "lucide-react";
import type {
  Priority,
  Task,
  TaskStatus,
  Board as BoardType,
} from "../_lib/types";
import { mockBoards, mockTasks, mockUsers } from "../_lib/mock-data";
import { toast } from "sonner";
import { Analytics } from "./analytics";
import { CreateBoardDialog } from "./create-board-dialog";
import { Board } from "./board";
import { TaskDetailDrawer } from "./task-detail-drawer";

export function DashboardPage(): JSX.Element {
  const [boards, setBoards] = useState<BoardType[]>(mockBoards);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeBoard, setActiveBoard] = useState<string>(boards[0]?.id || "");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  const [filters, setFilters] = useState({
    assignee: "",
    tags: [] as string[],
    priority: "" as Priority | "",
    status: "" as TaskStatus | "",
    dueDateRange: null as { from: Date; to: Date } | null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const currentBoard = boards.find((board) => board.id === activeBoard);
  const boardTasks = tasks.filter((task) => task.boardId === activeBoard);

  const filteredTasks = useMemo(() => {
    return boardTasks.filter((task) => {
      if (filters.assignee && task.assigneeId !== filters.assignee)
        return false;
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => task.tags.includes(tag))
      )
        return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.dueDateRange && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (
          dueDate < filters.dueDateRange.from ||
          dueDate > filters.dueDateRange.to
        )
          return false;
      }
      return true;
    });
  }, [boardTasks, filters]);

  const handleDragStart = (event: DragStartEvent) => {
    // Optional: Add visual feedback when dragging starts
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    // Check if we're hovering over a column
    const overColumn = currentBoard?.columns.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeId
            ? { ...task, status: overColumn.id as TaskStatus }
            : task,
        ),
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeId);
    const overTask = tasks.find((task) => task.id === overId);

    if (!activeTask) return;

    // If dropped on another task, reorder within the same column
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = filteredTasks.filter(
        (task) => task.status === activeTask.status,
      );
      const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
      const newIndex = columnTasks.findIndex((task) => task.id === overId);

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
        setTasks((prev) => {
          const otherTasks = prev.filter(
            (task) =>
              task.status !== activeTask.status || task.boardId !== activeBoard,
          );
          return [...otherTasks, ...reorderedTasks];
        });
      }
    }

    toast.success("Task moved successfully");
  };

  const createBoard = (name: string, description: string) => {
    const newBoard: BoardType = {
      id: `board-${Date.now()}`,
      name,
      description,
      columns: [
        { id: "todo", title: "To Do", color: "#ef4444" },
        { id: "in-progress", title: "In Progress", color: "#f59e0b" },
        { id: "done", title: "Done", color: "#10b981" },
      ],
      createdAt: new Date().toISOString(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoard(newBoard.id);
    toast.success("Board created successfully");
  };

  const createTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully");
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully");
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Project Management</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateBoardOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="bg-muted/50 w-64 border-r p-4">
          <h2 className="mb-4 font-semibold">Boards</h2>
          <div className="space-y-2">
            {boards.map((board) => (
              <Card
                key={board.id}
                className={`cursor-pointer transition-colors ${
                  activeBoard === board.id
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => setActiveBoard(board.id)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{board.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="board" className="mt-0">
              <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{currentBoard?.name}</h2>
                    <p className="text-muted-foreground">
                      {currentBoard?.description}
                    </p>
                  </div>
                  <TaskFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    users={mockUsers}
                    tasks={boardTasks}
                  />
                </div>

                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  {currentBoard && (
                    <Board
                      board={currentBoard}
                      tasks={filteredTasks}
                      users={mockUsers}
                      onTaskClick={openTaskDetail}
                      onCreateTask={createTask}
                    />
                  )}
                </DndContext>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="p-4">
                <Analytics tasks={boardTasks} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateBoardDialog
        open={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
        onCreateBoard={createBoard}
      />

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          users={mockUsers}
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}
    </div>
  );
}
