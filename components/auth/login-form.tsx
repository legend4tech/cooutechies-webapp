"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/actions/auth";
import { loginSchema } from "@/lib/auth.schema";
import type { LoginPayload } from "@/types/auth.types";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/**
 * Login Page Component
 * Handles admin authentication with email and password
 */
export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Handle form submission
   * Authenticates user via server action
   */
  async function onSubmit(values: LoginPayload) {
    startTransition(async () => {
      try {
        const response = await loginAction(values);

        // If we get a response with success, show it
        if (response?.success) {
          toast.success("Login successful!", {
            description: "Redirecting to admin dashboard...",
          });
        } else if (response) {
          // Handle error response
          toast.error("Login failed", {
            description: response.error || response.message,
          });
        }
        // If signIn redirects successfully, this code won't execute
        // as the page will navigate away
      } catch (error) {
        // signIn throws a NEXT_REDIRECT error on success
        // which Next.js handles automatically, so we ignore it
        console.error("Login error:", error);

        // Only show error toast for actual errors
        if (
          error instanceof Error &&
          !error.message.includes("NEXT_REDIRECT")
        ) {
          toast.error("Login failed", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-2xl p-8 border border-border/50 shadow-2xl backdrop-blur-xl bg-card/80">
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Admin Dashboard
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold text-foreground mb-2"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground"
            >
              Sign in to access your admin dashboard
            </motion.p>
          </motion.div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          autoComplete="email"
                          disabled={isPending}
                          className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isPending}
                          className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Create Account Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-4"
              >
                <p className="text-sm text-muted-foreground">
                  credentials not working?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Create Another Account
                  </Link>
                </p>
              </motion.div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
