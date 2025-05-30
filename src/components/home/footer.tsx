"use client";

import { fadeInUp } from "@/lib/animation/animation";
import { motion } from "framer-motion";
import { Kanban, Github, Heart } from "lucide-react";
import type { JSX } from "react";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Analytics", "Integrations", "API"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Support",
    links: ["Help Center", "Documentation", "Community", "Status"],
  },
];

export function Footer(): JSX.Element {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 gap-8 md:grid-cols-4"
        >
          <motion.div variants={fadeInUp} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Kanban className="text-primary h-8 w-8" />
              <span className="text-xl font-bold">ProjectFlow</span>
            </div>
            <p className="text-muted-foreground text-sm">
              The ultimate project management solution for modern teams.
            </p>
            <div className="flex space-x-4">
              {[Github].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="https://github.com/Aymenbachiri/project-management-board"
                  target="_blank"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {footerLinks.map((section) => (
            <motion.div
              key={section.title}
              variants={fadeInUp}
              className="space-y-4"
            >
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm"
        >
          <p>
            &copy; {new Date().getFullYear()} ProjectFlow. All rights reserved.
          </p>
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="fill-red-600 text-red-600" /> by{" "}
            <a
              className="underline"
              href="https://www.linkedin.com/in/aymen-bachiri-9442b5287/"
              target="_blank"
            >
              Aymen
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
