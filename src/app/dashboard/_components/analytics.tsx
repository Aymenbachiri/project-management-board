"use client";

import { type JSX, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Task } from "../_lib/types";

type AnalyticsProps = {
  tasks: Task[];
};

export function Analytics({ tasks }: AnalyticsProps): JSX.Element {
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "done",
    ).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const tasksByStatus = {
      todo: tasks.filter((task) => task.status === "todo").length,
      "in-progress": tasks.filter((task) => task.status === "in-progress")
        .length,
      done: completedTasks,
    };

    const tasksByPriority = {
      low: tasks.filter((task) => task.priority === "low").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      high: tasks.filter((task) => task.priority === "high").length,
    };

    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "done",
    ).length;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
    };
  }, [tasks]);

  const statusData = [
    { name: "To Do", value: analytics.tasksByStatus.todo, color: "#ef4444" },
    {
      name: "In Progress",
      value: analytics.tasksByStatus["in-progress"],
      color: "#f59e0b",
    },
    { name: "Done", value: analytics.tasksByStatus.done, color: "#10b981" },
  ];

  const priorityData = [
    { name: "Low", value: analytics.tasksByPriority.low },
    { name: "Medium", value: analytics.tasksByPriority.medium },
    { name: "High", value: analytics.tasksByPriority.high },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.overdueTasks}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>
              Distribution of tasks across different statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Tasks",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Number of tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Tasks",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
