import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "small" | "medium" | "large";
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  size = "medium",
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = "",
  id,
  disabled,
  ...props
}) => {
  const inputId = id || `input-${props.name}`;

  const baseClasses =
    "w-full border rounded transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 focus:border-sky-500 focus:ring-sky-500";

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-5 py-3 text-lg",
  };

  const iconSizeClasses = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6",
  };

  const inputClasses = `${baseClasses} ${sizeClasses[size]} ${
    leftIcon ? "pl-10" : ""
  } ${rightIcon ? "pr-10" : ""} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`text-gray-400 ${iconSizeClasses[size]}`}>
              {leftIcon}
            </div>
          </div>
        )}
        <input
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className={`text-gray-400 ${iconSizeClasses[size]}`}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};
