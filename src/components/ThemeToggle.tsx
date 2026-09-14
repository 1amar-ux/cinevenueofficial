import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme, ThemeMode } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "dropdown" | "segmented";
}

export default function ThemeToggle({ className = "", variant = "dropdown" }: ThemeToggleProps) {
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: "light", label: "Light", icon: Sun },
    { mode: "dark", label: "Dark", icon: Moon },
    { mode: "system", label: "System", icon: Laptop },
  ];

  const CurrentIcon = themeMode === "system" ? Laptop : effectiveTheme === "light" ? Sun : Moon;

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex p-1 rounded-xl bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {options.map(({ mode, label, icon: Icon }) => {
          const isSelected = themeMode === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setThemeMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-gold text-black shadow-md shadow-gold/20 font-bold"
                  : "text-text-secondary hover:text-gold hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current theme: ${themeMode}. Click to change theme.`}
        title={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-white/10 hover:border-gold/50 text-text-primary hover:text-gold transition-all duration-150 cursor-pointer text-xs font-medium active:scale-95 shadow-sm"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-gold shrink-0 transition-transform duration-200" />
        <span className="hidden sm:inline capitalize">{themeMode}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Select theme"
          className="absolute right-0 mt-2 w-36 rounded-xl bg-[#121215] text-[#F3F4F6] border border-gold/30 shadow-2xl shadow-black/80 backdrop-blur-xl p-1 z-[100] animate-fade-in divide-y divide-white/5"
        >
          <div className="py-1">
            {options.map(({ mode, label, icon: Icon }) => {
              const isSelected = themeMode === mode;
              return (
                <button
                  key={mode}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setThemeMode(mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gold/15 text-gold font-bold"
                      : "text-text-secondary hover:text-gold hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-gold" : "text-text-muted"}`} />
                    <span>{label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
