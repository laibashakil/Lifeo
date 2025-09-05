import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useDummyData() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const createDummyData = async () => {
      // Check if dummy data already exists
      const { data: existingRoutines } = await supabase
        .from('routine_templates')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const { data: existingHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Only create dummy data if none exists
      if (!existingRoutines?.length && !existingHabits?.length) {
        console.log('Creating dummy data...');

        // Check if dummy data creation is already in progress
        const isDummyDataCreating = localStorage.getItem('dummy-data-creating');
        if (isDummyDataCreating) {
          console.log('Dummy data creation already in progress, skipping...');
          return;
        }
        
        // Mark dummy data creation as in progress
        localStorage.setItem('dummy-data-creating', 'true');

        // Create routine templates
        const routineTemplates = [
          // Monday
          { day_of_week: 'monday' as const, category: 'morning' as const, title: 'Morning meditation', user_id: user.id },
          { day_of_week: 'monday' as const, category: 'morning' as const, title: 'Review daily goals', user_id: user.id },
          { day_of_week: 'monday' as const, category: 'daily' as const, title: 'Check emails', user_id: user.id },
          { day_of_week: 'monday' as const, category: 'daily' as const, title: 'Deep work session', user_id: user.id },
          { day_of_week: 'monday' as const, category: 'evening' as const, title: 'Plan tomorrow', user_id: user.id },
          
          // Tuesday
          { day_of_week: 'tuesday' as const, category: 'morning' as const, title: 'Morning workout', user_id: user.id },
          { day_of_week: 'tuesday' as const, category: 'morning' as const, title: 'Healthy breakfast', user_id: user.id },
          { day_of_week: 'tuesday' as const, category: 'daily' as const, title: 'Team standup', user_id: user.id },
          { day_of_week: 'tuesday' as const, category: 'daily' as const, title: 'Project review', user_id: user.id },
          { day_of_week: 'tuesday' as const, category: 'evening' as const, title: 'Read for 30 mins', user_id: user.id },
          
          // Wednesday
          { day_of_week: 'wednesday' as const, category: 'morning' as const, title: 'Journal writing', user_id: user.id },
          { day_of_week: 'wednesday' as const, category: 'daily' as const, title: 'Client calls', user_id: user.id },
          { day_of_week: 'wednesday' as const, category: 'daily' as const, title: 'Creative work', user_id: user.id },
          { day_of_week: 'wednesday' as const, category: 'evening' as const, title: 'Cook healthy dinner', user_id: user.id },
          
          // Thursday
          { day_of_week: 'thursday' as const, category: 'morning' as const, title: 'Morning walk', user_id: user.id },
          { day_of_week: 'thursday' as const, category: 'daily' as const, title: 'Administrative tasks', user_id: user.id },
          { day_of_week: 'thursday' as const, category: 'daily' as const, title: 'Learning session', user_id: user.id },
          { day_of_week: 'thursday' as const, category: 'evening' as const, title: 'Social activity', user_id: user.id },
          
          // Friday
          { day_of_week: 'friday' as const, category: 'morning' as const, title: 'Week review', user_id: user.id },
          { day_of_week: 'friday' as const, category: 'daily' as const, title: 'Finish weekly goals', user_id: user.id },
          { day_of_week: 'friday' as const, category: 'evening' as const, title: 'Weekend planning', user_id: user.id },
          
          // Weekend
          { day_of_week: 'saturday' as const, category: 'morning' as const, title: 'Sleep in', user_id: user.id },
          { day_of_week: 'saturday' as const, category: 'daily' as const, title: 'Hobby time', user_id: user.id },
          { day_of_week: 'saturday' as const, category: 'evening' as const, title: 'Family time', user_id: user.id },
          
          { day_of_week: 'sunday' as const, category: 'morning' as const, title: 'Sunday reflection', user_id: user.id },
          { day_of_week: 'sunday' as const, category: 'daily' as const, title: 'Meal prep', user_id: user.id },
          { day_of_week: 'sunday' as const, category: 'evening' as const, title: 'Prepare for Monday', user_id: user.id },
        ];

        try {
          await supabase.from('routine_templates').insert(routineTemplates);

          // Create habits
          const habits = [
            { title: 'Drink 8 glasses of water', icon: '💧', color: '#3B82F6', user_id: user.id },
            { title: 'Take vitamins', icon: '💊', color: '#10B981', user_id: user.id },
            { title: 'Practice gratitude', icon: '🙏', color: '#F59E0B', user_id: user.id },
            { title: 'Get 7+ hours sleep', icon: '😴', color: '#8B5CF6', user_id: user.id },
            { title: 'No social media before noon', icon: '📱', color: '#EF4444', user_id: user.id },
            { title: 'Read 20 pages', icon: '📚', color: '#06B6D4', user_id: user.id },
          ];

          await supabase.from('habits').insert(habits);

        // Create historical completions and mood entries
        const today = new Date();
        const routineInsertedData = await supabase
          .from('routine_templates')
          .select('id, day_of_week')
          .eq('user_id', user.id);

        const habitInsertedData = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id);

        if (routineInsertedData.data && habitInsertedData.data) {
          const routineCompletions = [];
          const habitCompletions = [];
          const moodEntries = [];

          // Generate 365 days of historical data (full year)
          for (let i = 365; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

            // Add routine completions (70-90% completion rate)
            const dayRoutines = routineInsertedData.data.filter(r => r.day_of_week === dayOfWeek);
            dayRoutines.forEach(routine => {
              if (Math.random() > 0.2) { // 80% chance of completion
                routineCompletions.push({
                  user_id: user.id,
                  routine_template_id: routine.id,
                  completion_date: dateKey,
                });
              }
            });

            // Add habit completions (60-85% completion rate)
            habitInsertedData.data.forEach(habit => {
              if (Math.random() > 0.25) { // 75% chance of completion
                habitCompletions.push({
                  user_id: user.id,
                  habit_id: habit.id,
                  completion_date: dateKey,
                });
              }
            });

            // Add mood entries (70% of days have mood data)
            if (Math.random() > 0.3) {
              const moodLevels = ['very_bad', 'bad', 'neutral', 'good', 'very_good'];
              // Weighted towards positive moods
              const weights = [0.05, 0.15, 0.25, 0.35, 0.2];
              let randomValue = Math.random();
              let selectedMood = 2; // default neutral
              
              for (let j = 0; j < weights.length; j++) {
                if (randomValue < weights.slice(0, j + 1).reduce((a, b) => a + b, 0)) {
                  selectedMood = j;
                  break;
                }
              }

              const notes = selectedMood <= 1 
                ? ['Tough day', 'Feeling stressed', 'Not my best day', ''][Math.floor(Math.random() * 4)]
                : selectedMood >= 4 
                ? ['Amazing day!', 'Everything went great', 'Feeling fantastic', 'Best day ever'][Math.floor(Math.random() * 4)]
                : ['', 'Pretty good day', 'Nothing special', 'Regular day'][Math.floor(Math.random() * 4)];

              moodEntries.push({
                user_id: user.id,
                entry_date: dateKey,
                mood_level: moodLevels[selectedMood],
                notes: notes || null,
              });
            }
          }

          // Insert all historical data
          if (routineCompletions.length) {
            await supabase.from('daily_completions').insert(routineCompletions);
          }
          if (habitCompletions.length) {
            await supabase.from('habit_completions').insert(habitCompletions);
          }
          if (moodEntries.length) {
            await supabase.from('mood_entries').insert(moodEntries);
          }

          console.log('Dummy data created successfully!');
          
          // Clear the dummy data creation flag
          localStorage.removeItem('dummy-data-creating');
        }
        } catch (error) {
          console.error('Error inserting dummy data:', error);
          localStorage.removeItem('dummy-data-creating');
          throw error;
        }
      } else {
        console.log('Dummy data already exists, skipping creation...');
      }
    };

    createDummyData().catch((error) => {
      console.error('Error creating dummy data:', error);
      // Clear the dummy data creation flag on error
      localStorage.removeItem('dummy-data-creating');
    });
  }, [user]);
}