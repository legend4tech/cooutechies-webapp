"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@react-email/components";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about", isHash: true },
  { name: "Vision", href: "/#vision", isHash: true },
  { name: "Contact", href: "/#contact", isHash: true },
  { name: "Events", href: "/events", isHash: false },
  { name: "Biography", href: "/biography", isHash: false },
  { name: "Join The Community", href: "/register" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { setTheme, resolvedTheme } = useTheme();

  // Effect 1: Only set mounted flag on client-side
  useEffect(() => {
    // Mark component as mounted only after React has finished rendering
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, isHash: boolean) => {
    if (isHash) {
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Get current theme for logo selection
  const currentTheme = mounted ? resolvedTheme : "light";

  const logoSrc = (() => {
    if (isHomePage && !isScrolled) {
      return "/cooutechies-logo2.png"; // dark logo
    }
    return currentTheme === "dark"
      ? "/cooutechies-logo2.png"
      : "/cooutechies-logo1.png";
  })();

  // Determine navbar style based on scroll and page
  const getNavbarClasses = () => {
    if (isScrolled || !isHomePage) {
      return "navbar-glass py-2";
    }
    return "navbar-hero py-3";
  };

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${getNavbarClasses()}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="h-16" /> {/* Placeholder */}
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${getNavbarClasses()}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative group">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all duration-300 shadow-lg ${
                isScrolled || !isHomePage
                  ? "border-primary/40 bg-card/80 backdrop-blur-md group-hover:border-primary/60 group-hover:bg-card/90 shadow-primary/5"
                  : "border-white/20 bg-white/10 backdrop-blur-md group-hover:border-white/40 group-hover:bg-white/15 shadow-black/10"
              }`}
            >
              <Image
                src={logoSrc || "/placeholder.svg"}
                alt="COOU Techies"
                width={44}
                height={44}
                className="h-10 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
                priority
              />
            </div>
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                onClick={(e) => {
                  if (link.isHash) {
                    e.preventDefault();
                    handleNavClick(link.href, link.isHash);
                  }
                }}
                className={`relative px-4 py-2.5 text-sm font-bold transition-all duration-300 group inline-block rounded-lg ${
                  isScrolled || !isHomePage
                    ? "text-foreground hover:text-primary hover:bg-primary/10"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* CTA & Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="hidden lg:flex items-center gap-3"
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg border transition-all duration-300 backdrop-blur-md ${
              isScrolled || !isHomePage
                ? "border-border/30 bg-card/60 hover:bg-card/80 hover:border-primary/30"
                : "border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40"
            }`}
            aria-label="Toggle theme"
          >
            {currentTheme === "dark" ? (
              <svg
                className={`w-5 h-5 ${
                  isScrolled || !isHomePage ? "text-foreground" : "text-white"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 ${
                  isScrolled || !isHomePage ? "text-foreground" : "text-white"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* CTA Button */}
          <Button
            href="/register"
            className="relative overflow-hidden group bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 py-2.5 shadow-lg transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Join Us</span>
            <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </motion.div>

        {/* Mobile Toggle & Theme */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all duration-300 ${
              isScrolled || !isHomePage
                ? "border-border/30 bg-card/60 hover:bg-card/80"
                : "border-white/20 bg-white/10 hover:bg-white/20"
            }`}
            aria-label="Toggle theme"
          >
            {currentTheme === "dark" ? (
              <svg
                className={`w-5 h-5 ${
                  isScrolled || !isHomePage ? "text-foreground" : "text-white"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 ${
                  isScrolled || !isHomePage ? "text-foreground" : "text-white"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            className={`p-2 rounded-lg transition-all ${
              isScrolled || !isHomePage
                ? "text-foreground hover:bg-muted/40"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden navbar-glass-panel border-x border-b border-border/40 mt-2 mx-4 rounded-2xl overflow-hidden shadow-xl"
          >
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (link.isHash) {
                        e.preventDefault();
                        handleNavClick(link.href, link.isHash);
                      }
                      setIsMobileOpen(false);
                    }}
                    className="block px-4 py-3 text-foreground font-bold hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  href="/register"
                  className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg py-3 shadow-lg transition-all hover:scale-[1.02]"
                >
                  Join Us
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
