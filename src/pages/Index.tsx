import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRoutines, useHabits, useMoods } from "@/hooks/useSupabaseData";
import { useDummyData } from "@/hooks/useDummyData";
import { useAnalyticsSettings } from "@/hooks/useAnalyticsSettings";
import { todayKey, weekdayKey } from "@/utils/date";
import type { DayKey } from "@/types/lifeo";
import { Link } from "react-router-dom";
import { Angry, Frown, Meh, Smile, Laugh, Calendar, Target, BarChart3 } from "lucide-react";
import { HabitIcon } from "@/components/HabitIcon";

const Index = () => {
  useDummyData(); // Initialize dummy data
  const { routines, completions, toggleCompletion } = useRoutines();
  const { habits, completions: habitCompletions, toggleHabitCompletion } = useHabits();
  const { moods, setMood } = useMoods();
  const { settings } = useAnalyticsSettings();
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
  const doneHabits = habitCompletions[dateKey] || [];

  const count = useMemo(() => doneIds.length, [doneIds]);
  
  // Calculate total and completed including habits if combined
  const totalItems = settings.combineWithHabits ? total + habits.length : total;
  const completedItems = settings.combineWithHabits ? count + doneHabits.length : count;
  const pct = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

  const moodIcons = [Angry, Frown, Meh, Smile, Laugh] as const;
  const moodLabels = ["Very Bad", "Bad", "Neutral", "Good", "Very Good"] as const;
  const currentMood = moods[dateKey]?.level;

  function handleSetMood(level: 0|1|2|3|4) {
    setMood(dateKey, level, note);
  }

  function handleMoodNotes() {
    const currentMoodEntry = moods[dateKey];
    setMood(dateKey, currentMoodEntry?.level ?? 2, note);
  }

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 animate-fade-in">
      <header>
        <h1 id="dashboard-title" className="text-3xl font-semibold">Today</h1>
        <p className="text-muted-foreground">{today.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })}</p>
      </header>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={pct} className="h-3" aria-label={`Overall ${pct}%`} />
          <p className="mt-2 text-sm text-muted-foreground">
            {completedItems}/{totalItems} {settings.combineWithHabits ? 'tasks & habits' : 'routine tasks'} completed
          </p>
        </CardContent>
      </Card>

      {settings.combineTaskCategories ? (
        // Combined view - all tasks in one card
        <Card className="card-glow animate-slide-up">
          <CardHeader><CardTitle>Today's Tasks{settings.combineWithHabits && ' & Habits'}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {/* Morning tasks */}
              {day.morning.length > 0 && (
                <>
                  <li className="text-sm font-semibold text-muted-foreground pt-2">Morning</li>
                  {day.morning.map(t => (
                    <li key={t.id} className="flex items-center gap-3 smooth-transition pl-2">
                      <Checkbox 
                        checked={doneIds.includes(t.id)} 
                        onCheckedChange={()=>toggleCompletion(t.id, dateKey)} 
                      />
                      <span className={doneIds.includes(t.id) ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                    </li>
                  ))}
                </>
              )}
              
              {/* Daily tasks */}
              {day.daily.length > 0 && (
                <>
                  <li className="text-sm font-semibold text-muted-foreground pt-2">Daily</li>
                  {day.daily.map(t => (
                    <li key={t.id} className="flex items-center gap-3 smooth-transition pl-2">
                      <Checkbox 
                        checked={doneIds.includes(t.id)} 
                        onCheckedChange={()=>toggleCompletion(t.id, dateKey)} 
                      />
                      <span className={doneIds.includes(t.id) ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                    </li>
                  ))}
                </>
              )}
              
              {/* Evening tasks */}
              {day.evening.length > 0 && (
                <>
                  <li className="text-sm font-semibold text-muted-foreground pt-2">Evening</li>
                  {day.evening.map(t => (
                    <li key={t.id} className="flex items-center gap-3 smooth-transition pl-2">
                      <Checkbox 
                        checked={doneIds.includes(t.id)} 
                        onCheckedChange={()=>toggleCompletion(t.id, dateKey)} 
                      />
                      <span className={doneIds.includes(t.id) ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                    </li>
                  ))}
                </>
              )}
              
              {/* Habits (if combined) */}
              {settings.combineWithHabits && habits.length > 0 && (
                <>
                  <li className="text-sm font-semibold text-muted-foreground pt-2">Habits</li>
                  {habits.map(habit => (
                    <li key={habit.id} className="flex items-center gap-3 smooth-transition pl-2">
                      <Checkbox 
                        checked={doneHabits.includes(habit.id)} 
                        onCheckedChange={()=>toggleHabitCompletion(habit.id, dateKey)} 
                      />
                      <span className="flex items-center gap-2">
                        <HabitIcon iconName={habit.icon} className="h-4 w-4" />
                        <span className={doneHabits.includes(habit.id) ? "line-through text-muted-foreground" : ""}>
                          {habit.title}
                        </span>
                      </span>
                    </li>
                  ))}
                </>
              )}
              
              {total === 0 && (!settings.combineWithHabits || habits.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks yet. <Link to="/routines" className="text-primary hover:underline">Add some tasks</Link>
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      ) : (
        // Separate view - tasks by category
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {(["morning","daily","evening"] as const).map((cat) => (
              <Card key={cat} className="card-glow animate-slide-up">
                <CardHeader><CardTitle>{cat[0].toUpperCase()+cat.slice(1)} Routine</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {day[cat].map(t => (
                      <li key={t.id} className="flex items-center gap-3 smooth-transition">
                        <Checkbox 
                          checked={doneIds.includes(t.id)} 
                          onCheckedChange={()=>toggleCompletion(t.id, dateKey)} 
                        />
                        <span className={doneIds.includes(t.id) ? "line-through text-muted-foreground" : ""}>{t.title}</span>
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

          {/* Habits Section - only show separately if not combined */}
          {!settings.combineWithHabits && habits.length > 0 && (
            <Card className="card-glow animate-slide-up">
              <CardHeader><CardTitle>Today's Habits</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {habits.map(habit => (
                    <li key={habit.id} className="flex items-center gap-3 smooth-transition">
                      <Checkbox 
                        checked={doneHabits.includes(habit.id)} 
                        onCheckedChange={()=>toggleHabitCompletion(habit.id, dateKey)} 
                      />
                      <span className="flex items-center gap-2">
                        <HabitIcon iconName={habit.icon} className="h-4 w-4" />
                        <span className={doneHabits.includes(habit.id) ? "line-through text-muted-foreground" : ""}>
                          {habit.title}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="card-glow animate-slide-up">
          <CardHeader><CardTitle>Mood Check-in</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {moodIcons.map((Icon, i) => (
                <button 
                  key={i} 
                  aria-label={`Mood ${moodLabels[i]}`} 
                  className={`p-3 rounded-md smooth-transition hover-glow ${
                    currentMood===i? 'bg-accent':'hover:bg-accent/60'
                  }`} 
                  onClick={()=>handleSetMood(i as 0|1|2|3|4)}
                >
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
            <textarea 
              className="w-full rounded-md border bg-background p-2 smooth-transition" 
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
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Organize your life and build better habits</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="justify-start">
                  <Link to="/routines">
                    <Calendar className="h-4 w-4 mr-2" />
                    Setup routines
                  </Link>
                </Button>
                <Button variant="secondary" asChild className="justify-start">
                  <Link to="/habits">
                    <Target className="h-4 w-4 mr-2" />
                    Manage habits
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/calendar">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View calendar
                  </Link>
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
