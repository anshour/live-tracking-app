import React, { useState, useEffect } from "react";
import { Card, IconButton, StatusIndicator } from "../ui";
import { useTrackerData } from "~/context";
import dayjs from "dayjs";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const StatusInfoCard = () => {
  const { status } = useTrackerData();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(dayjs().format("dddd, MMMM YYYY HH:mm:ss"));

    const interval = setInterval(() => {
      setCurrentTime(dayjs().format("dddd, MMMM YYYY HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="absolute top-2 left-2 z-10 w-full max-w-100 flex items-center gap-1">
      <div>
        <Link href="/">
          <IconButton aria-label="back" variant="ghost" icon={ChevronLeft}>
            a
          </IconButton>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <StatusIndicator status={status} />
        <p className="font-semibold">{status}</p>
      </div>
      <p className="text-xs text-gray-500">{currentTime}</p>
    </Card>
  );
};
