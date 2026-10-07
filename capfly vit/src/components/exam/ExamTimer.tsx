"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { formatTime, getRemainingMs } from "@/services/examService";

interface ExamTimerProps {
  startTime: number;
  durationMinutes: number;
  onExpire: () => void;
  darkMode?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  startTime,
  durationMinutes,
  onExpire,
  darkMode = false,
}) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(startTime, durationMinutes)
  );
  const dk = darkMode;

  useEffect(() => {
    const tick = () => {
      const rem = getRemainingMs(startTime, durationMinutes);
      setRemainingMs(rem);
      if (rem === 0) {
        onExpire();
      }
    };

    tick(); // immediate
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startTime, durationMinutes, onExpire]);

  const totalMs = durationMinutes * 60 * 1000;
  const fraction = remainingMs / totalMs;
  const isWarning = fraction < 0.2;
  const isCritical = fraction < 0.1;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-colors ${
        isCritical
          ? dk
            ? "bg-[#1c0101] border-[#7f1d1d] text-[#FCA5A5]"
            : "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]"
          : isWarning
          ? dk
            ? "bg-[#1c1500] border-[#92400e] text-[#FCD34D]"
            : "bg-[#FEF9C3] border-[#FDE68A] text-[#B45309]"
          : dk
          ? "bg-[#1C1A17] border-[#2E2B27] text-[#EDE8DF]"
          : "bg-[#FFFFFF] border-[#D6CEBE] text-[#24201D]"
      }`}
    >
      <Clock
        className={`w-3.5 h-3.5 ${isCritical ? "animate-pulse" : ""}`}
      />
      <span className={isCritical ? "animate-pulse" : ""}>
        {formatTime(remainingMs)}
      </span>
      {isWarning && (
        <AlertTriangle className="w-3.5 h-3.5" />
      )}
    </div>
  );
};
