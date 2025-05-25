"use client";

import { type JSX, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { signup } from "@/lib/actions/auth";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be less than 50 characters" }),
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
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUp = z.infer<typeof signupSchema>;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function SignUpForm(): JSX.Element {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUp>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUp) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await signup(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Account created successfully!");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                    <Input
                      placeholder="Enter your full name"
                      className={cn(
                        "h-12 pl-10 transition-colors",
                        "border",
                        form.formState.errors.name
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

        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={cn(
                        "h-12 pr-12 pl-10 transition-colors",
                        "border",
                        form.formState.errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500 dark:border-slate-700 dark:focus:border-blue-400",
                      )}
                      {...field}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
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
              disabled={isPending}
              className="h-12 w-full bg-gradient-to-r from-green-500 to-blue-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
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
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  );
}
