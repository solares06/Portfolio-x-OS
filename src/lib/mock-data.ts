/**
 * This file serves as a central repository for shared TypeScript types and interfaces
 * used across the OS modules.
 * 
 * Note: All mock data values, arrays, and seed functions have been removed. The
 * application now fetches real data from the Supabase backend.
 */

/* ── Types ── */

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  color: "primary" | "secondary" | "error" | "tertiary";
}

export interface TimelineEntry {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string;
  status: "completed" | "active" | "upcoming";
  progress?: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  urgency: "URGENT" | "NORMAL";
  eta: string;
  assignee?: { name: string; avatar: string };
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  dateLabel: string;
  timeLabel?: string;
  title: string;
  excerpt: string;
  body: string;
  dateStr: string;
  isPinned?: boolean;
  photos: { url: string; label: string }[];
}

/* ── Study Tracker Data ── */

export type SubjectType = 'theory' | 'lab' | 'minor_project' | 'major_project';

export interface SemesterClass {
  id: string;
  subject: string;
  instructor: string;
  nextDue: string;
  nextDueLabel: string;
  status: 'In Progress' | 'Done' | 'Urgent';
  notes: string;
  color: 'primary' | 'secondary' | 'error' | 'tertiary';
  type: SubjectType;
}

export interface Deadline {
  id: string;
  classId: string;
  title: string;
  dueDate: string | null;
  isCompleted: boolean;
}

export interface ClassTest {
  id: string;
  classId: string;
  ctNumber: 1 | 2;
  date: string | null;
  maxMarks: number;
  marksObtained: number | null;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  isCompleted: boolean;
  weekStart: string;
}

export interface WorkspaceNote {
  id: string;
  title: string;
  excerpt: string;
}

export interface WorkspaceVideo {
  id: string;
  title: string;
  duration: string;
  status: 'Watched' | 'Playing' | 'Up next';
  thumbnailUrl?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  difficulty?: 'Hard' | 'Medium' | 'Easy';
  completed: boolean;
}

export interface WorkspaceMessage {
  id: string;
  user: string;
  timeAgo: string;
  content: string;
  reply?: string;
}

export interface WorkspaceData {
  id: string;
  title: string;
  icon: string;
  progress?: number;
  leetcodeCount?: number;
  notes?: WorkspaceNote[];
  videos?: WorkspaceVideo[];
  tasks?: WorkspaceTask[];
  messages?: WorkspaceMessage[];
}

/* ── Project Domains Data ── */

export interface ProjectContributor {
  initials: string;
}

export interface ProjectData {
  id: string;
  title: string;
  phaseTag: string;
  phaseColor: 'primary' | 'error' | 'secondary' | 'outline' | 'tertiary';
  progress: number;
  description: string;
  contributors: ProjectContributor[];
}

export interface ProjectDomain {
  id: string;
  name: string;
  icon: string;
  activeCount: number;
  blockedCount: number;
  archivedCount: number;
  conceptualCount?: number;
  health: 'HEALTHY' | 'TRAINING' | 'IDLE';
  healthColor: 'primary' | 'tertiary' | 'outline';
  projects: ProjectData[];
  defaultExpanded?: boolean;
}

/* ── Gym Tracker Data ── */

export interface WeeklySplitDay {
  id: string;
  dayLabel: string;
  type: string;
  isActive: boolean;
}

export interface BodyMetrics {
  weight: { value: number; unit: string; delta: string };
  bodyFat: { value: number; unit: string; delta: string; progress: number };
}

export interface WorkoutSet {
  id: string;
  label: string;
  details: string;
  isActive?: boolean;
  isFaded?: boolean;
}

export interface Exercise {
  id: string;
  order: string;
  name: string;
  target: string;
  sets: WorkoutSet[];
  isFaded?: boolean;
}

export interface WorkoutDay {
  id: string;
  dayId: string;
  title: string;
  duration: string;
  intensity: string;
  exercises: Exercise[];
}

/* ── Extracurricular E-Cell Data ── */

export interface Directive {
  id: string;
  type: 'DEADLINE' | 'MEETING' | 'TASK';
  typeLabel: string;
  title: string;
  subtitle?: string;
  color: 'primary' | 'tertiary' | 'outline';
}

export interface SponsorshipStat {
  id: string;
  label: string;
  value: string;
  trendText?: string;
  trendColor?: 'primary' | 'tertiary' | 'outline';
  progress?: number;
  progressColor?: 'primary' | 'on-surface';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
}

export interface ArchivePhoto {
  id: string;
  url: string;
  label: string;
}
