import { CreateTaskInput, CreateTaskSchema } from "@/lib/validation/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { Priority, TaskStatus } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

type useCreateTaskProps = {
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: CreateTaskInput) => void;
  defaultStatus: TaskStatus;
  columnId: string;
};

export function useCreateTask(
  onOpenChange: useCreateTaskProps["onOpenChange"],
  onCreateTask: useCreateTaskProps["onCreateTask"],
  defaultStatus: useCreateTaskProps["defaultStatus"],
  columnId: useCreateTaskProps["columnId"],
) {
  const [tagInput, setTagInput] = useState("");

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "LOW" as Priority,
      dueDate: undefined,
      assigneeId: "",
      tags: [],
      columnId: String(columnId),
      order: undefined,
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const watchedTags = watch("tags") || [];

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      const formattedData: CreateTaskInput = {
        ...data,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        order: data.order || 0,
        columnId: String(data.columnId),
      };

      onCreateTask(formattedData);
      handleClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleClose = () => {
    reset();
    setTagInput("");
    onOpenChange(false);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !watchedTags.includes(trimmedTag)) {
      setValue("tags", [...watchedTags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return {
    form,
    onSubmit,
    handleSubmit,
    removeTag,
    handleTagKeyDown,
    isSubmitting,
    tagInput,
    setTagInput,
    addTag,
    watchedTags,
    handleClose,
  };
}
