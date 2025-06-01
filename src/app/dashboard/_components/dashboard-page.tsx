"use client";

import { type JSX } from "react";
import { DndContext } from "@dnd-kit/core";
import { TaskFilters } from "./task-filters";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3 } from "lucide-react";
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
import { User } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "./loading-skeleton";
import { useDashboard } from "../_lib/hooks/use-dashboard";

type DashboardPageProps = {
  users: User[] | undefined;
};

export function DashboardPage({}: DashboardPageProps): JSX.Element {
  const {
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
  } = useDashboard();

  if (loading) {
    return <LoadingSkeleton />;
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
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          setIsTaskDetailOpen={setIsTaskDetailOpen}
        />
      )}
    </div>
  );
}
