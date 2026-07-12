"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flame, CheckCircle2, X, Loader2 } from "lucide-react";
import { getConsistencyData, toggleConsistencyDay } from "@/lib/actions/gym";

interface ConsistencyLog {
  date: string;
  completed: boolean;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ConsistencyTracker() {
  const [consistencyLogs, setConsistencyLogs] = useState<ConsistencyLog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayStr = toDateStr(now);

  const fetchConsistency = useCallback(async () => {
    try {
      const data = await getConsistencyData();
      // Normalize dates from DB (Supabase DATE type can return "2026-07-09T00:00:00" or "2026-07-09")
      const normalized = (data || []).map((l: any) => ({
        date: l.date?.split("T")[0] || l.date,
        completed: l.completed,
      }));
      setConsistencyLogs(normalized);
    } catch (e) {
      console.error("[Consistency] Failed to fetch:", e);
    }
  }, []);

  useEffect(() => {
    fetchConsistency();
  }, [fetchConsistency]);

  const handleToggleDay = async (dateStr: string) => {
    setTogglingDate(dateStr);
    
    // Optimistic update
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
      // Refetch to confirm server state
      await fetchConsistency();
    } catch (e) {
      console.error("[Consistency] Toggle failed:", e);
      // Revert on error
      await fetchConsistency();
    } finally {
      setTogglingDate(null);
    }
  };

