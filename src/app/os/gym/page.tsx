"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Upload,
  Image as ImageIcon,
  Plus,
  Calculator,
  Scale,
  Copy,
  RefreshCcw,
  Activity,
  X
} from "lucide-react";
import { 
  getWeeklySplit, getBodyMetrics, getWorkoutDay, initializeGymProfile, 
  createExercise, updateWeeklySplitType, createWorkoutDay, getMuscleDistribution, 
  updateBodyMetrics, uploadGymPhoto, deleteGymPhoto, generateAndEmailCycleReport,
  getGymCycleInfo, getWorkoutTemplates, saveWorkoutAsTemplate, loadTemplateIntoWorkout, 
  syncGoogleFit, getGoogleFitStatus, getGoogleFitWeeklyData
} from "@/lib/actions/gym";
import { WeeklySplitDay, BodyMetrics, WorkoutDay } from "@/lib/mock-data";
import ExerciseSets from "@/components/gym/ExerciseSets";
import ConsistencyTracker from "@/components/gym/ConsistencyTracker";
import BodyMetricsModal from "../components/BodyMetricsModal";

export default function OSGymPage() {
  const [weeklySplit, setWeeklySplit] = useState<WeeklySplitDay[]>([]);
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [activeSplitDay, setActiveSplitDay] = useState<WeeklySplitDay | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", setsReps: "", intensity: "Moderate" });
  
  const [muscleDistribution, setMuscleDistribution] = useState<{ name: string; sets: number; max: number; color: string }[]>([]);
  
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [targetWeight, setTargetWeight] = useState(100);
  const [barWeight, setBarWeight] = useState(20);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [cycleInfo, setCycleInfo] = useState({ currentWeek: 1, cycleLength: 8 });
  const [templates, setTemplates] = useState<any[]>([]);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [fitConnected, setFitConnected] = useState(false);
  const [fitLastSync, setFitLastSync] = useState<string | null>(null);
  const [fitData, setFitData] = useState<any[]>([]);
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadGymPhoto(formData);
      setMetrics(prev => prev ? { ...prev, photoUrl: url } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to delete this progress photo?")) return;
    try {
      await deleteGymPhoto();
      setMetrics(prev => prev ? { ...prev, photoUrl: undefined } : null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo");
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateAndEmailCycleReport();
      alert("Cycle report generated and sent to your email!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatePlates = () => {
    let remaining = (targetWeight - barWeight) / 2;
    if (remaining <= 0) return [];
    
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesToLoad = [];
    
    for (const plate of availablePlates) {
      while (remaining >= plate) {
        platesToLoad.push(plate);
        remaining -= plate;
      }
    }
    return platesToLoad;
  };
  
  useEffect(() => {
    async function loadData() {
      try {
        const [split, m, distribution, cycle, savedTemplates, fData] = await Promise.all([
          getWeeklySplit(),
          getBodyMetrics(),
          getMuscleDistribution(),
          getGymCycleInfo(),
          getWorkoutTemplates(),
          getGoogleFitWeeklyData()
        ]);
        setWeeklySplit(split);
        setMetrics(m);
        setMuscleDistribution(distribution);
        setCycleInfo(cycle);
        setTemplates(savedTemplates);
        setFitData(fData);
        
        if (split.length > 0) {
          const currentDayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          const todaySplit = split.find(s => s.dayLabel.includes(currentDayStr)) || split[0];
          setActiveSplitDay(todaySplit);
          const specificDay = await getWorkoutDay(todaySplit.dayLabel);
          setWorkoutDay(specificDay);
        } else {
          setWorkoutDay(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await initializeGymProfile();
      
      const [split, m, day, distribution] = await Promise.all([
        getWeeklySplit(),
        getBodyMetrics(),
        getWorkoutDay(),
        getMuscleDistribution()
      ]);
      setWeeklySplit(split);
      setMetrics(m);
      setWorkoutDay(day);
      setMuscleDistribution(distribution);
    } catch (err) {
      console.error(err);
      alert("Please make sure you are logged in and migrations are applied.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = async (splitDay: WeeklySplitDay) => {
    setActiveSplitDay(splitDay);
    const day = await getWorkoutDay(splitDay.dayLabel);
    setWorkoutDay(day);
  };

  const handleTypeChange = async (splitDay: WeeklySplitDay, e: React.MouseEvent) => {
    e.stopPropagation();
    const newType = prompt("Enter new workout type (e.g. PUSH, PULL, LEGS, Rest):", splitDay.type);
    if (!newType) return;
    try {
      await updateWeeklySplitType(splitDay.id, newType);
      
      if (newType.toLowerCase() !== "rest") {
         const existing = await getWorkoutDay(splitDay.dayLabel);
         if (!existing) {
           await createWorkoutDay(splitDay.dayLabel, `${newType} Workout`);
         }
      }
      
      const updatedSplit = await getWeeklySplit();
      setWeeklySplit(updatedSplit);
      
      if (activeSplitDay?.id === splitDay.id) {
         setActiveSplitDay(updatedSplit.find(s => s.id === splitDay.id) || null);
         setWorkoutDay(await getWorkoutDay(splitDay.dayLabel));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update day type.");
    }
  };

  const handleAddExercise = async () => {
    if (!workoutDay || !newExercise.name) return;
    try {
      const nextOrder = (workoutDay.exercises.length + 1).toString().padStart(2, '0');
      await createExercise(workoutDay.id, nextOrder, newExercise.name);

      const [day, distribution] = await Promise.all([
        getWorkoutDay(activeSplitDay?.dayLabel),
        getMuscleDistribution()
      ]);
      setWorkoutDay(day);
      setMuscleDistribution(distribution);

      setIsAddModalOpen(false);
      setNewExercise({ name: "", setsReps: "", intensity: "Moderate" });
    } catch (error) {
      console.error(error);
      alert("Failed to add exercise.");
    }
  };

  const handleSaveMetrics = async (
    weight_value: number, weight_unit: string, weight_delta: string,
    body_fat_value: number, body_fat_unit: string, body_fat_delta: string, body_fat_progress: number
  ) => {
    await updateBodyMetrics(
      weight_value, weight_unit, weight_delta,
      body_fat_value, body_fat_unit, body_fat_delta, body_fat_progress
    );
    const m = await getBodyMetrics();
    setMetrics(m);
  };

  const handleSyncHealth = async () => {
    // Check if Google Fit is connected
    const status = await getGoogleFitStatus();
    if (!status.connected) {
      // Redirect to Google Fit OAuth
      window.location.href = '/api/google-fit/auth';
      return;
    }

    setIsSyncingHealth(true);
    try {
      const result = await syncGoogleFit();
      const m = await getBodyMetrics();
      const f = await getGoogleFitWeeklyData();
      setMetrics(m);
      setFitData(f);
      setFitLastSync(new Date().toISOString());
      alert(`Google Fit data synced! (${result.days} days updated)`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to sync';
      if (message.includes('reconnect')) {
        window.location.href = '/api/google-fit/auth';
      } else {
        alert(message);
      }
    } finally {
      setIsSyncingHealth(false);
    }
  };

  // Check Google Fit connection on load
  useEffect(() => {
    getGoogleFitStatus().then(status => {
      setFitConnected(status.connected);
      if (status.lastSync) setFitLastSync(status.lastSync);
    });
  }, []);

  const handleSaveTemplate = async () => {
    if (!workoutDay) return;
    const name = prompt("Enter a name for this template:", workoutDay.title);
    if (!name) return;
    
    try {
      await saveWorkoutAsTemplate(workoutDay.id, name);
      setTemplates(await getWorkoutTemplates());
      alert("Template saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save template.");
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    if (!workoutDay) return;
    if (!confirm("This will overwrite your current day's exercises. Continue?")) return;

    try {
      await loadTemplateIntoWorkout(templateId, workoutDay.id);
      setIsTemplatesModalOpen(false);
      setWorkoutDay(await getWorkoutDay(activeSplitDay?.dayLabel));
    } catch (err) {
      console.error(err);
      alert("Failed to load template.");
    }
  };

  if (loading) return <div className="p-8 font-mono text-sm uppercase tracking-widest text-on-surface-variant animate-pulse">Loading Gym Telemetry...</div>;

  if (!metrics || weeklySplit.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full space-y-6 bg-background">
        <div className="p-4 bg-primary-container/10 border border-primary-container/30 rounded-full mb-4 relative">
          <div className="absolute inset-0 bg-primary-container/20 blur-xl"></div>
          <Play className="w-10 h-10 text-primary relative z-10" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Initialize Gym Profile</h2>
          <p className="text-on-surface-variant max-w-md mx-auto mt-2 text-sm leading-relaxed">
            Your gym database is currently empty. Initialize your profile to set up a default weekly split, a sample workout day, and body metrics tracking.
          </p>
        </div>
        <button 
          onClick={handleInitialize}
          className="px-6 py-3 bg-primary-container text-on-primary-container font-mono text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-primary transition-colors flex items-center gap-2 mt-4 shadow-lg hover:shadow-primary-container/25"
        >
          Initialize Setup
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-6 h-full custom-scrollbar relative bg-background">
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="font-display text-2xl font-black text-on-surface tracking-tight">
              Core_OS<span className="text-primary">.gym</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 hidden md:flex">
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/50 rounded-full font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2 text-on-surface"
            >
              <Copy className="w-3 h-3" /> Templates
            </button>
            <button
              onClick={() => setIsCalcOpen(true)}
              className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/50 rounded-full font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2 text-on-surface"
            >
              <Calculator className="w-3 h-3" /> Plates
            </button>
          </div>
        </header>

        {/* Two Column Layout Matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Custom Split & Exercises */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Custom Split Header Card */}
            <div className="glass-panel p-6 lg:p-8 rounded-xl border border-card-border">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="px-3 py-1 bg-primary-container/10 text-primary font-mono text-[10px] rounded-full uppercase tracking-widest font-bold mb-4 inline-block">
                    Current Routine
                  </span>
                  <h1 className="font-display text-4xl text-on-surface font-bold">Custom Split</h1>
                </div>
                <div className="text-right">
                  {cycleInfo.currentWeek >= cycleInfo.cycleLength && (
                    <div className="mb-2 inline-block px-3 py-1 bg-error/20 text-error font-mono text-[10px] rounded-full uppercase tracking-widest font-bold animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                      ⚠ DELOAD WEEK RECOMMENDED
                    </div>
                  )}
                  <div className="text-sm text-on-surface-variant font-mono">Week {cycleInfo.currentWeek} of {cycleInfo.cycleLength}</div>
                  <div className="text-xs text-on-surface-variant mt-1">Consistency: <span className="text-primary font-bold">85%</span> <span className="text-secondary-container">· 4 Wk Streak 🔥</span></div>
                </div>
              </div>

              {/* 7 Day Blocks */}
              <div className="grid grid-cols-7 gap-2 lg:gap-4">
                {weeklySplit.map((sDay) => {
                  const isSelected = activeSplitDay?.id === sDay.id;
                  const initial = sDay.dayLabel.charAt(0);
                  
                  return (
                    <div key={sDay.id} className="flex flex-col items-center">
                      <div 
                        onClick={() => handleDayClick(sDay)}
                        className={`w-full aspect-[4/3] rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer border ${
                        isSelected 
                          ? 'bg-primary-container/20 border-primary-container neon-glow' 
                          : 'bg-surface-container-high border-outline-variant/30 hover:border-primary-container/50'
                      }`}>
                        <span className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{initial}</span>
                        <span className={`text-[10px] uppercase font-mono tracking-wider mt-1 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {sDay.type}
                        </span>
                      </div>
                      <span 
                        onClick={(e) => handleTypeChange(sDay, e)}
                        className="text-[9px] text-outline mt-2 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
                      >
                        edit
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Day Exercises Card */}
            <div className="glass-panel p-6 lg:p-8 rounded-xl border border-card-border">
              <div className="flex justify-between items-center mb-8 border-b border-card-border pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-on-surface">
                    {activeSplitDay ? activeSplitDay.dayLabel : "Select Day"}
                  </h2>
                  {activeSplitDay && (
                    <span className={`px-2 py-0.5 font-mono text-[10px] rounded uppercase tracking-widest font-bold ${
                      activeSplitDay.type.toLowerCase() === 'rest' 
                        ? 'bg-surface-variant text-on-surface-variant border border-outline-variant' 
                        : 'bg-primary-container/10 border border-primary-container/30 text-primary'
                    }`}>
                      {activeSplitDay.type}
                    </span>
                  )}
                </div>
                {activeSplitDay && activeSplitDay.type.toLowerCase() !== 'rest' && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/50 rounded-full font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2 text-on-surface">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Exercise List */}
              <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {!workoutDay || workoutDay.exercises.length === 0 ? (
                  <div className="text-center p-8 text-on-surface-variant text-sm font-mono uppercase tracking-widest">
                    {activeSplitDay?.type.toLowerCase() === 'rest' 
                      ? "Rest Day! Click 'edit' above to change."
                      : "No exercises added for this day. Click '+ Add' to start."}
                  </div>
                ) : (
                  workoutDay.exercises.map((ex, i) => (
                  <div key={ex.id} className="border border-card-border/50 rounded-xl overflow-hidden mb-4 bg-surface-container-lowest">
                    {/* Exercise Header */}
                    <div 
                      className="flex items-center justify-between p-4 hover:bg-surface-variant/30 cursor-pointer transition-colors group"
                      onClick={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-mono text-outline">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-body text-base font-bold text-on-surface group-hover:text-primary transition-colors">{ex.name}</div>
                          <div className="font-mono text-[10px] text-on-surface-variant mt-1">{ex.target || '3x10'} · {i % 2 === 0 ? 'Comfortable Heavy' : 'Moderate'}</div>
                        </div>
                      </div>
                      <button className="text-outline hover:text-on-surface transition-colors p-2">
                        {expandedExercise === ex.id ? '−' : '+'}
                      </button>
                    </div>

                    {/* Advanced Sets View */}
                    {expandedExercise === ex.id && (
                      <ExerciseSets exerciseName={ex.name} exerciseSet={ex.sets?.[0] || { id: ex.id, details: ex.target }} />
                    )}
                  </div>
                )))}
              </div>
            </div>

            {/* Growth Journey */}
            <div className="glass-panel p-6 lg:p-8 rounded-xl border border-card-border">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl text-on-surface font-bold">Growth Journey</h2>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/50 rounded-full font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                  {isUploading ? (
                    <span className="w-3 h-3 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Upload className="w-3 h-3" />
                  )} 
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {(metrics as any)?.photoUrl ? (
                  <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-card-border relative group">
                     <Image alt="Progress" src={(metrics as any).photoUrl} width={128} height={128} className="object-cover w-full h-full" />
                     <button
                       onClick={handleDeletePhoto}
                       className="absolute top-1 right-1 bg-black/60 hover:bg-error/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                       title="Delete Photo"
                     >
                       <X className="w-4 h-4" />
                     </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-card-border relative">
                     <Image alt="Progress" src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400" width={128} height={128} className="object-cover w-full h-full opacity-50" />
                  </div>
                )}
                <label className="w-32 h-32 shrink-0 rounded-lg border border-dashed border-outline-variant/50 flex items-center justify-center cursor-pointer hover:border-primary-container/50 transition-colors">
                  <span className="font-mono text-xs uppercase text-outline">Add</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Telemetry */}
          <div className="lg:col-span-4 space-y-6">

            {/* Body Metrics */}
            {metrics && (
              <div className="glass-panel p-6 rounded-xl border border-card-border">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Body Metrics
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSyncHealth}
                      disabled={isSyncingHealth}
                      className={`font-mono text-[10px] uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1 ${fitConnected ? 'text-green-400' : 'text-secondary-container'}`}
                    >
                      <Activity className="w-3 h-3" />
                      {isSyncingHealth ? 'Syncing...' : fitConnected ? 'Sync Google Fit' : 'Connect Google Fit'}
                    </button>
                    <button
                      onClick={() => setIsMetricsOpen(true)}
                      className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] text-outline uppercase tracking-widest">Weight</p>
                    <p className="font-display text-2xl font-bold text-on-surface">
                      {metrics.weight.value}{metrics.weight.unit}
                    </p>
                    <p className="font-mono text-xs text-primary">{metrics.weight.delta}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-outline uppercase tracking-widest">Body Fat</p>
                    <p className="font-display text-2xl font-bold text-on-surface">
                      {metrics.bodyFat.value}{metrics.bodyFat.unit}
                    </p>
                    <p className="font-mono text-xs text-secondary-container">{metrics.bodyFat.delta}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Health Activity (Google Fit) */}
            {fitData && fitData.length > 0 && (
              <div className="glass-panel p-6 rounded-xl border border-card-border mt-6 mb-6">
                <h3 className="font-display text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Health Activity <span className="text-[10px] uppercase font-mono text-outline font-normal ml-2">7 Days</span>
                </h3>
                <div className="space-y-4">
                  {fitData.slice(-3).reverse().map((day: any) => (
                    <div key={day.date} className="flex justify-between items-center border-b border-surface-container/50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-mono text-xs text-on-surface">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="font-mono text-[10px] text-outline uppercase">Steps</p>
                          <p className="font-mono text-sm text-green-300">{day.steps?.toLocaleString() || '-'}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-outline uppercase">Kcal</p>
                          <p className="font-mono text-sm text-orange-300">{day.calories_burned || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consistency Tracker */}
            <div className="flex justify-end mb-4">
               <button 
                 onClick={handleGenerateReport} 
                 disabled={isGenerating}
                 className="px-3 py-1 bg-surface-container hover:bg-surface-variant border border-outline-variant rounded font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                 {isGenerating ? "Generating..." : "Generate Cycle Report"}
               </button>
            </div>
            <ConsistencyTracker />

            {/* Muscle Distribution Chart */}
            <div className="glass-panel p-6 rounded-xl border border-card-border">
              <h3 className="font-display text-lg font-bold text-on-surface mb-4">Muscle Distribution <span className="text-[10px] uppercase font-mono text-outline font-normal ml-2">This Week</span></h3>
              <div className="space-y-3">
                {muscleDistribution.map((muscle) => (
                  <div key={muscle.name}>
                    <div className="flex justify-between text-xs font-mono uppercase tracking-wide mb-1">
                      <span className="text-on-surface-variant">{muscle.name}</span>
                      <span className="text-outline">{muscle.sets} sets</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${muscle.color}`} style={{ width: `${Math.min(100, (muscle.sets / muscle.max) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        
        <div className="h-24 md:h-8"></div>
      </div>

      {/* Add Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-on-surface">Add Exercise</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-outline hover:text-error transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-2">Exercise Name</label>
                <input 
                  type="text" 
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body"
                  placeholder="e.g. Incline Dumbbell Press"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-2">Sets x Reps</label>
                  <input 
                    type="text" 
                    value={newExercise.setsReps}
                    onChange={(e) => setNewExercise({...newExercise, setsReps: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body"
                    placeholder="e.g. 4x10"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-2">Intensity</label>
                  <select 
                    value={newExercise.intensity}
                    onChange={(e) => setNewExercise({...newExercise, intensity: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body"
                  >
                    <option>Light</option>
                    <option>Moderate</option>
                    <option>Comfortable Heavy</option>
                    <option>Heavy</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddExercise}
                className="px-6 py-2 bg-primary-container text-on-primary font-bold rounded-lg hover:bg-primary-fixed transition-colors font-mono text-xs uppercase tracking-widest shadow-glow"
              >
                Add to Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plate Calculator Modal */}
      {isCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-on-surface">Plate Calculator</h2>
              <button onClick={() => setIsCalcOpen(false)} className="text-outline hover:text-error transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <div className="font-mono text-[10px] text-outline uppercase tracking-widest mb-4">Plates per side</div>
                
                {targetWeight <= barWeight ? (
                  <div className="text-sm text-on-surface-variant">Just the bar!</div>
                ) : (
                  <div className="flex justify-center gap-1 overflow-x-auto pb-2 custom-scrollbar">
                    {/* Render Bar End */}
                    <div className="w-4 h-16 bg-outline-variant rounded-l flex-shrink-0 mr-1 border-r-2 border-surface-container-highest"></div>
                    
                    {calculatePlates().map((p, i) => (
                      <div 
                        key={i} 
                        className={`
                          flex-shrink-0 rounded-sm border-y-2 border-r border-black flex items-center justify-center font-bold text-black
                          ${p === 25 ? 'w-6 h-24 bg-[#ff4a4a] text-xs' : ''}
                          ${p === 20 ? 'w-5 h-24 bg-[#4a90e2] text-xs' : ''}
                          ${p === 15 ? 'w-4 h-20 bg-[#f8e71c] text-[10px]' : ''}
                          ${p === 10 ? 'w-3 h-16 bg-[#7ed321] text-[8px]' : ''}
                          ${p === 5 ? 'w-2 h-12 bg-white text-[0px]' : ''}
                          ${p === 2.5 ? 'w-1.5 h-10 bg-gray-400 text-[0px]' : ''}
                          ${p === 1.25 ? 'w-1 h-8 bg-gray-600 text-[0px]' : ''}
                        `}
                        title={`${p}kg plate`}
                      >
                        {p >= 10 && p}
                      </div>
                    ))}
                  </div>
                )}
                
                {targetWeight > barWeight && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {calculatePlates().map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-surface-container-high rounded text-xs font-mono font-bold text-on-surface">
                        {p}kg
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h2 className="font-display text-2xl font-bold text-on-surface">Workout Templates</h2>
              <button onClick={() => setIsTemplatesModalOpen(false)} className="text-outline hover:text-error transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <button
                onClick={handleSaveTemplate}
                className="w-full py-3 mb-4 bg-primary-container text-on-primary-container rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Current Routine As Template
              </button>

              <h3 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-2">Saved Templates</h3>
              {templates.length === 0 ? (
                <p className="text-on-surface-variant text-sm font-mono py-4 text-center">No templates saved yet.</p>
              ) : (
                templates.map((t) => (
                  <div key={t.id} className="bg-surface-container border border-outline-variant p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display font-bold text-on-surface">{t.name}</h4>
                      <span className="text-[10px] text-on-surface-variant font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-on-surface-variant space-y-1">
                      {t.gym_workout_template_exercises?.map((te: any) => (
                        <div key={te.id} className="flex justify-between">
                          <span>{te.order_index}. {te.name}</span>
                          <span className="font-mono opacity-60">{te.sets_reps_string}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(t.id)}
                      className="mt-2 py-2 w-full border border-secondary-container text-secondary-container rounded font-mono text-xs uppercase tracking-widest hover:bg-secondary-container/10 transition-colors"
                    >
                      Load Template
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <BodyMetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        onSave={handleSaveMetrics}
        initialData={metrics ? {
          weight_value: metrics.weight.value,
          weight_unit: metrics.weight.unit,
          weight_delta: metrics.weight.delta,
          body_fat_value: metrics.bodyFat.value,
          body_fat_unit: metrics.bodyFat.unit,
          body_fat_delta: metrics.bodyFat.delta,
          body_fat_progress: metrics.bodyFat.progress,
        } : undefined}
      />

    </div>
  );
}
