"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Target, ChevronLeft, ChevronRight, Plus, Check, X, Crosshair } from "lucide-react";
import { getWeeklyGoals, createWeeklyGoal, toggleWeeklyGoal, deleteWeeklyGoal } from "@/lib/actions/study";
import { WeeklyGoal } from "@/lib/mock-data";

/** Returns the Monday (ISO date string) of the week containing `date`. */
function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toLocalISO(d);
}

function toLocalISO(d: Date): string {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function WeeklyGoalBoard() {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(today));
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const todayMonday = getMonday(today);
  const isCurrentWeek = currentWeekStart === todayMonday;

  const weekEnd = addDays(currentWeekStart, 6);
  const weekLabel = `${formatShortDate(currentWeekStart)} – ${formatShortDate(weekEnd)}`;

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWeeklyGoals(currentWeekStart);
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAdd = async () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    setNewGoalTitle("");
    // optimistic
    const tempId = crypto.randomUUID();
    setGoals(prev => [...prev, { id: tempId, title, isCompleted: false, weekStart: currentWeekStart }]);
    try {
      await createWeeklyGoal(title, currentWeekStart);
    } catch (err) {
      console.error(err);
    } finally {
      await fetchGoals();
    }
  };

  const handleToggle = async (goal: WeeklyGoal) => {
    // optimistic
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, isCompleted: !g.isCompleted } : g));
    try {
      await toggleWeeklyGoal(goal.id, !goal.isCompleted);
    } catch (err) {
      console.error(err);
      await fetchGoals();
    }
  };

  const handleDelete = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await deleteWeeklyGoal(id);
    } catch (err) {
      console.error(err);
      await fetchGoals();
    }
  };

  const goToPrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const goToNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const goToThisWeek = () => setCurrentWeekStart(todayMonday);

  const completedCount = goals.filter(g => g.isCompleted).length;
  const totalCount = goals.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-panel p-6 rounded-xl border border-card-border">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Week Goals
          </h3>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {weekLabel}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToPrevWeek} className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-primary-container/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrentWeek && (
            <button onClick={goToThisWeek} className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-primary bg-primary-container/10 hover:bg-primary-container/20 rounded transition-colors">
              Now
            </button>
          )}
          <button onClick={goToNextWeek} className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-primary-container/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount >= 4 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
              Progress
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? "linear-gradient(90deg, var(--primary-container), var(--primary-color))"
                  : "var(--primary-container)",
                boxShadow: progress === 100
                  ? "0 0 12px rgba(0, 242, 255, 0.4)"
                  : "none",
              }}
            />
          </div>
          {progress === 100 && (
            <p className="font-mono text-xs text-primary mt-2 text-center animate-pulse">
              ✦ All goals crushed this week! ✦
            </p>
          )}
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-1.5 mb-4 max-h-[280px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
        {loading ? (
          <div className="py-6 text-center">
            <div className="inline-block w-4 h-4 border-2 border-primary-container/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="py-8 text-center">
            <Crosshair className="w-8 h-8 text-outline mx-auto mb-3 opacity-40" />
            <p className="font-mono text-xs text-outline leading-relaxed">
              {isCurrentWeek
                ? "No goals set for this week.\nAdd your first study target below."
                : "No goals were set\nfor this week."}
            </p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-2.5 group/goal py-1.5 px-2 rounded-lg hover:bg-surface-variant/30 transition-colors"
            >
              <button
                onClick={() => handleToggle(goal)}
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  goal.isCompleted
                    ? "bg-primary-container border-primary-container"
                    : "border-outline-variant hover:border-primary"
                }`}
              >
                {goal.isCompleted && <Check className="w-2.5 h-2.5 text-on-primary-container" />}
              </button>
              <span
                className={`text-base flex-1 transition-colors leading-snug ${
                  goal.isCompleted
                    ? "line-through text-outline"
                    : "text-on-surface"
                }`}
              >
                {goal.title}
              </span>
              <button
                onClick={() => handleDelete(goal.id)}
                className="opacity-0 group-hover/goal:opacity-100 p-0.5 hover:text-error transition-all text-on-surface-variant flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-card-border/50">
        <input
          type="text"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          placeholder="Add a study goal..."
          className="flex-1 bg-transparent border-b border-outline-variant/50 text-sm text-on-surface py-1.5 px-0 focus:border-primary outline-none transition-colors placeholder:text-outline font-mono"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newGoalTitle.trim()}
          className="p-1.5 text-primary hover:bg-primary-container/20 rounded transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
