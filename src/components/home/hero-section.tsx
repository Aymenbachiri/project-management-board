"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JSX } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animation/animation";

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export function HeroSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="from-primary/5 via-background to-secondary/5 absolute inset-0 bg-gradient-to-br" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🚀 New: Advanced Analytics Dashboard
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="from-foreground to-foreground/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl lg:text-7xl"
          >
            Project Management
            <br />
            <span className="text-primary">Reimagined</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl md:text-2xl"
          >
            Streamline your workflow with powerful drag-and-drop boards,
            real-time collaboration, and intelligent analytics.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mb-12 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="group px-8 text-lg">
              Start Free Trial
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: CheckCircle,
                text: "Drag & Drop Tasks",
                color: "text-green-500",
              },
              {
                icon: Users,
                text: "Team Collaboration",
                color: "text-blue-500",
              },
              {
                icon: BarChart3,
                text: "Advanced Analytics",
                color: "text-purple-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                variants={floatingAnimation}
                animate="animate"
                style={{ animationDelay: `${index * 0.5}s` }}
                className="bg-card flex items-center justify-center space-x-2 rounded-lg border p-4"
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="bg-primary/10 absolute top-20 left-10 h-20 w-20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="bg-secondary/10 absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />
    </section>
  );
}
