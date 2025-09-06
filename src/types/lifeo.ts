export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Category = "morning" | "daily" | "evening";

export interface TaskTemplate {
  id: string;
  title: string;
  category: Category;
  time?: string; // HH:mm optional
  active: boolean;
  sort: number;
}

export interface DayRoutine {
  morning: TaskTemplate[];
  daily: TaskTemplate[];
  evening: TaskTemplate[];
}

export type RoutineState = Record<DayKey, DayRoutine>;

export interface Habit {
  id: string;
  title: string;
  icon?: string; // icon name for lucide-react
  color?: string; // token name or hex, UI only
  active: boolean;
}

export type HabitCompletions = Record<string, string[]>; // date -> habit ids
export type TaskCompletions = Record<string, string[]>; // date -> task ids

export interface MoodEntry { level: 0 | 1 | 2 | 3 | 4; notes?: string }
export type MoodEntries = Record<string, MoodEntry>;
