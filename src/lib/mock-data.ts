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

/* ── Mock "today" ── */
export const MOCK_TODAY = new Date(2045, 9, 24); // Oct 24, 2045

/* ── Helpers ── */
export function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ── Data Fetchers ── */

export function getEvents(): CalendarEvent[] {
  return [
    {
      id: "e1",
      title: "Design Review",
      date: "2045-10-10",
      color: "secondary",
    },
    {
      id: "e2",
      title: "Quantum Deploy",
      date: "2045-10-24",
      color: "primary",
    },
    {
      id: "e3",
      title: "Deadline",
      date: "2045-10-27",
      color: "error",
    },
    {
      id: "e4",
      title: "Sprint Retro",
      date: "2045-10-18",
      color: "tertiary",
    },
  ];
}

export function getTimeline(): TimelineEntry[] {
  return [
    {
      id: "t1",
      title: "System Calibration",
      startTime: "08:00",
      endTime: "09:30",
      status: "completed",
    },
    {
      id: "t2",
      title: "Deep Work: Architecture",
      startTime: "10:00",
      endTime: "12:00",
      status: "active",
      progress: 65,
    },
    {
      id: "t3",
      title: "Physical Training",
      startTime: "13:00",
      endTime: "14:30",
      status: "upcoming",
    },
    {
      id: "t4",
      title: "Data Review & Synthesis",
      startTime: "15:00",
      endTime: "18:00",
      status: "upcoming",
    },
  ];
}

