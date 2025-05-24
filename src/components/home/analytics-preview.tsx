"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import type { JSX } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animation/animation";

const mockAnalytics = {
  completionRate: 78,
  totalTasks: 156,
  completedTasks: 122,
  overdueTasks: 8,
  activeUsers: 24,
  tasksByStatus: {
    todo: 34,
    inProgress: 22,
    done: 122,
  },
  tasksByPriority: {
    high: 12,
    medium: 45,
    low: 99,
  },
};

export function AnalyticsPreview(): JSX.Element {
  return (
    <section id="analytics" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-6 text-3xl font-bold md:text-4xl"
          >
            Advanced Analytics Dashboard
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mx-auto max-w-3xl text-xl"
          >
            Get deep insights into your team's productivity with comprehensive
            analytics, visual charts, and key performance metrics.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              title: "Total Tasks",
              value: mockAnalytics.totalTasks,
              icon: CheckCircle,
              trend: "+12%",
              trendUp: true,
              color: "text-blue-600",
            },
            {
              title: "Completed",
              value: mockAnalytics.completedTasks,
              icon: CheckCircle,
              trend: "+8%",
              trendUp: true,
              color: "text-green-600",
            },
            {
              title: "Overdue",
              value: mockAnalytics.overdueTasks,
              icon: AlertTriangle,
              trend: "-3%",
              trendUp: false,
              color: "text-red-600",
            },
            {
              title: "Active Users",
              value: mockAnalytics.activeUsers,
              icon: Users,
              trend: "+5%",
              trendUp: true,
              color: "text-purple-600",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-muted-foreground flex items-center text-xs">
                    {metric.trendUp ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        metric.trendUp ? "text-green-500" : "text-red-500"
                      }
                    >
                      {metric.trend}
                    </span>
                    <span className="ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>
                  Overall project completion progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{mockAnalytics.completionRate}%</span>
                  </div>
                  <Progress
                    value={mockAnalytics.completionRate}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockAnalytics.tasksByStatus.done}
                    </div>
                    <div className="text-muted-foreground text-xs">Done</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mockAnalytics.tasksByStatus.inProgress}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      In Progress
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {mockAnalytics.tasksByStatus.todo}
                    </div>
                    <div className="text-muted-foreground text-xs">To Do</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>
                  Tasks organized by priority levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "High Priority",
                    value: mockAnalytics.tasksByPriority.high,
                    color: "bg-red-500",
                    total: mockAnalytics.totalTasks,
                  },
                  {
                    label: "Medium Priority",
                    value: mockAnalytics.tasksByPriority.medium,
                    color: "bg-yellow-500",
                    total: mockAnalytics.totalTasks,
                  },
                  {
                    label: "Low Priority",
                    value: mockAnalytics.tasksByPriority.low,
                    color: "bg-green-500",
                    total: mockAnalytics.totalTasks,
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.value} tasks</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <motion.div
                        className={`h-2 rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${(item.value / item.total) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
