import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { 
  RoutineState, 
  TaskCompletions, 
  HabitCompletions, 
  MoodEntries, 
  DayKey, 
  Category, 
  TaskTemplate, 
  Habit 
} from "@/types/lifeo";

// Convert database enums to our types
const dayKeyMap: Record<string, DayKey> = {
  monday: "monday", tuesday: "tuesday", wednesday: "wednesday",
  thursday: "thursday", friday: "friday", saturday: "saturday", sunday: "sunday"
};

const categoryMap: Record<string, Category> = {
  morning: "morning", daily: "daily", evening: "evening"
};

const moodLevelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
  very_bad: 0, bad: 1, neutral: 2, good: 3, very_good: 4
};

export function useRoutines() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<RoutineState>({
    monday: { morning: [], daily: [], evening: [] },
    tuesday: { morning: [], daily: [], evening: [] },
    wednesday: { morning: [], daily: [], evening: [] },
    thursday: { morning: [], daily: [], evening: [] },
    friday: { morning: [], daily: [], evening: [] },
    saturday: { morning: [], daily: [], evening: [] },
    sunday: { morning: [], daily: [], evening: [] }
  });

  const [completions, setCompletions] = useState<TaskCompletions>({});

  // Load routines from database
  useEffect(() => {
    if (!user) return;

    const loadRoutines = async () => {
      const { data: templates } = await supabase
        .from('routine_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order');

      if (templates) {
        const newRoutines = { ...routines };
        templates.forEach((template) => {
          const dayKey = dayKeyMap[template.day_of_week];
          const category = categoryMap[template.category];
          if (dayKey && category) {
            const task: TaskTemplate = {
              id: template.id,
              title: template.title,
              category,
              active: template.is_active,
              sort: template.sort_order || 0
            };
            newRoutines[dayKey][category].push(task);
          }
        });
        setRoutines(newRoutines);
      }
    };

    loadRoutines();
  }, [user]);

  // Load completions
  useEffect(() => {
    if (!user) return;

    const loadCompletions = async () => {
      const { data: dailyCompletions } = await supabase
        .from('daily_completions')
        .select('routine_template_id, completion_date')
        .eq('user_id', user.id);

      if (dailyCompletions) {
        const newCompletions: TaskCompletions = {};
        dailyCompletions.forEach((completion) => {
          const date = completion.completion_date;
          if (!newCompletions[date]) newCompletions[date] = [];
          newCompletions[date].push(completion.routine_template_id);
        });
        setCompletions(newCompletions);
      }
    };

    loadCompletions();
  }, [user]);

  const addTask = async (dayKey: DayKey, category: Category, title: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('routine_templates')
      .insert({
        user_id: user.id,
        day_of_week: dayKey,
        title,
        category,
        sort_order: Date.now()
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      const task: TaskTemplate = {
        id: data.id,
        title: data.title,
        category,
        active: true,
        sort: data.sort_order || 0
      };

      setRoutines(prev => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [category]: [...prev[dayKey][category], task]
        }
      }));
    }
  };

  const removeTask = async (dayKey: DayKey, category: Category, taskId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('routine_templates')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Error removing task", description: error.message, variant: "destructive" });
      return;
    }

    setRoutines(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [category]: prev[dayKey][category].filter(task => task.id !== taskId)
      }
    }));
  };

  const toggleCompletion = async (taskId: string, date: string) => {
    if (!user) return;

    const isCompleted = completions[date]?.includes(taskId);

    if (isCompleted) {
      // Remove completion
      const { error } = await supabase
        .from('daily_completions')
        .delete()
        .eq('routine_template_id', taskId)
        .eq('completion_date', date)
        .eq('user_id', user.id);

      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [date]: prev[date]?.filter(id => id !== taskId) || []
        }));
      }
    } else {
      // Add completion
      const { error } = await supabase
        .from('daily_completions')
        .insert({
          user_id: user.id,
          routine_template_id: taskId,
          completion_date: date
        });

      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [date]: [...(prev[date] || []), taskId]
        }));
      }
    }
  };

  return { routines, completions, addTask, removeTask, toggleCompletion };
}

export function useHabits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletions>({});

  // Load habits from database
  useEffect(() => {
    if (!user) return;

    const loadHabits = async () => {
      const { data } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at');

      if (data) {
        const mappedHabits: Habit[] = data.map(h => ({
          id: h.id,
          title: h.title,
          icon: h.icon || '⭐',
          color: h.color || '#3B82F6',
          active: h.is_active
        }));
        setHabits(mappedHabits);
      }
    };

    loadHabits();
  }, [user]);

  // Load habit completions
  useEffect(() => {
    if (!user) return;

    const loadCompletions = async () => {
      const { data } = await supabase
        .from('habit_completions')
        .select('habit_id, completion_date')
        .eq('user_id', user.id);

      if (data) {
        const newCompletions: HabitCompletions = {};
        data.forEach((completion) => {
          const date = completion.completion_date;
          if (!newCompletions[date]) newCompletions[date] = [];
          newCompletions[date].push(completion.habit_id);
        });
        setCompletions(newCompletions);
      }
    };

    loadCompletions();
  }, [user]);

  const addHabit = async (title: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        title
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error adding habit", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      const habit: Habit = {
        id: data.id,
        title: data.title,
        icon: data.icon || '⭐',
        color: data.color || '#3B82F6',
        active: true
      };
      setHabits(prev => [...prev, habit]);
    }
  };

  const removeHabit = async (habitId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Error removing habit", description: error.message, variant: "destructive" });
      return;
    }

    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    const isCompleted = completions[date]?.includes(habitId);

    if (isCompleted) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', date)
        .eq('user_id', user.id);

      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [date]: prev[date]?.filter(id => id !== habitId) || []
        }));
      }
    } else {
      const { error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          completion_date: date
        });

      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [date]: [...(prev[date] || []), habitId]
        }));
      }
    }
  };

  return { habits, completions, addHabit, removeHabit, toggleHabitCompletion };
}

export function useMoods() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntries>({});

  useEffect(() => {
    if (!user) return;

    const loadMoods = async () => {
      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const newMoods: MoodEntries = {};
        data.forEach((entry) => {
          newMoods[entry.entry_date] = {
            level: moodLevelMap[entry.mood_level] || 2,
            notes: entry.notes || undefined
          };
        });
        setMoods(newMoods);
      }
    };

    loadMoods();
  }, [user]);

  const setMood = async (date: string, level: 0 | 1 | 2 | 3 | 4, notes?: string) => {
    if (!user) return;

    const moodLevelValue = ['very_bad', 'bad', 'neutral', 'good', 'very_good'][level] as 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';

    const { error } = await supabase
      .from('mood_entries')
      .upsert({
        user_id: user.id,
        entry_date: date,
        mood_level: moodLevelValue,
        notes: notes || null
      } as any);

    if (!error) {
      setMoods(prev => ({
        ...prev,
        [date]: { level, notes }
      }));
    }
  };

  return { moods, setMood };
}