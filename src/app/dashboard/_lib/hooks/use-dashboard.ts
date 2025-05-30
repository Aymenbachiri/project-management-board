import {
  getColumnConfig,
  getPriorityDisplay,
  Priority,
  Task,
  TaskStatus,
  User,
  Board as BoardType,
} from "@/lib/types/types";
import { API_URL } from "@/lib/utils/env";
import {
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  SensorDescriptor,
  SensorOptions,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type Filter = {
  assignee: string;
  tags: string[];
  priority: Priority | "";
  status: TaskStatus | "";
  dueDateRange: {
    from: Date;
    to: Date;
  } | null;
};

type useDashboardReturn = {
  setIsCreateBoardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  activeBoard: string;
  setActiveBoard: React.Dispatch<React.SetStateAction<string>>;
  boards: BoardType[];
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  currentBoard: BoardType | undefined;
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  users: User[];
  boardTasks: Task[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragStart: () => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  filteredTasks: Task[];
  openTaskDetail: (task: Task) => void;
  createTask: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  isCreateBoardOpen: boolean;
  selectedTask: Task | null;
  isTaskDetailOpen: boolean;
  setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createBoard: (name: string, description: string) => Promise<void>;
};

export function useDashboard(): useDashboardReturn {
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
        fetch(`${API_URL}/api/boards`),
        fetch(`${API_URL}/api/users`),
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
      const response = await fetch(`${API_URL}/api/boards/${boardId}/tasks`, {
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
      if (filters.assignee && task.assigneeId !== filters.assignee) {
        return false;
      }

      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(
          (filterTag) => task.tags && task.tags.includes(filterTag),
        );
        if (!hasMatchingTag) return false;
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.status && task.status !== filters.status) {
        return false;
      }

      if (filters.dueDateRange && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date(filters.dueDateRange.from);
        const toDate = new Date(filters.dueDateRange.to);

        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        if (dueDate < fromDate || dueDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [boardTasks, filters]);

  const handleDragStart = () => {};

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

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

    const originalTask = { ...activeTask };

    try {
      let newStatus = activeTask.status;
      let shouldUpdateStatus = false;
      let shouldUpdateOrder = false;
      let updatedTasks: Task[] = [];

      const overColumn = currentBoard?.columns.find((col) => col.id === overId);
      if (overColumn && activeTask.status !== overColumn.id) {
        newStatus = overColumn.id as TaskStatus;
        shouldUpdateStatus = true;
      }

      const overTask = tasks.find((task) => task.id === overId);
      if (overTask) {
        if (activeTask.status !== overTask.status) {
          newStatus = overTask.status;
          shouldUpdateStatus = true;
        }

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

            updatedTasks = reordered.map((task, index) => ({
              ...task,
              order: index,
              status: targetStatus,
            }));
          }
        }
      }

      if (shouldUpdateStatus || shouldUpdateOrder) {
        setTasks((prev) => {
          if (shouldUpdateOrder && updatedTasks.length > 0) {
            const otherTasks = prev.filter(
              (task) =>
                task.status !== (newStatus || activeTask.status) ||
                task.boardId !== activeBoard,
            );
            return [...otherTasks, ...updatedTasks];
          } else {
            return prev.map((task) =>
              task.id === activeId ? { ...task, status: newStatus } : task,
            );
          }
        });
      }

      const dbUpdates: Promise<Response>[] = [];

      if (shouldUpdateOrder && updatedTasks.length > 0) {
        updatedTasks.forEach((task, index) => {
          dbUpdates.push(
            fetch(`${API_URL}/api/tasks/${task.id}`, {
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
        dbUpdates.push(
          fetch(`${API_URL}/api/tasks/${activeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }),
        );
      }

      if (dbUpdates.length > 0) {
        const responses = await Promise.all(dbUpdates);

        const failedUpdates = responses.filter((response) => !response.ok);
        if (failedUpdates.length > 0) {
          throw new Error(`Failed to update ${failedUpdates.length} task(s)`);
        }
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

      setTasks((prev) => {
        return prev.map((task) => {
          if (task.id === activeId) {
            return originalTask;
          }
          const originalTaskInList = tasks.find((t) => t.id === task.id);
          return originalTaskInList || task;
        });
      });

      toast.error("Failed to move task. Changes have been reverted.");
    }
  };

  const createBoard = async (name: string, description: string) => {
    try {
      const response = await fetch(`${API_URL}/api/boards`, {
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
      const response = await fetch(
        `${API_URL}/api/boards/${activeBoard}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        },
      );

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
      const response = await fetch(`${API_URL}/api/boards/tasks/${taskId}`, {
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
      const response = await fetch(`${API_URL}/api/boards/tasks/${taskId}`, {
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

  return {
    setIsCreateBoardOpen,
    loading,
    activeBoard,
    setActiveBoard,
    boards,
    activeTab,
    setActiveTab,
    currentBoard,
    filters,
    setFilters,
    users,
    boardTasks,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    filteredTasks,
    openTaskDetail,
    createTask,
    isCreateBoardOpen,
    selectedTask,
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    updateTask,
    deleteTask,
    createBoard,
  };
}
