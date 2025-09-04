import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRoutines, useHabits, useMoods } from "@/hooks/useSupabaseData";
import { useDummyData } from "@/hooks/useDummyData";
import { todayKey, weekdayKey } from "@/utils/date";
import type { DayKey } from "@/types/lifeo";
import { Link } from "react-router-dom";

const Index = () => {
  useDummyData(); // Initialize dummy data
  const { routines, completions, toggleCompletion } = useRoutines();
  const { habits, completions: habitCompletions, toggleHabitCompletion } = useHabits();
  const { moods, setMood } = useMoods();
  const [note, setNote] = useState("");
  
  const today = new Date();
  const dayKey = weekdayKey(today) as DayKey;
  const dateKey = todayKey(today);

  useEffect(() => { 
    document.title = "Lifeo — Dashboard"; 
    // Load existing notes for today
    const existingMood = moods[dateKey];
    if (existingMood?.notes) {
      setNote(existingMood.notes);
    }
  }, [moods, dateKey]);

  const day = routines[dayKey];
  const total = day.morning.length + day.daily.length + day.evening.length;
  const doneIds = completions[dateKey] || [];

  const count = useMemo(() => doneIds.length, [doneIds]);
  const pct = total ? Math.round((count / total) * 100) : 0;

  const moodsList = ["😞","🙁","😐","🙂","😄"] as const;
  const currentMood = moods[dateKey]?.level;

  function handleSetMood(level: 0|1|2|3|4) {
    setMood(dateKey, level, note);
  }

  function handleMoodNotes() {
    const currentMoodEntry = moods[dateKey];
    setMood(dateKey, currentMoodEntry?.level ?? 2, note);
  }

  const doneHabits = habitCompletions[dateKey] || [];

  return (
    <section aria-labelledby="dashboard-title" className="space-y-4 sm:space-y-6 animate-fade-in">
      <header>
        <h1 id="dashboard-title" className="text-2xl sm:text-3xl font-semibold">Today</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{today.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })}</p>
      </header>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={pct} className="h-2 sm:h-3" aria-label={`Overall ${pct}%`} />
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{count}/{total} routine tasks completed</p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {(["morning","daily","evening"] as const).map((cat) => (
          <Card key={cat} className="card-glow animate-slide-up">
            <CardHeader><CardTitle>{cat[0].toUpperCase()+cat.slice(1)} Routine</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {day[cat].map(t => (
                  <li key={t.id} className="flex items-center gap-2 sm:gap-3 smooth-transition">
                    <Checkbox 
                      checked={doneIds.includes(t.id)} 
                      onCheckedChange={()=>toggleCompletion(t.id, dateKey)}
                      className="touch-manipulation"
                    />
                    <span className={`text-sm sm:text-base ${doneIds.includes(t.id) ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                  </li>
                ))}
                {day[cat].length===0 && (
                  <p className="text-sm text-muted-foreground">
                    No tasks yet. <Link to="/routines" className="text-primary hover:underline">Add some tasks</Link>
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Habits Section */}
      {habits.length > 0 && (
        <Card className="card-glow animate-slide-up">
          <CardHeader><CardTitle>Today's Habits</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {habits.map(habit => (
                <li key={habit.id} className="flex items-center gap-2 sm:gap-3 smooth-transition">
                  <Checkbox 
                    checked={doneHabits.includes(habit.id)} 
                    onCheckedChange={()=>toggleHabitCompletion(habit.id, dateKey)}
                    className="touch-manipulation"
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{habit.icon}</span>
                    <span className={`text-sm sm:text-base ${doneHabits.includes(habit.id) ? "line-through text-muted-foreground" : ""}`}>
                      {habit.title}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="card-glow animate-slide-up">
          <CardHeader><CardTitle>Mood Check-in</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 sm:gap-2 mb-3 flex-wrap">
              {moodsList.map((e, i) => (
                <button 
                  key={i} 
                  aria-label={`Mood ${i}`} 
                  className={`text-xl sm:text-2xl p-2 sm:p-3 rounded-md smooth-transition hover-glow touch-manipulation ${
                    currentMood===i? 'bg-accent':'hover:bg-accent/60'
                  }`} 
                  onClick={()=>handleSetMood(i as 0|1|2|3|4)}
                >
                  {e}
                </button>
              ))}
            </div>
            <textarea 
              className="w-full rounded-md border bg-background p-2 sm:p-3 smooth-transition text-sm sm:text-base touch-manipulation" 
              placeholder="Optional notes about your mood today" 
              value={note} 
              onChange={e=>setNote(e.target.value)} 
              onBlur={handleMoodNotes}
              rows={2}
            />
          </CardContent>
        </Card>

        <Card className="card-glow animate-slide-up">
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground">Organize your life and build better habits</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="justify-start touch-manipulation">
                  <Link to="/routines">📅 Setup routines</Link>
                </Button>
                <Button variant="secondary" asChild className="justify-start touch-manipulation">
                  <Link to="/habits">🎯 Manage habits</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start touch-manipulation">
                  <Link to="/calendar">📊 View calendar</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Index;
