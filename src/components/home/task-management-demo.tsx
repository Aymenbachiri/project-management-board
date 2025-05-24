"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Paperclip, Flag } from "lucide-react";
import type { JSX } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animation/animation";

const mockTasks = [
  {
    id: 1,
    title: "Design new dashboard",
    description: "Create wireframes and mockups for the analytics dashboard",
    status: "In Progress",
    assignee: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AJ",
    },
    priority: "High",
    dueDate: "2024-01-15",
    tags: ["Design", "UI/UX"],
    comments: 3,
    attachments: 2,
  },
  {
    id: 2,
    title: "Implement drag & drop",
    description: "Add drag and drop functionality to the kanban board",
    status: "To Do",
    assignee: {
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "BS",
    },
    priority: "Medium",
    dueDate: "2024-01-20",
    tags: ["Development", "Frontend"],
    comments: 1,
    attachments: 0,
  },
  {
    id: 3,
    title: "User testing session",
    description: "Conduct user testing for the new features",
    status: "Done",
    assignee: {
      name: "Carol Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "CD",
    },
    priority: "Low",
    dueDate: "2024-01-10",
    tags: ["Testing", "UX"],
    comments: 5,
    attachments: 1,
  },
];

const priorityColors = {
  High: "bg-red-500/10 text-red-600 dark:text-red-400",
  Medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Low: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const statusColors = {
  "To Do": "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Done: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export function TaskManagementDemo(): JSX.Element {
  return (
    <section className="py-24">
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
            Rich Task Management
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mx-auto max-w-3xl text-xl"
          >
            Experience comprehensive task management with rich attributes,
            comments, filtering, and detailed views.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {["To Do", "In Progress", "Done"].map((status, columnIndex) => (
            <motion.div key={status} variants={fadeInUp} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{status}</h3>
                <Badge variant="secondary">
                  {mockTasks.filter((task) => task.status === status).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {mockTasks
                  .filter((task) => task.status === status)
                  .map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: columnIndex * 0.1 + taskIndex * 0.1,
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        },
                      }}
                    >
                      <Card className="cursor-pointer transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm leading-tight font-medium">
                              {task.title}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                            >
                              <Flag className="mr-1 h-3 w-3" />
                              {task.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {task.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={task.assignee.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {task.assignee.initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{task.dueDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-muted-foreground flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.comments}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{task.attachments}</span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusColors[task.status as keyof typeof statusColors]}`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
