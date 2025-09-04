import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Target, Smile, X } from "lucide-react";
import { useRoutines, useHabits, useMoods } from "@/hooks/useSupabaseData";
import MoodGrid from "@/components/MoodGrid";
import { useDummyData } from "@/hooks/useDummyData";
import { useAnalyticsSettings } from "@/hooks/useAnalyticsSettings";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--energy))', 'hsl(var(--inspiration))', 'hsl(var(--wellness))'];

export default function Analytics() {
  useDummyData(); // Initialize dummy data
  const { routines, completions } = useRoutines();
  const { habits, completions: habitCompletions } = useHabits();
  const { moods } = useMoods();
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const { isVisible, removeCard } = useAnalyticsSettings();

  // Generate date range
  const dateRange = useMemo(() => {
    const days = parseInt(timeRange);
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [timeRange]);

  // Calculate daily completion rates
  const dailyData = useMemo(() => {
    return dateRange.map(date => {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof routines;
      const dayRoutines = routines[dayOfWeek];
      const totalTasks = dayRoutines.morning.length + dayRoutines.daily.length + dayRoutines.evening.length;
      const completedTasks = completions[date]?.length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const completedHabits = habitCompletions[date]?.length || 0;
      const habitRate = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

      const mood = moods[date]?.level ?? null;

      return {
        date,
        dateFormatted: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        routineCompletion: completionRate,
        habitCompletion: habitRate,
        mood: mood !== null ? mood + 1 : null
      };
    });
  }, [dateRange, routines, completions, habits, habitCompletions, moods]);

  // Calculate streak data
  const streakData = useMemo(() => {
    return habits.map(habit => {
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        if (habitCompletions[dateKey]?.includes(habit.id)) {
          streak++;
        } else {
          break;
        }
      }
      return { name: habit.title, streak, color: habit.color };
    });
  }, [habits, habitCompletions]);

  // Category completion data
  const categoryData = useMemo(() => {
    const categories = { morning: 0, daily: 0, evening: 0 };
    const categoryTotals = { morning: 0, daily: 0, evening: 0 };

    dateRange.forEach(date => {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof routines;
      const dayRoutines = routines[dayOfWeek];
      const dateCompletions = completions[date] || [];

      Object.entries(dayRoutines).forEach(([category, tasks]) => {
        const cat = category as keyof typeof categories;
        categoryTotals[cat] += tasks.length;
        categories[cat] += tasks.filter(task => dateCompletions.includes(task.id)).length;
      });
    });

    return Object.entries(categories).map(([category, completed]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      completed,
      total: categoryTotals[category as keyof typeof categoryTotals],
      percentage: categoryTotals[category as keyof typeof categoryTotals] > 0 
        ? Math.round((completed / categoryTotals[category as keyof typeof categoryTotals]) * 100) 
        : 0
    }));
  }, [dateRange, routines, completions]);

  // Average stats
  const averageStats = useMemo(() => {
    const totalDays = dailyData.length;
    if (totalDays === 0) return { routine: 0, habit: 0, mood: 0 };

    const avgRoutine = Math.round(dailyData.reduce((sum, day) => sum + day.routineCompletion, 0) / totalDays);
    const avgHabit = Math.round(dailyData.reduce((sum, day) => sum + day.habitCompletion, 0) / totalDays);
    const moodEntries = dailyData.filter(day => day.mood !== null);
    const avgMood = moodEntries.length > 0 
      ? (moodEntries.reduce((sum, day) => sum + (day.mood || 0), 0) / moodEntries.length).toFixed(1)
      : 0;

    return { routine: avgRoutine, habit: avgHabit, mood: parseFloat(avgMood.toString()) };
  }, [dailyData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold" id="analytics-title">Analytics & Insights</h2>
        <Select value={timeRange} onValueChange={(value: "7" | "30" | "90") => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      {isVisible("overview-stats") && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-glow relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20"
              onClick={() => removeCard("overview-stats")}
            >
              <X className="h-3 w-3 text-destructive" />
            </Button>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Routine</p>
                  <p className="text-2xl font-semibold">{averageStats.routine}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-habit-primary/10">
                  <TrendingUp className="h-5 w-5 text-habit-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Habits</p>
                  <p className="text-2xl font-semibold">{averageStats.habit}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-energy/10">
                  <Smile className="h-5 w-5 text-energy" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Mood</p>
                  <p className="text-2xl font-semibold">{averageStats.mood}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-inspiration/10">
                  <Calendar className="h-5 w-5 text-inspiration" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Tracked</p>
                  <p className="text-2xl font-semibold">{timeRange}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Over Time */}
      {isVisible("progress-over-time") && (
        <Card className="card-glow relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20 z-10"
            onClick={() => removeCard("progress-over-time")}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="dateFormatted" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="routineCompletion" stroke="hsl(var(--routine-daily))" strokeWidth={2} name="Routines" />
                <Line type="monotone" dataKey="habitCompletion" stroke="hsl(var(--habit-primary))" strokeWidth={2} name="Habits" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        {isVisible("category-performance") && (
          <Card className="card-glow relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20 z-10"
              onClick={() => removeCard("category-performance")}
            >
              <X className="h-3 w-3 text-destructive" />
            </Button>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--routine-daily))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Habit Streaks */}
        {isVisible("habit-streaks") && (
          <Card className="card-glow relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20 z-10"
              onClick={() => removeCard("habit-streaks")}
            >
              <X className="h-3 w-3 text-destructive" />
            </Button>
            <CardHeader>
              <CardTitle>Current Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {streakData.slice(0, 5).map((habit, index) => (
                  <div key={habit.name} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <span className="font-medium">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{habit.streak} days</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                  </div>
                ))}
                {streakData.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No habits to track yet. Add some habits to see your streaks!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mood Grid */}
      {isVisible("mood-grid") && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20 z-10"
            onClick={() => removeCard("mood-grid")}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
          <MoodGrid />
        </div>
      )}

      {/* Mood Trends Chart */}
      {isVisible("mood-trends") && Object.keys(moods).length > 0 && (
        <Card className="card-glow relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20 z-10"
            onClick={() => removeCard("mood-trends")}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
          <CardHeader>
            <CardTitle>Mood Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData.filter(d => d.mood !== null)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="dateFormatted" />
                <YAxis domain={[1, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => {
                    const moods = ['😞', '🙁', '😐', '🙂', '😄'];
                    return [moods[Number(value) - 1], 'Mood'];
                  }}
                />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--energy))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}