"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  Mail,
  User,
  Building2,
  MapPin,
  Code2,
  Target,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { submitRegistration } from "@/app/actions/registrations";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/validations";

const campuses = ["Uli Campus", "Igbariam Campus", "Awka Campus"];
const levels = ["100", "200", "300", "400", "500", "600"];

const PARTICLES = [
  { id: 0, delay: 0, x: 15, size: 3 },
  { id: 1, delay: 0.8, x: 25, size: 2.5 },
  { id: 2, delay: 1.6, x: 40, size: 4 },
  { id: 3, delay: 2.4, x: 55, size: 2.8 },
  { id: 4, delay: 3.2, x: 70, size: 3.5 },
  { id: 5, delay: 4, x: 85, size: 3.2 },
  { id: 6, delay: 0.5, x: 10, size: 3.8 },
  { id: 7, delay: 1.2, x: 30, size: 2.2 },
  { id: 8, delay: 2, x: 50, size: 4.5 },
  { id: 9, delay: 2.8, x: 65, size: 3.0 },
  { id: 10, delay: 3.6, x: 80, size: 2.7 },
  { id: 11, delay: 4.4, x: 90, size: 3.4 },
];

const FloatingParticle = ({
  delay,
  x,
  size,
}: {
  delay: number;
  x: number;
  size: number;
}) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="absolute rounded-full bg-primary/40"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        filter: "blur(1px)",
      }}
      initial={{ opacity: 0, y: "100vh" }}
      animate={{
        opacity: [0, 0.6, 0.6, 0],
        y: ["100vh", "-20vh"],
      }}
      transition={{
        duration: 10,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    />
  );
};

const AnimatedFormField = ({
  children,
  index,
  icon: Icon,
}: {
  children: React.ReactNode;
  index: number;
  icon: React.ElementType;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-lg bg-primary/10 blur-md pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative flex items-start gap-3">
        <motion.div
          className="mt-8 p-2 rounded-lg bg-primary/20 text-primary"
          animate={{ scale: isFocused ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        <div className="flex-1">{children}</div>
      </div>
    </motion.div>
  );
};

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const isFormInView = useInView(formRef, { once: true, margin: "-100px" });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      level: "",
      techSkills: "",
      aspiringSkills: "",
      reason: "",
      campus: "",
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitRegistration(data);

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Registration Successful! 🎉", {
          description:
            "Check your email for confirmation. Welcome to COOU Techies!",
        });
        form.reset();
      } else {
        toast.error("Registration Failed", {
          description:
            result.error === "EMAIL_EXISTS"
              ? "This email is already registered"
              : "Please try again or contact support",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden py-12 md:py-20">
      {/* Background Effects - keeping existing */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        {/* ... existing background elements ... */}
        {PARTICLES.map((p) => (
          <FloatingParticle key={p.id} delay={p.delay} x={p.x} size={p.size} />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-4xl">
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 py-8 px-4">
        <motion.div
          className="container mx-auto max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Title Section */}
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold tracking-wide">
                Join the Community
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className="text-gradient">Register</span>{" "}
              <span className="text-foreground">with Us</span>
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Become a member of{" "}
              <span className="text-primary font-semibold">COOU Techies</span>{" "}
              and connect with fellow tech enthusiasts
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isFormInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="relative glass rounded-2xl md:rounded-3xl p-6 md:p-10 border border-primary/20 overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AnimatedFormField index={0} icon={User}>
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground font-bold text-base">
                                    First Name{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your first name"
                                      className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                      {...field}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </AnimatedFormField>

                          <AnimatedFormField index={1} icon={User}>
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground font-bold text-base">
                                    Last Name{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your last name"
                                      className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                      {...field}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </AnimatedFormField>
                        </div>

                        <AnimatedFormField index={2} icon={Mail}>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Email Address{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={3} icon={Building2}>
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Department{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your department"
                                    className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={4} icon={GraduationCap}>
                          <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Level{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20">
                                      <SelectValue placeholder="Select your level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {levels.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level} Level
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={5} icon={Code2}>
                          <FormField
                            control={form.control}
                            name="techSkills"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Technical Skills (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="e.g., Python, React, Node.js, SQL..."
                                    className="resize-none bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-24 "
                                    rows={3}
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={6} icon={Target}>
                          <FormField
                            control={form.control}
                            name="aspiringSkills"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Skills You Want to Learn (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="What skills are you aspiring to develop?"
                                    className="resize-none bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-24"
                                    rows={3}
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={7} icon={MapPin}>
                          <FormField
                            control={form.control}
                            name="campus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Campus{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20">
                                      <SelectValue placeholder="Select your campus" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {campuses.map((campus) => (
                                      <SelectItem key={campus} value={campus}>
                                        {campus}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <AnimatedFormField index={8} icon={FileText}>
                          <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground font-bold text-base">
                                  Why do you want to join?{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us what brought you here..."
                                    className="resize-none bg-background/60 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-24"
                                    rows={4}
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </AnimatedFormField>

                        <motion.div
                          className="pt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 text-base font-semibold"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              "Complete Registration"
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                      className="mb-6"
                    >
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                    </motion.div>

                    <motion.h2
                      className="text-2xl md:text-3xl font-bold mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Welcome to COOU Techies!
                    </motion.h2>

                    <motion.p
                      className="text-muted-foreground text-lg mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Check your email for confirmation details and WhatsApp
                      community link.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Register Another Person
                      </Button>
                      <Link href="/">
                        <Button variant="outline" size="lg">
                          Back to Home
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
