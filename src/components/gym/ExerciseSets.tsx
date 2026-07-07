"use client";

import React, { useState, useEffect } from "react";
import { updateSetLogs } from "@/lib/actions/gym";

interface LogEntry {
  id: number;
  kg: string;
  reps: string;
  rpe: string;
  completed: boolean;
}

interface ExerciseSetInput {
  id: string;
  details?: string;
  logs?: LogEntry[];
}

export default function ExerciseSets({ exerciseSet }: { exerciseSet: ExerciseSetInput }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (exerciseSet.logs && exerciseSet.logs.length > 0) {
      setLogs(exerciseSet.logs);
    } else {
      // Initialize with 3 sets if empty
      setLogs([
        { id: 1, kg: "", reps: "", rpe: "", completed: false },
        { id: 2, kg: "", reps: "", rpe: "", completed: false },
        { id: 3, kg: "", reps: "", rpe: "", completed: false },
      ]);
    }
  }, [exerciseSet]);

  const handleUpdateLog = (index: number, field: keyof LogEntry, value: string | boolean | number) => {
    const newLogs = [...logs];
    newLogs[index] = { ...newLogs[index], [field]: value };
    setLogs(newLogs);
  };

  const handleSave = async (index: number) => {
    const newLogs = [...logs];
    newLogs[index].completed = !newLogs[index].completed;
    setLogs(newLogs);
    try {
      await updateSetLogs(exerciseSet.id, newLogs);
    } catch (err) {
      console.error(err);
      alert("Failed to save set.");
    }
  };

  const handleAddSet = () => {
    const newLogs = [...logs, { id: logs.length + 1, kg: "", reps: "", rpe: "", completed: false }];
    setLogs(newLogs);
  };

  const handleRemoveSet = async (index: number) => {
    const newLogs = logs.filter((_, i) => i !== index);
    setLogs(newLogs);
    try {
      await updateSetLogs(exerciseSet.id, newLogs);
    } catch (err) {
      console.error(err);
      alert("Failed to save after removing set.");
    }
  };

  return (
    <div className="bg-surface-container/30 p-4 border-t border-card-border/50 space-y-2">
      <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-mono tracking-widest text-outline px-2 mb-2 text-center">
        <div className="col-span-1">Set</div>
        <div className="col-span-3">kg</div>
        <div className="col-span-3">Reps</div>
        <div className="col-span-3">RPE</div>
        <div className="col-span-2">Actions</div>
      </div>

      {logs.map((log, index) => (
        <div key={log.id} className={`grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-lg ${log.completed ? 'bg-primary-container/5' : ''}`}>
          <div className="col-span-1 text-center">
            <span className={`w-5 h-5 inline-flex items-center justify-center rounded text-xs font-mono font-bold ${log.completed ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {index + 1}
            </span>
          </div>
          <div className="col-span-3">
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded text-center text-sm py-1 focus:border-primary-container outline-none text-on-surface" 
              value={log.kg}
              onChange={(e) => handleUpdateLog(index, 'kg', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-3">
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded text-center text-sm py-1 focus:border-primary-container outline-none text-on-surface" 
              value={log.reps}
              onChange={(e) => handleUpdateLog(index, 'reps', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-3">
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded text-center text-sm py-1 focus:border-primary-container outline-none text-on-surface" 
              value={log.rpe}
              onChange={(e) => handleUpdateLog(index, 'rpe', e.target.value)}
              placeholder="-"
            />
          </div>
          <div className="col-span-2 flex items-center justify-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleSave(index);
              }}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${log.completed ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-outline hover:text-primary-container'}`}
            >
              ✓
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSet(index);
              }}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors bg-surface-container-high text-outline hover:bg-error hover:text-on-error"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      
      <div className="pt-2 text-center">
        <button 
          onClick={(e) => { e.stopPropagation(); handleAddSet(); }}
          className="text-[10px] uppercase font-mono tracking-widest text-outline hover:text-primary-container transition-colors"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}
