import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  const classes = `bg-white shadow-md rounded-lg p-4 ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
