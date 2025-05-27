"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageCircle, Paperclip } from "lucide-react";
import { format } from "date-fns";
import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { Task, User } from "@prisma/client";

type TaskCardProps = {
  task: Task;
  users: User[];
  onClick: () => void;
};

export function TaskCard({ task, users, onClick }: TaskCardProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = users.find((user) => user.id === task.assigneeId);

  const priorityColors = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    MEDIUM:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isDragging ? "opacity-50" : "",
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm leading-tight font-medium">{task.title}</h3>
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
            {task.description}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={"/placeholder.svg"}
                alt={assignee?.name as string}
              />
              <AvatarFallback className="text-xs">
                {assignee?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
