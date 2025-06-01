"use client";

import { type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Task, User } from "@/lib/types/types";
import { Filter as FilterType } from "../_lib/hooks/use-dashboard";
import { useTaskFilters } from "../_lib/hooks/use-task-filters";

type TaskFiltersProps = {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  users: User[];
  tasks: Task[];
};

export function TaskFilters({
  filters,
  onFiltersChange,
  users,
  tasks,
}: TaskFiltersProps): JSX.Element {
  const {
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
  } = useTaskFilters(tasks, filters, onFiltersChange);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={filters.assignee}
              onValueChange={(value) => updateFilter("assignee", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => updateFilter("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
              <Button size="sm" onClick={() => addTag(tagInput)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)
                  }
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.tags.map((tag) => (
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
      </PopoverContent>
    </Popover>
  );
}
