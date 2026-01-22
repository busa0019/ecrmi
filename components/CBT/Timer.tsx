"use client";
import { useEffect, useState } from "react";

export default function Timer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onExpire]);

  const minutes = Math.floor(time / 60);
  const secs = time % 60;

  return (
    <div className="text-red-600 font-semibold">
      Time Left: {minutes}:{secs.toString().padStart(2, "0")}
    </div>
  );
}