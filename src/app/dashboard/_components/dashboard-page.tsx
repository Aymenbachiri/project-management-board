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
import type { Priority } from "../_lib/types";
import { mockUsers } from "../_lib/mock-data";
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
import {
  BoardColumnId,
  Board as BoardType,
  Task,
  TaskStatus,
  User,
} from "@prisma/client";
import { CreateTaskInput } from "@/lib/validation/task";
import { createBoardTask } from "@/lib/helpers/create-task";

type DashboardPageProps = {
  boards: BoardType[] | undefined;
  tasks: Task[] | undefined;
  users: User[] | undefined;
};

export function DashboardPage({
  boards,
  tasks: initialTasks,
  users,
}: DashboardPageProps): JSX.Element {
  console.log("boards: ", boards);

  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [activeBoard, setActiveBoard] = useState(
    boards && boards.length > 0 ? boards[0].id : "",
  );
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
  const boardTasks = tasks?.filter((task) => task.boardId === activeBoard);

  const filteredTasks = useMemo(() => {
    return boardTasks?.filter((task) => {
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

    const activeTask = tasks?.find((task) => task.id === activeId);
    if (!activeTask) return;

    // Check if we're hovering over a column
    const overColumn = currentBoard?.columns.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.columnId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeId
            ? { ...task, status: overColumn.columnId as TaskStatus }
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

    const activeTask = tasks?.find((task) => task.id === activeId);
    const overTask = tasks?.find((task) => task.id === overId);

    if (!activeTask) return;

    // If dropped on another task, reorder within the same column
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = filteredTasks?.filter(
        (task) => task.status === activeTask.status,
      );
      const oldIndex = columnTasks?.findIndex((task) => task.id === activeId);
      const newIndex = columnTasks?.findIndex((task) => task.id === overId);

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

  const mapTaskStatusToColumnId = (status: TaskStatus): BoardColumnId => {
    const mapping: Record<TaskStatus, BoardColumnId> = {
      todo: "todo" as BoardColumnId,
      in_progress: "in_progress" as BoardColumnId,
      done: "done" as BoardColumnId,
    };
    return mapping[status];
  };

  const createTask = async (taskData: CreateTaskInput) => {
    try {
      console.log("Creating task with data:", taskData);
      console.log("Task status type:", typeof taskData.status);
      console.log("Task status value:", taskData.status);

      if (!currentBoard) {
        toast.error("Please select a board first");
        return;
      }

      // Check if status is actually an ObjectId (which shouldn't happen)
      if (
        typeof taskData.status === "string" &&
        taskData.status.length === 24
      ) {
        console.error(
          "Status appears to be an ObjectId instead of enum value:",
          taskData.status,
        );

        // Try to find the column by ID and get its status
        const columnById = currentBoard.columns.find(
          (col) => col.id === taskData.status,
        );
        if (columnById) {
          console.log(
            "Found column by ID, using its columnId:",
            columnById.columnId,
          );
          taskData.status = columnById.columnId as TaskStatus;
        } else {
          toast.error("Invalid status provided");
          return;
        }
      }

      // Map the task status to column ID format (should be the same now)
      const columnIdToFind = mapTaskStatusToColumnId(taskData.status);

      console.log("Looking for column with columnId:", columnIdToFind);
      console.log(
        "Available columns:",
        currentBoard.columns.map((col) => ({
          id: col.id,
          columnId: col.columnId,
          title: col.title,
        })),
      );

      // Find the column for this task to get columnId
      const column = currentBoard.columns.find(
        (col) => col.columnId === columnIdToFind,
      );

      if (!column) {
        console.error("Column not found for status:", taskData.status);
        console.error("Mapped columnId:", columnIdToFind);
        toast.error("Column not found for the selected status");
        return;
      }

      console.log("Found column:", column);

      const createTaskInput: CreateTaskInput = {
        title: taskData.title,
        description: taskData.description as string,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString()
          : undefined,
        assigneeId: taskData.assigneeId as string,
        // assigneeId: "683316dcfabc9c088470ea3f",
        tags: taskData.tags,
        columnId: column.id,
        order: taskData.order || 0,
      };

      console.log("Final createTaskInput:", createTaskInput);

      // Pass the boardId to the createBoardTask function
      const newTask = await createBoardTask(createTaskInput, currentBoard.id);

      if (newTask) {
        setTasks((prev) => [...prev, newTask]);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
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
