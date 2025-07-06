import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  children,
  isLoading = false,
  className = "",
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
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
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const iconSizeClasses = {
    small: "h-4 w-4",
    medium: "h-4 w-4",
    large: "h-5 w-5",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <Loader2
          className={`animate-spin ${iconSizeClasses[size]} ${children ? "mr-2" : ""}`}
        />
      )}
      {!isLoading && LeftIcon && (
        <LeftIcon
          className={`${iconSizeClasses[size]} ${children ? "mr-2" : ""}`}
        />
      )}
      {children}
      {!isLoading && RightIcon && (
        <RightIcon
          className={`${iconSizeClasses[size]} ${children ? "ml-2" : ""}`}
        />
      )}
    </button>
  );
};
