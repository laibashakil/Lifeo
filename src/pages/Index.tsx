import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { RoutineState, TaskCompletions, MoodEntries, DayKey } from "@/types/lifeo";
import { todayKey, weekdayKey } from "@/utils/date";

const emptyDay = () => ({ morning: [], daily: [], evening: [] });

const Index = () => {
  const [routines] = useLocalStorage<RoutineState>("lifeo.routines", {
    monday: emptyDay(), tuesday: emptyDay(), wednesday: emptyDay(),
    thursday: emptyDay(), friday: emptyDay(), saturday: emptyDay(), sunday: emptyDay()
  });
  const [completions, setCompletions] = useLocalStorage<TaskCompletions>("lifeo.completions", {});
  const [moods, setMoods] = useLocalStorage<MoodEntries>("lifeo.moods", {} as MoodEntries);
  const [note, setNote] = useState("");
  const today = new Date();
  const dayKey = weekdayKey(today) as DayKey;
  const dateKey = todayKey(today);

  useEffect(() => { document.title = "Lifeo — Dashboard"; }, []);

  const day = routines[dayKey];
  const total = day.morning.length + day.daily.length + day.evening.length;
  const doneIds = completions[dateKey] || [];

  const count = useMemo(() => doneIds.length, [doneIds]);
  const pct = total ? Math.round((count / total) * 100) : 0;

  function toggle(id: string) {
    setCompletions(prev => {
      const list = prev[dateKey] || [];
      const exists = list.includes(id);
      const next = exists ? list.filter(x=>x!==id) : [...list, id];
      return { ...prev, [dateKey]: next };
    });
  }

  const moodsList = ["😞","🙁","😐","🙂","😄"] as const;
  const currentMood = moods[dateKey]?.level;

  function setMood(level: 0|1|2|3|4) {
    setMoods(prev => ({ ...prev, [dateKey]: { level, notes: prev[dateKey]?.notes } }));
  }

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
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
          <p className="mt-2 text-sm text-muted-foreground">{count}/{total} tasks completed</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {(["morning","daily","evening"] as const).map((cat) => (
          <Card key={cat} className="card-glow">
            <CardHeader><CardTitle>{cat[0].toUpperCase()+cat.slice(1)} Routine</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {day[cat].map(t => (
                  <li key={t.id} className="flex items-center gap-3">
                    <Checkbox checked={doneIds.includes(t.id)} onCheckedChange={()=>toggle(t.id)} />
                    <span>{t.title}</span>
                  </li>
                ))}
                {day[cat].length===0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="card-glow">
          <CardHeader><CardTitle>Mood Check-in</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {moodsList.map((e, i) => (
                <button key={i} aria-label={`Mood ${i}`} className={`text-2xl p-2 rounded-md ${currentMood===i? 'bg-accent':'hover:bg-accent/60'}`} onClick={()=>setMood(i as 0|1|2|3|4)}>{e}</button>
              ))}
            </div>
            <textarea className="mt-3 w-full rounded-md border bg-background p-2" placeholder="Optional notes" value={note} onChange={e=>setNote(e.target.value)} onBlur={()=>setMoods(prev=> ({...prev, [dateKey]: { level: prev[dateKey]?.level ?? 2, notes: note }}))} />
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader><CardTitle>Get set up</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Add your routine templates and habits to start tracking.</p>
            <div className="mt-3 flex gap-2">
              <Button asChild><a href="/routines">Setup routines</a></Button>
              <Button variant="secondary" asChild><a href="/habits">Add habits</a></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Index;