export function getTasks(): Task[] {
  return [
    {
      id: "task1",
      title: "Deploy Quantum Engine v2",
      description:
        "Finalize deployment sequence and run integrity checks on primary nodes. Ensure all backup protocols are initialized before proceeding with the main switchover. Expected downtime is less than 400ms.",
      tags: ["INFRA"],
      urgency: "URGENT",
      eta: "2H",
      assignee: {
        name: "SysAdmin",
        avatar: "https://picsum.photos/seed/avatar1/100/100",
      },
      completed: false,
    },
    {
      id: "task2",
      title: "Review Semantic Logs",
      description:
        "Analyze yesterday's output for structural anomalies in the data layer. Cross-reference with the baseline metrics from last week to identify any long-term deviations in processing speed.",
      tags: ["DATA"],
      urgency: "NORMAL",
      eta: "4H",
      completed: false,
    },
    {
      id: "task3",
      title: "Update Neural Core Weights",
      description:
        "Apply the latest training batch to the neural core. Validate output against the regression test suite before promoting to production.",
      tags: ["ML"],
      urgency: "NORMAL",
      eta: "6H",
      completed: false,
    },
  ];
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

export function getJournalEntries(): JournalEntry[] {
  return [
    {
      id: "j1",
      dateLabel: "TODAY",
      timeLabel: "14:32",
      title: "Architectural review & Synthesis",
      excerpt: "Compiled notes from the downtown walk...",
      dateStr: "TUESDAY, OCTOBER 14, 2024",
      isPinned: true,
      body: `<p class="mb-4">Started the day early to review the structural mockups from the downtown project. The interplay between the brutalist concrete structures and the new glass facades is striking. I'm focusing specifically on how the <span class="bg-primary-container/20 text-primary-fixed px-1 rounded-sm">ambient lighting</span> interacts with these reflective surfaces during dusk.</p>
             <blockquote class="border-l-2 border-primary-container pl-4 text-on-surface-variant my-4">"Architecture is the learned game, correct and magnificent, of forms assembled in the light." – Le Corbusier. This feels incredibly relevant to today's observations.</blockquote>
             <p class="mb-4 mt-6">Key takeaways from the site visit:</p>
             <ul class="list-disc pl-6 space-y-2 mb-4 text-on-surface">
               <li>Material contrast is paramount: harsh vs. smooth.</li>
               <li>Neon accents in the interior corridors provide necessary wayfinding without overwhelming the primary aesthetics.</li>
               <li>Need to iterate on the specific cyan hex value (#00f2ff) to ensure it pops against the Level 0 background tones.</li>
             </ul>
             <p class="mt-8 text-on-surface-variant">Adding some field captures below to document the lighting profiles.</p>`,
      photos: [
        { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", label: "IMG_8992_DUSK.RAW" },
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400", label: "IMG_8993.RAW" },
        { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400", label: "IMG_8994.RAW" }
      ]
    },
    {
      id: "j2",
      dateLabel: "YESTERDAY",
      title: "Deep work session: Phase 2",
      excerpt: "Focused heavily on the API integration...",
      dateStr: "MONDAY, OCTOBER 13, 2024",
      body: "<p>Worked on integrating the new endpoints for the dashboard. Latency has been reduced by 40%.</p>",
      photos: []
    },
    {
      id: "j3",
      dateLabel: "OCT 12",
      title: "Weekend reflection & reset",
      excerpt: "Clearing the mind before the sprint.",
      dateStr: "SUNDAY, OCTOBER 12, 2024",
      body: "<p>Took some time away from screens. Read some sci-fi and planned out the week.</p>",
      photos: []
    }
  ];
}

/* ── Study Tracker Data ── */

export interface SemesterClass {
  id: string;
  subject: string;
  instructor: string;
  nextDue: string;
  nextDueLabel: string;
  status: 'In Progress' | 'Done' | 'Urgent';
  notes: string;
  color: 'primary' | 'secondary' | 'error' | 'tertiary';
}

export function getSemesterTracker(): SemesterClass[] {
  return [
    {
      id: "c1",
      subject: "Machine Learning 401",
      instructor: "Dr. Alan T.",
      nextDue: "Oct 12",
      nextDueLabel: "(Midterm)",
      status: "In Progress",
      notes: "Review SVM kernels chapter",
      color: "primary"
    },
    {
      id: "c2",
      subject: "Advanced DSA",
      instructor: "Prof. Cormen",
      nextDue: "Oct 15",
      nextDueLabel: "(PSet 4)",
      status: "Done",
      notes: "Dynamic Programming focus",
      color: "secondary"
    },
    {
      id: "c3",
      subject: "Operating Systems",
      instructor: "Dr. Stallman",
      nextDue: "Oct 10",
      nextDueLabel: "(Proj 2)",
      status: "Urgent",
      notes: "Memory management bugs",
      color: "error"
    }
  ];
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

export function getWorkspaces(): WorkspaceData[] {
  return [
    {
      id: "w1",
      title: "ML_Workspace",
      icon: "memory",
      progress: 65,
      notes: [
        { id: "n1", title: "Neural Networks Intro", excerpt: "Backpropagation math, chain rule application for gradient descent. Need to review activation functions." },
        { id: "n2", title: "SVM & Kernels", excerpt: "Kernel trick mapping to higher dimensions. RBF kernel hyperparameter tuning (gamma, C)." },
        { id: "n3", title: "PCA & Dimensionality", excerpt: "Eigenvectors and eigenvalues. Maximizing variance. Covariance matrix derivation." }
      ],
      videos: [
        { id: "v1", title: "Lec 14: ConvNets", duration: "1h 12m", status: "Watched", thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=200" },
        { id: "v2", title: "Lec 15: RNNs", duration: "1h 05m", status: "Playing", thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200" },
        { id: "v3", title: "Lec 16: Transformers", duration: "1h 30m", status: "Up next" }
      ]
    },
    {
      id: "w2",
      title: "DSA_Core",
      icon: "data_object",
      leetcodeCount: 245,
      tasks: [
        { id: "t1", title: "Inorder Traversal (Iterative)", completed: true },
        { id: "t2", title: "LCA of Binary Tree", completed: true },
        { id: "t3", title: "Maximum Path Sum", completed: false, difficulty: "Hard" },
        { id: "t4", title: "Construct Tree from In/Pre", completed: false }
      ],
      messages: [
        { 
          id: "m1", 
          user: "@sys_admin", 
          timeAgo: "2h ago", 
          content: "Why does Dijkstra fail with negative weights but Bellman-Ford works?", 
          reply: "Dijkstra assumes once a node is extracted, its distance is final. Negative edges break this greedy choice property." 
        }
      ]
    }
  ];
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

export function getProjectDomains(): ProjectDomain[] {
  return [
    {
      id: "pd1",
      name: "Web Development",
      icon: "code",
      activeCount: 3,
      blockedCount: 1,
      archivedCount: 0,
      health: "HEALTHY",
      healthColor: "primary",
      defaultExpanded: true,
      projects: [
        {
          id: "p1",
          title: "Core_OS Marketing Site Redesign",
          phaseTag: "PHASE 2",
          phaseColor: "primary",
          progress: 75,
          description: "Migrating legacy React codebase to Next.js App Router for improved SEO and rendering performance.",
          contributors: [{ initials: "JS" }, { initials: "AL" }]
        },
        {
          id: "p2",
          title: "Auth Service Implementation",
          phaseTag: "BLOCKED",
          phaseColor: "error",
          progress: 40,
          description: "Integrating third-party OAuth providers. Currently awaiting API key provisioning from DevOps.",
          contributors: [{ initials: "TK" }]
        }
      ]
    },
    {
      id: "pd2",
      name: "AI & Analytics",
      icon: "brain",
      activeCount: 2,
      blockedCount: 0,
      archivedCount: 0,
      conceptualCount: 1,
      health: "TRAINING",
      healthColor: "tertiary",
      projects: [
        {
          id: "p3",
          title: "Predictive Behavior Model",
          phaseTag: "TRAINING",
          phaseColor: "tertiary",
          progress: 60,
          description: "Training the new transformer model on the curated dataset for user behavior prediction.",
          contributors: [{ initials: "JS" }, { initials: "ML" }]
        }
      ]
    },
    {
      id: "pd3",
      name: "Hardware & IoT",
      icon: "cpu",
      activeCount: 0,
      blockedCount: 0,
      archivedCount: 4,
      health: "IDLE",
      healthColor: "outline",
      projects: []
    },
    {
      id: "pd4",
      name: "Research",
      icon: "microscope",
      activeCount: 2,
      blockedCount: 0,
      archivedCount: 1,
      health: "HEALTHY",
      healthColor: "primary",
      projects: [
        {
          id: "p4",
          title: "EV Battery Recycling Viability",
          phaseTag: "DATA GATHERING",
          phaseColor: "secondary",
          progress: 30,
          description: "Analyzing current material recovery rates and cost-benefit ratios of hydrometallurgical extraction.",
          contributors: [{ initials: "AL" }]
        },
        {
          id: "p5",
          title: "LUMINA Framework Exploration",
          phaseTag: "CONCEPT",
          phaseColor: "outline",
          progress: 10,
          description: "Early stage prototyping of the new lightweight rendering engine.",
          contributors: [{ initials: "JS" }, { initials: "TK" }]
        }
      ]
    }
  ];
}

/* ── Gym Tracker Data ── */

export interface WeeklySplitDay {
  id: string;
  dayLabel: string;
  type: string;
  isActive: boolean;
}

export function getWeeklySplit(): WeeklySplitDay[] {
  return [
    { id: "d1", dayLabel: "S", type: "Legs", isActive: false },
    { id: "d2", dayLabel: "M", type: "Rest", isActive: false },
    { id: "d3", dayLabel: "T", type: "Push", isActive: true },
    { id: "d4", dayLabel: "W", type: "Pull", isActive: false },
    { id: "d5", dayLabel: "T", type: "Push", isActive: false },
    { id: "d6", dayLabel: "F", type: "Legs", isActive: false },
    { id: "d7", dayLabel: "S", type: "Pull", isActive: false },
  ];
}

export interface BodyMetrics {
  weight: { value: number; unit: string; delta: string };
  bodyFat: { value: number; unit: string; delta: string; progress: number };
}

export function getBodyMetrics(): BodyMetrics {
  return {
    weight: { value: 82.4, unit: "kg", delta: "+0.5kg" },
    bodyFat: { value: 14.2, unit: "%", delta: "-1.2%", progress: 70 }
  };
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
  dayId: string;
  title: string;
  duration: string;
  intensity: string;
  exercises: Exercise[];
}

export function getWorkoutDay(): WorkoutDay {
  return {
    dayId: "DAY_04",
    title: "Pull / Back & Biceps",
    duration: "65 mins",
    intensity: "High",
    exercises: [
      {
        id: "ex1",
        order: "01",
        name: "Barbell Deadlift",
        target: "Posterior Chain",
        sets: [
          { id: "s1", label: "SET 1", details: "100kg x 8" },
          { id: "s2", label: "SET 2", details: "120kg x 6" },
          { id: "s3", label: "SET 3", details: "140kg x 5", isActive: true }
        ]
      },
      {
        id: "ex2",
        order: "02",
        name: "Weighted Pull-ups",
        target: "Lats",
        isFaded: true,
        sets: [
          { id: "s4", label: "SET 1", details: "+10kg x 8" },
          { id: "s5", label: "SET 2", details: "+15kg x 6" },
          { id: "s6", label: "SET 3", details: "TBD", isFaded: true }
        ]
      },
      {
        id: "ex3",
        order: "03",
        name: "Barbell Rows",
        target: "Mid Back",
        isFaded: true,
        sets: [
          { id: "s7", label: "PREV", details: "80kg x 10" }
        ]
      }
    ]
  };
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

export function getDirectives(): Directive[] {
  return [
    {
      id: "dir1",
      type: "DEADLINE",
      typeLabel: "DEADLINE: T-24H",
      title: "Submit Sponsorship Proposal to TechCorp",
      subtitle: "Assigned to: Lead Team",
      color: "primary"
    },
    {
      id: "dir2",
      type: "MEETING",
      typeLabel: "MEETING",
      title: "Core Committee Sync",
      subtitle: "18:00 HRS | Room 4B",
      color: "tertiary"
    },
    {
      id: "dir3",
      type: "TASK",
      typeLabel: "TASK",
      title: "Update Member Roster",
      color: "outline"
    }
  ];
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

export function getSponsorshipStats(): SponsorshipStat[] {
  return [
    {
      id: "stat1",
      label: "TARGET ACQUISITION",
      value: "$45K",
      progress: 75,
      progressColor: "primary"
    },
    {
      id: "stat2",
      label: "ACTIVE LEADS",
      value: "24",
      trendText: "+3 THIS WEEK",
      trendColor: "primary"
    },
    {
      id: "stat3",
      label: "CONVERSION RATE",
      value: "18%",
      trendText: "STABLE",
      trendColor: "tertiary"
    },
    {
      id: "stat4",
      label: "EVENT READINESS",
      value: "82%",
      progress: 82,
      progressColor: "on-surface"
    }
  ];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
}

export function getTeam(): TeamMember[] {
  return [
    {
      id: "tm1",
      name: "Alex Vance",
      role: "Head of Sponsorships",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "tm2",
      name: "Sarah Jenks",
      role: "Event Coordinator",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "tm3",
      name: "Marcus Kane",
      role: "Technical Lead",
      initials: "MK"
    }
  ];
}

export interface ArchivePhoto {
  id: string;
  url: string;
  label: string;
}

export function getArchive(): ArchivePhoto[] {
  return [
    {
      id: "arch1",
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
      label: "Pitch_Day_01.raw"
    },
    {
      id: "arch2",
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400",
      label: "Hackathon_Night.raw"
    }
  ];
}
