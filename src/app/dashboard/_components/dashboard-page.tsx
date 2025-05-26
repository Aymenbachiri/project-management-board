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
import type { Priority, Task, TaskStatus } from "../_lib/types";
import { mockTasks, mockUsers } from "../_lib/mock-data";
import { toast } from "sonner";
import { Analytics } from "./analytics";
import { CreateBoardDialog } from "./create-board-dialog";
import { Board } from "./board";
import { TaskDetailDrawer } from "./task-detail-drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Board as BoardType } from "@prisma/client";

type DashboardPageProps = {
  boards: BoardType[] | undefined;
};

export function DashboardPage({ boards }: DashboardPageProps): JSX.Element {
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

  const currentBoard = boards?.find((board) => board.id === activeBoard);
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

  const handleCreateBoard = (board: BoardType) => {
    // setBoards((prev) => [...prev, board]);
    setActiveBoard(board.id);
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
    <div className="bg-background container mx-auto min-h-screen w-full">
      <div className="border-b lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Project Management</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateBoardOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden border-b lg:block">
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

      <div className="flex flex-col lg:flex-row">
        <div className="bg-muted/50 border-b p-4 lg:hidden">
          <Select value={activeBoard} onValueChange={setActiveBoard}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a board" />
            </SelectTrigger>
            <SelectContent>
              {boards?.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 hidden w-64 rounded-md border-r p-4 lg:block lg:h-fit">
          <h2 className="mb-4 font-semibold">Boards</h2>
          <div className="space-y-2">
            {boards?.map((board) => (
              <Card
                key={board.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeBoard === board.id
                    ? "bg-primary text-primary-foreground"
                    : "",
                )}
                onClick={() => setActiveBoard(board.id)}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{board.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-4">
              <TabsList className="w-full">
                <TabsTrigger value="board" className="text-xs lg:text-sm">
                  Board
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs lg:text-sm">
                  <BarChart3 className="mr-1 h-4 w-4 lg:mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="board" className="mt-0">
              <div className="p-2 lg:p-4">
                <div className="mb-4 flex flex-col space-y-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold lg:text-2xl">
                      {currentBoard?.name}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2 text-sm lg:line-clamp-1 lg:text-base">
                      {currentBoard?.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <TaskFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      users={mockUsers}
                      tasks={boardTasks}
                    />
                  </div>
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
              <div className="p-2 lg:p-4">
                <Analytics tasks={boardTasks} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateBoardDialog
        open={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
        onCreateBoard={handleCreateBoard}
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
