import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon: LucideIcon;
  isLoading?: boolean;
  "aria-label": string; // Required for accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = "primary",
  size = "medium",
  icon: Icon,
  isLoading = false,
  className = "",
  disabled,
  "aria-label": ariaLabel,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline:
      "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
  };

  const sizeClasses = {
    small: "p-1.5",
    medium: "p-2",
    large: "p-3",
  };

  const iconSizeClasses = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`animate-spin ${iconSizeClasses[size]}`} />
      ) : (
        <Icon className={iconSizeClasses[size]} />
      )}
    </button>
  );
};
