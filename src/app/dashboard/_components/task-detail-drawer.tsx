"use client";

import { type JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, X, MessageCircle, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Priority, Task, TaskStatus, User } from "@/lib/types/types";
import { useSession } from "next-auth/react";

type TaskDetailDrawerProps = {
  task: Task;
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function TaskDetailDrawer({
  task,
  users,
  open,
  onOpenChange,
  onUpdateTask,
  onDeleteTask,
  setIsTaskDetailOpen,
}: TaskDetailDrawerProps): JSX.Element {
  const session = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState("");
  const [tagInput, setTagInput] = useState("");

  const assignee = users.find((user) => user.id === task.assigneeId);

  const handleSave = () => {
    onUpdateTask(task.id, editedTask);
    setIsEditing(false);
    setIsTaskDetailOpen(false);
    toast.success("Task updated successfully");
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    onOpenChange(false);
    toast.success("Task deleted successfully");
  };

  const addComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`/api/boards/tasks/${task.id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment.trim(),
            authorId: session?.data?.user?.id,
          }),
        });

        if (response.ok) {
          const newCommentData = await response.json();
          const updatedTask = {
            ...task,
            comments: [...task.comments, newCommentData],
          };
          setNewComment("");
          setIsTaskDetailOpen(false);
          toast.success("Comment added");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editedTask.tags.includes(tagInput.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...editedTask.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter((t) => t !== tag),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:w-[400px] lg:w-[540px]">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-left text-base leading-tight lg:text-lg">
              {isEditing ? "Edit Task" : task.title}
            </SheetTitle>
            <div className="flex flex-shrink-0 space-x-1 pt-5 lg:space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="text-xs lg:text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="text-xs lg:text-sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs lg:text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <SheetDescription className="text-left text-sm">
            Created {format(new Date(task.createdAt), "PPP")}
          </SheetDescription>
        </SheetHeader>

        <div className="m-3 mt-4 space-y-4 lg:mt-6 lg:space-y-6">
          {isEditing ? (
            <div className="space-y-3 lg:space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={editedTask.description as string}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(value: TaskStatus) =>
                      setEditedTask({ ...editedTask, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value: Priority) =>
                      setEditedTask({ ...editedTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Assignee</Label>
                <Select
                  value={editedTask.assigneeId || ""}
                  onValueChange={(value) =>
                    setEditedTask({ ...editedTask, assigneeId: value || null })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.dueDate
                        ? format(new Date(editedTask.dueDate), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editedTask.dueDate
                          ? new Date(editedTask.dueDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        setEditedTask({
                          ...editedTask,
                          dueDate: date?.toISOString() || null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {editedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {editedTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {task.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="mt-1 text-sm capitalize">
                    {task.status.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge variant="secondary" className="mt-1">
                    {task.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Assignee</Label>
                {assignee ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={assignee.avatar || "/placeholder.svg"}
                        alt={assignee.name as string}
                      />
                      <AvatarFallback className="text-xs">
                        {assignee?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.name}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1 text-sm">
                    Unassigned
                  </p>
                )}
              </div>

              {task.dueDate && (
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="mt-1 text-sm">
                    {format(new Date(task.dueDate), "PPP")}
                  </p>
                </div>
              )}

              {task.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div>
            <div className="mb-3 flex items-center space-x-2 lg:mb-4">
              <MessageCircle className="h-4 w-4" />
              <Label className="text-sm font-medium">
                Comments ({task.comments.length})
              </Label>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {task.comments.map((comment) => {
                const author = users.find(
                  (user) => user.id === comment.authorId,
                );
                return (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                      <AvatarImage
                        src={author?.avatar || "/placeholder.svg"}
                        alt={author?.name as string}
                      />
                      <AvatarFallback className="text-xs">
                        {author?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                        <span className="text-sm font-medium">
                          {author?.name || "Unknown User"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {format(
                            new Date(comment.createdAt),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-sm break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                />
                <Button size="sm" onClick={addComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
