"use client";

import { motion } from "framer-motion";
import {
  Kanban,
  MousePointer,
  Edit3,
  Columns,
  FileText,
  MessageSquare,
  Filter,
  Eye,
  BarChart3,
  Target,
  Calendar,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animation/animation";
import type { JSX } from "react";

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
};

const features: Feature[] = [
  {
    icon: Kanban,
    title: "Board Management",
    description: "Create and switch between multiple project boards with ease",
    category: "Core",
  },
  {
    icon: MousePointer,
    title: "Drag & Drop",
    description:
      "Full drag-and-drop support for tasks using advanced interactions",
    category: "Core",
  },
  {
    icon: Edit3,
    title: "Task CRUD",
    description:
      "Complete Create, Read, Update, Delete operations for all tasks",
    category: "Core",
  },
  {
    icon: Columns,
    title: "Column Structure",
    description:
      "Customizable columns (To Do, In Progress, Done) for any workflow",
    category: "Core",
  },
  {
    icon: FileText,
    title: "Rich Task Attributes",
    description:
      "Title, description, status, assignee, priority, due date, tags, attachments",
    category: "Tasks",
  },
  {
    icon: MessageSquare,
    title: "Task Comments",
    description: "Full commenting system with timestamps and user attribution",
    category: "Tasks",
  },
  {
    icon: Filter,
    title: "Task Filtering",
    description:
      "Filter by assignee, tags, priority, status, and due date ranges",
    category: "Tasks",
  },
  {
    icon: Eye,
    title: "Task Detail View",
    description: "Comprehensive drawer with editing capabilities",
    category: "Tasks",
  },
  {
    icon: Target,
    title: "Completion Rate",
    description: "Visual progress tracking with completion percentages",
    category: "Analytics",
  },
  {
    icon: BarChart3,
    title: "Task Distribution",
    description: "Charts showing tasks by status and priority",
    category: "Analytics",
  },
  {
    icon: Calendar,
    title: "Key Metrics",
    description: "Total tasks, completed tasks, overdue tasks tracking",
    category: "Analytics",
  },
  {
    icon: Tag,
    title: "Visual Charts",
    description: "Interactive charts using advanced visualization libraries",
    category: "Analytics",
  },
];

const categoryColors = {
  Core: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Tasks: "bg-green-500/10 text-green-600 dark:text-green-400",
  Analytics: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function FeaturesSection(): JSX.Element {
  return (
    <section id="features" className="bg-muted/30 py-24">
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
            Powerful Features for Modern Teams
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mx-auto max-w-3xl text-xl"
          >
            Everything you need to manage projects efficiently, from simple task
            tracking to advanced analytics and team collaboration.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
            >
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className={`rounded-lg p-2 ${categoryColors[feature.category as keyof typeof categoryColors]}`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <span className="text-muted-foreground text-xs font-medium">
                      {feature.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
