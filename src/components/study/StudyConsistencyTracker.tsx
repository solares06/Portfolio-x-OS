"use client";

import React, { useState, useEffect } from "react";
import { Flame, CheckCircle2 } from "lucide-react";
import { getStudyConsistencyData, toggleStudyConsistencyDay } from "@/lib/actions/study";

interface ConsistencyLog {
  date: string;
  completed: boolean;
}

function getDayLabels() {
  return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
}

export default function StudyConsistencyTracker() {
  const [consistencyLogs, setConsistencyLogs] = useState<ConsistencyLog[]>([]);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  
  const toLocalISOString = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const fetchConsistency = async () => {
    const data = await getStudyConsistencyData();
    setConsistencyLogs(data);
  };

  useEffect(() => {
    fetchConsistency();
  }, []);

  const handleToggleDay = async (dateStr: string) => {
    if (togglingDate) return;
    setTogglingDate(dateStr);

    const exists = consistencyLogs.find((l) => l.date === dateStr);
    if (exists) {
      setConsistencyLogs((prev) =>
        prev.map((l) => (l.date === dateStr ? { ...l, completed: !l.completed } : l))
      );
    } else {
      setConsistencyLogs((prev) => [...prev, { date: dateStr, completed: true }]);
    }

    try {
      await toggleStudyConsistencyDay(dateStr);
    } catch (e) {
      console.error(e);
      fetchConsistency();
    } finally {
      setTogglingDate(null);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = toLocalISOString(now);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon, 6=Sun

  // Build weeks array
  const weeks: { 
    weekNum: number; 
    days: { dateStr: string | null; dayOfMonth: number | null; dow: number; isCompleted: boolean; isToday: boolean; isFuture: boolean }[] 
  }[] = [];

  let currentWeekDays: typeof weeks[0]["days"] = [];

  for (let i = 0; i < startDow; i++) {
    currentWeekDays.push({ dateStr: null, dayOfMonth: null, dow: i, isCompleted: false, isToday: false, isFuture: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = toLocalISOString(date);
    const dow = (date.getDay() + 6) % 7;
    const log = consistencyLogs.find((l) => l.date === dateStr);
    const isFuture = dateStr > todayStr;

    currentWeekDays.push({
      dateStr,
      dayOfMonth: day,
      dow,
      isCompleted: log?.completed || false,
      isToday: dateStr === todayStr,
      isFuture,
    });

    if (dow === 6 || day === daysInMonth) {
      while (currentWeekDays.length < 7) {
        currentWeekDays.push({ dateStr: null, dayOfMonth: null, dow: currentWeekDays.length, isCompleted: false, isToday: false, isFuture: true });
      }
      weeks.push({ weekNum: weeks.length + 1, days: currentWeekDays });
      currentWeekDays = [];
    }
  }

  // Calculate streak (every day counts)
  let streak = 0;
  const checkDate = new Date(now);

  if (!consistencyLogs.find((l) => l.date === todayStr && l.completed)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = toLocalISOString(checkDate);
    
    if (consistencyLogs.find((l) => l.date === dStr && l.completed)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const totalDays = weeks.reduce((acc, w) => acc + w.days.filter(d => d.dateStr && !d.isFuture).length, 0);
  const completedDays = consistencyLogs.filter(l => {
    const [y, m] = l.date.split("-").map(Number);
    return l.completed && (m - 1) === currentMonth && y === currentYear;
  }).length;
  const consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const monthName = now.toLocaleString("en-US", { month: "long" });

  const DAY_LABELS = getDayLabels();

  return (
    <div className="glass-panel p-6 rounded-xl border border-card-border h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-on-surface">Consistency</h3>
          <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
            {monthName} — {completedDays}/{totalDays} active days
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end text-primary font-bold">
            <Flame className="w-4 h-4" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="font-mono text-xs text-outline mt-1">{consistency}% Target Hit</div>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16" />
        <div className="flex-1 flex gap-1">
          {DAY_LABELS.map((label, i) => (
            <div key={label} className={`flex-1 text-center font-mono text-[9px] uppercase tracking-widest text-on-surface-variant`}>
              {label}
            </div>
          ))}
        </div>
        <div className="w-8" />
      </div>

      <div className="space-y-2">
        {weeks.map((w) => {
          const completedWeekdays = w.days.filter(d => d.dateStr && d.isCompleted && !d.isFuture).length;
          const totalWeekdays = w.days.filter(d => d.dateStr && !d.isFuture).length;
          
          return (
            <div key={w.weekNum} className="flex items-center gap-4">
              <div className="w-16 font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                Week {w.weekNum}
              </div>
              <div className="flex-1 flex gap-1">
                {w.days.map((day, i) => {
                  if (!day.dateStr) {
                    return <div key={i} className="flex-1 h-8 rounded-sm" />;
                  }

                  const isToggling = togglingDate === day.dateStr;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !day.isFuture && handleToggleDay(day.dateStr!)}
                      disabled={day.isFuture || isToggling}
                      className={`flex-1 h-8 rounded-sm transition-all relative flex items-center justify-center text-[9px] font-mono border-0 outline-none ${
                        day.isFuture
                          ? "bg-surface-container-high/30 cursor-default opacity-30"
                          : day.isCompleted
                            ? "bg-primary-container shadow-[0_0_8px_rgba(0,242,255,0.2)] cursor-pointer hover:brightness-110 active:scale-95 text-on-primary-container font-bold"
                            : day.isToday
                              ? "bg-primary-container/10 border border-primary-container border-dashed hover:bg-primary-container/30 cursor-pointer text-primary"
                              : "bg-surface-container-high hover:bg-surface-variant cursor-pointer text-on-surface-variant"
                      }`}
                      title={day.dateStr}
                    >
                      {day.dayOfMonth}
                    </button>
                  );
                })}
              </div>
              <div className="w-8 flex justify-end">
                {completedWeekdays === 7 && <CheckCircle2 className="w-4 h-4 text-primary" />}
                {completedWeekdays > 0 && completedWeekdays < 7 && <div className="text-[10px] font-mono text-on-surface-variant">{completedWeekdays}/7</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-card-border/50 text-center">
        <p className="font-mono text-[10px] text-outline uppercase tracking-widest leading-relaxed">
          Small daily improvements are the key to staggering long-term results.
        </p>
      </div>
    </div>
  );
}
