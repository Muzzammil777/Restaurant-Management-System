// Centralized Button System with All States
// Import this in components that need consistent button behavior

import { cn } from "@/app/components/ui/utils";

export const buttonStyles = {
  // Base button styles
  base: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  
  // Height standards
  heights: {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-6 text-base",  // Standard height
    lg: "h-12 px-8 text-lg",
  },
  
  // Primary action (right side)
  primary: "bg-primary text-white hover:bg-primary/90",
  
  // Secondary action (left side)
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  
  // Destructive action (separated, red)
  destructive: "bg-red-600 text-white hover:bg-red-700",
  
  // Success state
  success: "bg-green-600 text-white hover:bg-green-700",
  
  // Disabled state
  disabled: "opacity-50 cursor-not-allowed pointer-events-none",
  
  // Ghost button
  ghost: "bg-transparent hover:bg-accent/50 text-gray-700 transition-all",
  
  // Outline button
  outline: "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white",
  
  // Filter button
  filter: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium px-4 py-2 rounded-full",
  
  // Toggle button
  toggle: "border border-gray-300 bg-white text-gray-700 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary font-medium",
};

// Button spacing in modals
export const modalButtonLayout = {
  container: "flex gap-3 pt-6",
  leftButton: "flex-1", // Secondary
  rightButton: "flex-1", // Primary
  destructiveSeparate: "ml-auto", // Separated destructive action
};

// Pressed state animation
export const pressedAnimation = "active:scale-[0.98] active:shadow-inner";

// Enhanced filter pill buttons (for search results, role filters, etc)
export const filterPillButton = "px-4 py-2 rounded-full border-2 border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:shadow-md hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all";

// Enhanced mini button (for badges, small actions)
export const miniButton = "px-2 py-1 rounded-md text-xs font-semibold bg-white border border-gray-300 hover:shadow-sm active:bg-gray-100 transition-all";

// Usage example:
// <button className={cn(buttonStyles.base, buttonStyles.heights.md, buttonStyles.primary, pressedAnimation)}>
//   Save Changes
// </button>
