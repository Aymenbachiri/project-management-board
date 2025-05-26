"use client";

import { type JSX, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Board as BoardType, Task, TaskStatus, User } from "../_lib/types";
import { useState } from "react";

type BoardProps = {
  board: BoardType;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
};

export function Board({
  board,
  tasks,
  users,
  onTaskClick,
  onCreateTask,
}: BoardProps): JSX.Element {
  const [createTaskColumn, setCreateTaskColumn] = useState<string | null>(null);

  const tasksByColumn = useMemo(() => {
    return board.columns.reduce(
      (acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [board.columns, tasks]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {board.columns.map((column) => (
        <BoardColumn
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id] || []}
          users={users}
          onTaskClick={onTaskClick}
          onCreateTask={(taskData) =>
            onCreateTask({
              ...taskData,
              boardId: board.id,
              status: column.id as TaskStatus,
            })
          }
          isCreating={createTaskColumn === column.id}
          onStartCreating={() => setCreateTaskColumn(column.id)}
          onStopCreating={() => setCreateTaskColumn(null)}
        />
      ))}
    </div>
  );
}

interface BoardColumnProps {
  column: { id: string; title: string; color: string };
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "boardId" | "status">,
  ) => void;
  isCreating: boolean;
  onStartCreating: () => void;
  onStopCreating: () => void;
}

function BoardColumn({
  column,
  tasks,
  users,
  onTaskClick,
  onCreateTask,
  isCreating,
  onStartCreating,
  onStopCreating,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <CardTitle className="text-sm font-medium">
              {column.title}
            </CardTitle>
            <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
              {tasks.length}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onStartCreating}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={setNodeRef} className="min-h-[200px] space-y-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        <CreateTaskDialog
          open={isCreating}
          onOpenChange={(open) => !open && onStopCreating()}
          onCreateTask={onCreateTask}
          users={users}
          defaultStatus={column.id as TaskStatus}
        />
      </CardContent>
    </Card>
  );
}
