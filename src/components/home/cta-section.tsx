"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import type { JSX } from "react";
import { fadeInUp, staggerContainer } from "@/lib/animation/animation";

export function CtaSection(): JSX.Element {
  return (
    <section className="bg-muted/50 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-6 text-3xl font-bold md:text-4xl"
          >
            Ready to Transform Your Project Management?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mb-8 text-xl"
          >
            Join thousands of teams already using our platform to deliver
            projects faster and more efficiently.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="px-8 text-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-lg">
              Schedule Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
