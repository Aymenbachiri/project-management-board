/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Task } from "@/lib/types/types";
import { Filter as FilterType } from "./use-dashboard";

type UseTaskFiltersProps = {
  tasks: Task[];
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
};

type UseTaskFiltersReturn = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tagInput: string;
  setTagInput: (tagInput: string) => void;
  allTags: string[];
  activeFiltersCount: number;
  updateFilter: (key: string, value: any) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearFilters: () => void;
};

export function useTaskFilters(
  tasks: UseTaskFiltersProps["tasks"],
  filters: UseTaskFiltersProps["filters"],
  onFiltersChange: UseTaskFiltersProps["onFiltersChange"],
): UseTaskFiltersReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>("");

  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)));
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && (Array.isArray(value) ? value.length > 0 : true),
  ).length;

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilter("tags", [...filters.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateFilter(
      "tags",
      filters.tags.filter((t) => t !== tag),
    );
  };

  const clearFilters = () => {
    onFiltersChange({
      assignee: "",
      tags: [],
      priority: "",
      status: "",
      dueDateRange: null,
    });
  };

  return {
    isOpen,
    setIsOpen,
    tagInput,
    setTagInput,
    allTags,
    activeFiltersCount,
    updateFilter,
    addTag,
    removeTag,
    clearFilters,
  };
}