  const handleFinishCycle = async () => {
    setIsGenerating(true);
    setReportError(null);
    try {
      const res = await fetch("/api/gym/report", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.report) {
        setReportHtml(data.report);
      } else {
        setReportError(data.error || "Failed to generate report.");
      }
    } catch (e) {
      console.error(e);
      setReportError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Build monthly calendar grid ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // getDay() returns 0=Sun, we want 0=Mon
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon, 6=Sun

  // Build weeks array
  const weeks: { 
    weekNum: number; 
    days: { dateStr: string | null; dayOfMonth: number | null; dow: number; isCompleted: boolean; isToday: boolean; isRestDay: boolean; isFuture: boolean }[] 
  }[] = [];

  let currentWeekDays: typeof weeks[0]["days"] = [];

  // Pad the first week with nulls
  for (let i = 0; i < startDow; i++) {
    currentWeekDays.push({ dateStr: null, dayOfMonth: null, dow: i, isCompleted: false, isToday: false, isRestDay: false, isFuture: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = toDateStr(date);
    const dow = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const log = consistencyLogs.find((l) => l.date === dateStr);
    // Rest days: Saturday (5) and Sunday (6) in our 0=Mon scheme
    const isRestDay = dow === 5 || dow === 6;
    const isFuture = dateStr > todayStr;

    currentWeekDays.push({
      dateStr,
      dayOfMonth: day,
      dow,
      isCompleted: log?.completed || false,
      isToday: dateStr === todayStr,
      isRestDay,
      isFuture,
    });

    if (dow === 6 || day === daysInMonth) {
      // Pad the last week with nulls
      while (currentWeekDays.length < 7) {
        currentWeekDays.push({ dateStr: null, dayOfMonth: null, dow: currentWeekDays.length, isCompleted: false, isToday: false, isRestDay: true, isFuture: true });
      }
      weeks.push({ weekNum: weeks.length + 1, days: currentWeekDays });
      currentWeekDays = [];
    }
  }

  // --- Calculate streak (gym days only, within current month) ---
  let streak = 0;
  const checkDate = new Date(now);

  // If today isn't completed yet and it's a gym day, start from yesterday
  const todayDow = (checkDate.getDay() + 6) % 7;
  if (todayDow <= 4) {
    if (!consistencyLogs.find((l) => l.date === todayStr && l.completed)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    checkDate.setDate(checkDate.getDate() - (todayDow - 4));
  }

  while (true) {
    const dStr = toDateStr(checkDate);
    const dMonth = checkDate.getMonth();
    const dYear = checkDate.getFullYear();

    if (dMonth !== currentMonth || dYear !== currentYear) break;

    const dow = (checkDate.getDay() + 6) % 7;
    if (dow === 5 || dow === 6) {
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

  // Calculate monthly consistency percentage (only count past/today gym days)
  const totalGymDays = weeks.reduce((acc, w) => 
    acc + w.days.filter(d => d.dateStr && !d.isRestDay && !d.isFuture).length, 0
  );
  const completedGymDays = consistencyLogs.filter(l => {
    const [y, m] = l.date.split("-").map(Number);
    return l.completed && (m - 1) === currentMonth && y === currentYear;
  }).length;
  const consistency = totalGymDays > 0 ? Math.round((completedGymDays / totalGymDays) * 100) : 0;

  const monthName = now.toLocaleString("en-US", { month: "long" });

  return (
    <>
      <div className="glass-panel p-6 rounded-xl border border-card-border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-on-surface">Consistency</h3>
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              {monthName} — {completedGymDays}/{totalGymDays} gym days
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-primary-container font-bold">
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
              <div key={label} className={`flex-1 text-center font-mono text-[9px] uppercase tracking-widest ${i >= 5 ? 'text-outline/50' : 'text-on-surface-variant'}`}>
                {label}
              </div>
            ))}
          </div>
          <div className="w-8" />
        </div>

        {/* Weekly grid */}
        <div className="space-y-2">
          {weeks.map((w) => {
            const completedWeekdays = w.days.filter(d => d.dateStr && !d.isRestDay && d.isCompleted && !d.isFuture).length;
            const totalWeekdays = w.days.filter(d => d.dateStr && !d.isRestDay && !d.isFuture).length;
            
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
                              ? day.isRestDay
                                ? "bg-secondary-container/60 shadow-[0_0_6px_rgba(100,200,255,0.15)] cursor-pointer hover:brightness-110 active:scale-95"
                                : "bg-primary-container shadow-[0_0_8px_rgba(0,242,255,0.2)] cursor-pointer hover:brightness-110 active:scale-95"
                              : day.isToday
                                ? "bg-primary-container/20 border-2 !border-primary-container border-dashed hover:bg-primary-container/40 cursor-pointer active:scale-95"
                                : day.isRestDay
                                  ? "bg-surface-container-high/40 hover:bg-surface-variant/60 cursor-pointer active:scale-95"
                                  : "bg-surface-container-high hover:bg-surface-variant cursor-pointer active:scale-95"
                        } ${isToggling ? 'animate-pulse' : ''}`}
                        title={`${day.dateStr}${day.isRestDay ? ' (rest day)' : ''} — Click to toggle`}
                      >
                        {!day.isFuture && (
                          <span className={`${
                            day.isCompleted 
                              ? 'text-on-primary-container font-bold opacity-80' 
                              : day.isToday 
                                ? 'text-primary-container font-bold'
                                : 'text-on-surface-variant/70'
                          }`}>
                            {day.dayOfMonth}
                          </span>
                        )}
                        
                        {isToggling && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-sm">
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="w-8 flex justify-end">
                  {totalWeekdays > 0 && completedWeekdays >= totalWeekdays && (
                    <CheckCircle2 className="w-4 h-4 text-primary-container" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-card-border/50 text-center flex flex-col items-center">
          <button
            onClick={handleFinishCycle}
            disabled={isGenerating}
            className="mb-4 bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate AI Report"
            )}
          </button>
          <p className="font-mono text-[10px] text-outline uppercase tracking-widest leading-relaxed">
            Success isn&apos;t always about greatness. It&apos;s about consistency.
          </p>
        </div>
      </div>

      {/* AI Report Modal */}
      {(reportHtml || reportError) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-card-border">
              <h2 className="font-display font-bold text-xl text-on-surface">
                {reportError ? "Report Error" : "🔥 Your AI Fitness Report"}
              </h2>
              <button
                onClick={() => { setReportHtml(null); setReportError(null); }}
                className="p-2 hover:bg-surface-variant rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {reportError ? (
                <p className="text-error font-mono text-sm">{reportError}</p>
              ) : (
                <div
                  className="prose prose-invert prose-sm max-w-none font-sans text-on-surface [&_h1]:text-primary-container [&_h2]:text-primary-container [&_h3]:text-secondary-container [&_strong]:text-on-surface [&_li]:text-on-surface-variant"
                  dangerouslySetInnerHTML={{ __html: reportHtml || "" }}
                />
              )}
            </div>
            <div className="p-4 border-t border-card-border text-center">
              <p className="text-xs font-mono text-outline">
                {reportError ? "" : "A copy has been sent to your email."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
