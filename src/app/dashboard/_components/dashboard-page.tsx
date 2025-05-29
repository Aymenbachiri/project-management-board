"use client";

import { useState, useMemo, type JSX, useEffect } from "react";
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
import { Plus, BarChart3, Loader2 } from "lucide-react";
import type { Priority } from "../_lib/types";
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
import {
  getColumnConfig,
  getPriorityDisplay,
  Task,
  User,
  Board as BoardType,
  TaskStatus,
} from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageProps = {
  boards: BoardType[] | undefined;
  tasks: Task[] | undefined;
  users: User[] | undefined;
};

export function DashboardPage({}: DashboardPageProps): JSX.Element {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeBoard, setActiveBoard] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [boardsRes, usersRes] = await Promise.all([
        fetch("/api/boards"),
        fetch("/api/users"),
      ]);

      if (boardsRes.ok && usersRes.ok) {
        const boardsData = await boardsRes.json();
        const usersData = await usersRes.json();

        setBoards(
          boardsData.map((board: BoardType) => ({
            ...board,
            columns: [
              getColumnConfig("todo"),
              getColumnConfig("in_progress"),
              getColumnConfig("done"),
            ],
          })),
        );
        setUsers(
          usersData.map((user: User) => ({
            ...user,
            avatar: user.image,
          })),
        );

        if (boardsData.length > 0) {
          setActiveBoard(boardsData[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBoard) {
      loadTasks(activeBoard);
    }
  }, [activeBoard]);

  const loadTasks = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/tasks`, {
        next: { tags: ["tasks"] },
      });
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(
          tasksData.map((task: Task) => ({
            ...task,
            priority: getPriorityDisplay(task.priority),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const currentBoard = boards.find((board) => board.id === activeBoard);
  const boardTasks = tasks.filter((task) => task.boardId === activeBoard);

  const filteredTasks = useMemo(() => {
    return boardTasks.filter((task) => {
      // Assignee filter
      if (filters.assignee && task.assigneeId !== filters.assignee) {
        return false;
      }

      // Tags filter - check if task has any of the selected tags
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(
          (filterTag) => task.tags && task.tags.includes(filterTag),
        );
        if (!hasMatchingTag) return false;
      }

      // Priority filter - handle empty string case
      if (
        filters.priority &&
        filters.priority !== "" &&
        task.priority !== filters.priority
      ) {
        return false;
      }

      // Status filter - handle empty string case
      if (
        filters.status &&
        filters.status !== "" &&
        task.status !== filters.status
      ) {
        return false;
      }

      // Due date range filter
      if (filters.dueDateRange && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date(filters.dueDateRange.from);
        const toDate = new Date(filters.dueDateRange.to);

        // Set time to start/end of day for proper comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        if (dueDate < fromDate || dueDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [boardTasks, filters]);

  const clearFilters = () => {
    setFilters({
      assignee: "",
      tags: [],
      priority: "",
      status: "",
      dueDateRange: null,
    });
  };

  const updateFilter = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    // Store original task for potential rollback
    const originalTask = { ...activeTask };

    try {
      let newStatus = activeTask.status;
      let shouldUpdateStatus = false;
      let shouldUpdateOrder = false;
      let updatedTasks: any[] = [];

      // Check if we're dropping on a column
      const overColumn = currentBoard?.columns.find((col) => col.id === overId);
      if (overColumn && activeTask.status !== overColumn.id) {
        newStatus = overColumn.id as TaskStatus;
        shouldUpdateStatus = true;
      }

      // Check if we're dropping on another task
      const overTask = tasks.find((task) => task.id === overId);
      if (overTask) {
        // If dropping on a task in a different column, update status
        if (activeTask.status !== overTask.status) {
          newStatus = overTask.status;
          shouldUpdateStatus = true;
        }

        // Handle reordering within the same column or new column
        if (
          activeTask.status === overTask.status ||
          newStatus === overTask.status
        ) {
          const targetStatus = newStatus || activeTask.status;
          const columnTasks = tasks.filter(
            (task) => task.status === targetStatus,
          );

          const oldIndex = columnTasks.findIndex(
            (task) => task.id === activeId,
          );
          const newIndex = columnTasks.findIndex((task) => task.id === overId);

          if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
            shouldUpdateOrder = true;
            const reordered = arrayMove(columnTasks, oldIndex, newIndex);

            // Update the order and status for affected tasks
            updatedTasks = reordered.map((task, index) => ({
              ...task,
              order: index,
              status: targetStatus,
            }));
          }
        }
      }

      // Update local state immediately for better UX
      if (shouldUpdateStatus || shouldUpdateOrder) {
        setTasks((prev) => {
          if (shouldUpdateOrder && updatedTasks.length > 0) {
            // For reordering, replace all tasks in the affected column
            const otherTasks = prev.filter(
              (task) =>
                task.status !== (newStatus || activeTask.status) ||
                task.boardId !== activeBoard,
            );
            return [...otherTasks, ...updatedTasks];
          } else {
            // For simple status change
            return prev.map((task) =>
              task.id === activeId ? { ...task, status: newStatus } : task,
            );
          }
        });
      }

      // Prepare database updates
      const dbUpdates: Promise<Response>[] = [];

      if (shouldUpdateOrder && updatedTasks.length > 0) {
        // Batch update all affected tasks
        updatedTasks.forEach((task, index) => {
          dbUpdates.push(
            fetch(`/api/tasks/${task.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: task.status,
                order: index,
              }),
            }),
          );
        });
      } else if (shouldUpdateStatus) {
        // Simple status update
        dbUpdates.push(
          fetch(`/api/tasks/${activeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }),
        );
      }

      // Execute all database updates
      if (dbUpdates.length > 0) {
        const responses = await Promise.all(dbUpdates);

        // Check if all updates were successful
        const failedUpdates = responses.filter((response) => !response.ok);
        if (failedUpdates.length > 0) {
          throw new Error(`Failed to update ${failedUpdates.length} task(s)`);
        }

        // If we only updated one task, get the updated data
        if (
          dbUpdates.length === 1 &&
          shouldUpdateStatus &&
          !shouldUpdateOrder
        ) {
          const updatedTaskData = await responses[0].json();
          setTasks((prev) =>
            prev.map((task) =>
              task.id === activeId
                ? {
                    ...updatedTaskData,
                    priority: getPriorityDisplay(updatedTaskData.priority),
                  }
                : task,
            ),
          );
        }
      }

      toast.success("Task moved successfully");
    } catch (error) {
      console.error("Error updating task:", error);

      // Revert all local state changes on error
      setTasks((prev) => {
        // Find all tasks that might have been affected and revert them
        return prev.map((task) => {
          if (task.id === activeId) {
            return originalTask;
          }
          // Also revert any other tasks that might have been reordered
          const originalTaskInList = tasks.find((t) => t.id === task.id);
          return originalTaskInList || task;
        });
      });

      toast.error("Failed to move task. Changes have been reverted.");
    }
  };

  const createBoard = async (name: string, description: string) => {
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        const boardWithColumns = {
          ...newBoard,
          columns: [
            getColumnConfig("todo"),
            getColumnConfig("in_progress"),
            getColumnConfig("done"),
          ],
        };
        setBoards((prev) => [...prev, boardWithColumns]);
        setActiveBoard(newBoard.id);
        toast.success("Board created successfully");
      }
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
    }
  };

  const createTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const response = await fetch(`/api/boards/${activeBoard}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        const taskWithDisplayPriority = {
          ...newTask,
          priority: getPriorityDisplay(newTask.priority),
        };
        setTasks((prev) => [...prev, taskWithDisplayPriority]);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/boards/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        const taskWithDisplayPriority = {
          ...updatedTask,
          priority: getPriorityDisplay(updatedTask.priority),
        };
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? taskWithDisplayPriority : task,
          ),
        );
        toast.success("Task updated successfully");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/boards/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-background container mx-auto min-h-screen w-full">
        <div className="border-b lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="hidden border-b lg:block">
          <div className="flex h-16 items-center px-4">
            <Skeleton className="h-7 w-52" />
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row">
          <div className="bg-muted/50 border-b p-4 lg:hidden">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="bg-muted/50 hidden w-64 rounded-md border-r p-4 lg:block lg:h-fit">
            <Skeleton className="mb-4 h-5 w-24" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="border-b px-4">
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
            <div className="p-2 lg:p-4">
              <div className="mb-4 flex flex-col space-y-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex-shrink-0">
                  <Skeleton className="h-10 w-64 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-20 w-full rounded-md" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      users={users}
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
                      users={users as User[]}
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
        onCreateBoard={createBoard}
      />

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          users={users}
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
          setIsTaskDetailOpen={setIsTaskDetailOpen}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}
    </div>
  );
}
