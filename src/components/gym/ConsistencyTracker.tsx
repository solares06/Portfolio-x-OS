"use client";

import React, { useState, useEffect } from "react";
import { Flame, CheckCircle2 } from "lucide-react";
import { getConsistencyData, toggleConsistencyDay } from "@/lib/actions/gym";

interface ConsistencyLog {
  date: string;
  completed: boolean;
}

function getCycleStartDate() {
  const d = new Date();
  d.setDate(1);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export default function ConsistencyTracker() {
  const [consistencyLogs, setConsistencyLogs] = useState<ConsistencyLog[]>([]);
  const cycleStartDate = getCycleStartDate();

  const toLocalISOString = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const fetchConsistency = async () => {
    const data = await getConsistencyData();
    setConsistencyLogs(data);
  };

  useEffect(() => {
    fetchConsistency();
  }, []);

  const handleToggleDay = async (dateStr: string) => {
    const exists = consistencyLogs.find((l) => l.date === dateStr);
    if (exists) {
      setConsistencyLogs((prev) =>
        prev.map((l) => (l.date === dateStr ? { ...l, completed: !l.completed } : l))
      );
    } else {
      setConsistencyLogs((prev) => [...prev, { date: dateStr, completed: true }]);
    }

    try {
      await toggleConsistencyDay(dateStr);
    } catch (e) {
      console.error(e);
      fetchConsistency();
    }
  };

  const handleFinishCycle = async () => {
    try {
      const res = await fetch("/api/gym/report", { method: "POST" });
      if (res.ok) {
        alert("AI Report sent to your email!");
      } else {
        alert("Failed to generate report.");
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering report");
    }
  };

  const weeks = Array.from({ length: 4 }, (_, weekIndex) => {
    const days = Array.from({ length: 5 }, (_, dayIndex) => {
      const date = new Date(cycleStartDate);
      date.setDate(cycleStartDate.getDate() + weekIndex * 7 + dayIndex);
      const dateStr = toLocalISOString(date);

      const log = consistencyLogs.find((l) => l.date === dateStr);
      return {
        dateStr,
        isCompleted: log?.completed || false,
        isToday: dateStr === toLocalISOString(new Date()),
      };
    });

    return {
      week: weekIndex + 1,
      days,
      daysCompleted: days.filter((d) => d.isCompleted).length,
    };
  });

  const totalCompleted = weeks.reduce((acc, w) => acc + w.daysCompleted, 0);
  const consistency = Math.round((totalCompleted / 20) * 100) || 0;

  let streak = 0;
  const todayStr = toLocalISOString(new Date());
  const checkDate = new Date();
  if (!consistencyLogs.find((l) => l.date === todayStr && l.completed)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = toLocalISOString(checkDate);
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    if (consistencyLogs.find((l) => l.date === dStr && l.completed)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-card-border">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-on-surface">Consistency</h3>
          <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">4 Week Program</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end text-primary-container font-bold">
            <Flame className="w-4 h-4" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="font-mono text-xs text-outline mt-1">{consistency}% Target Hit</div>
        </div>
      </div>

      <div className="space-y-4">
        {weeks.map((w) => (
          <div key={w.week} className="flex items-center gap-4">
            <div className="w-16 font-mono text-xs text-on-surface-variant uppercase tracking-widest">
              Week {w.week}
            </div>
            <div className="flex-1 flex gap-1">
              {w.days.map((day, i) => (
                <div
                  key={i}
                  onClick={() => handleToggleDay(day.dateStr)}
                  className={`flex-1 h-6 rounded-sm cursor-pointer transition-colors ${
                    day.isCompleted
                      ? "bg-primary-container shadow-[0_0_8px_rgba(0,242,255,0.2)]"
                      : day.isToday
                        ? "bg-primary-container/20 border border-primary-container border-dashed hover:bg-primary-container/40"
                        : "bg-surface-container-high hover:bg-surface-variant"
                  }`}
                  title={day.dateStr}
                />
              ))}
            </div>
            <div className="w-8 flex justify-end">
              {w.daysCompleted === 5 && <CheckCircle2 className="w-4 h-4 text-primary-container" />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-card-border/50 text-center flex flex-col items-center">
        <button
          onClick={handleFinishCycle}
          className="mb-4 bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all"
        >
          Finish Cycle (AI Report)
        </button>
        <p className="font-mono text-[10px] text-outline uppercase tracking-widest leading-relaxed">
          Success isn&apos;t always about greatness. It&apos;s about consistency.
        </p>
      </div>
    </div>
  );
}
