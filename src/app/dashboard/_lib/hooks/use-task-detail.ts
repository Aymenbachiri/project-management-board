import { Task, User } from "@/lib/types/types";
import { API_URL } from "@/lib/utils/env";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

type UseTaskDetailProps = {
  task: Task;
  users: User[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: (open: boolean) => void;
};

type UseTaskDetailReturn = {
  isEditing: boolean;
  editedTask: Task;
  newComment: string;
  tagInput: string;
  assignee: User | undefined;
  handleSave: () => void;
  handleDelete: () => void;
  addComment: () => Promise<void>;
  addTag: () => void;
  removeTag: (tag: string) => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setEditedTask: React.Dispatch<React.SetStateAction<Task>>;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  setTagInput: React.Dispatch<React.SetStateAction<string>>;
};

export function useTaskDetail(
  task: UseTaskDetailProps["task"],
  users: UseTaskDetailProps["users"],
  onUpdateTask: UseTaskDetailProps["onUpdateTask"],
  setIsTaskDetailOpen: UseTaskDetailProps["setIsTaskDetailOpen"],
  onDeleteTask: UseTaskDetailProps["onDeleteTask"],
  onOpenChange: UseTaskDetailProps["onOpenChange"],
): UseTaskDetailReturn {
  const session = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [newComment, setNewComment] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");

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
        const response = await fetch(
          `${API_URL}/api/boards/tasks/${task.id}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: newComment.trim(),
              authorId: session?.data?.user?.id,
            }),
          },
        );

        if (response.ok) {
          const newCommentData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return {
    isEditing,
    editedTask,
    newComment,
    tagInput,
    assignee,
    handleSave,
    handleDelete,
    addComment,
    addTag,
    removeTag,
    setIsEditing,
    setEditedTask,
    setNewComment,
    setTagInput,
  };
}
