"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { type JSX, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

type FormData = z.infer<typeof formSchema>;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function SignInForm(): JSX.Element {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormData) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form submitted:", values);

    // Here you would typically handle the authentication
    // For example: await signIn(values.email, values.password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-0 bg-white/80 shadow-2xl backdrop-blur-sm dark:bg-slate-900/80">
          <motion.div variants={itemVariants}>
            <CardHeader className="space-y-1 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Lock className="h-6 w-6 text-white" />
              </motion.div>
              <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
          </motion.div>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700 dark:text-slate-300">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                            <Input
                              placeholder="Enter your email"
                              className={cn(
                                "h-12 pl-10 transition-colors",
                                "border",
                                form.formState.errors.email
                                  ? "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500"
                                  : "border-slate-200 focus:border-blue-500 dark:border-slate-700 dark:focus:border-blue-400",
                              )}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-slate-700 dark:text-slate-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className={cn(
                                "h-12 pr-12 pl-10 transition-colors",
                                "border",
                                form.formState.errors.password
                                  ? "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500"
                                  : "border-slate-200 focus:border-blue-500 dark:border-slate-700 dark:focus:border-blue-400",
                              )}
                              {...field}
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <motion.div
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                        />
                      ) : (
                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </Form>

            <motion.div variants={itemVariants} className="pt-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign up here
                </motion.a>
              </p>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Protected by industry-standard encryption
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
