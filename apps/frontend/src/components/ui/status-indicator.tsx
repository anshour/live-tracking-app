import React from "react";

interface Props {
  status: "connected" | "disconnected" | "reconnecting";
}

export const StatusIndicator: React.FC<Props> = ({ status }) => {
  const getStatusColors = () => {
    switch (status) {
      case "connected":
        return { ping: "bg-green-500", solid: "bg-green-600" };
      case "disconnected":
        return { ping: "bg-red-500", solid: "bg-red-600" };
      case "reconnecting":
        return { ping: "bg-yellow-500", solid: "bg-yellow-600" };
      default:
        return { ping: "bg-gray-500", solid: "bg-gray-600" };
    }
  };

  const colors = getStatusColors();

  return (
    <div className="relative h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colors.ping}`}
      ></span>
      <span
        className={`absolute inline-flex rounded-full h-3 w-3 ${colors.solid}`}
      ></span>
    </div>
  );
};
