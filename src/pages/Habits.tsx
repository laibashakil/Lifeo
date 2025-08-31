import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Habit, HabitCompletions } from "@/types/lifeo";
import { todayKey } from "@/utils/date";

export default function Habits() {
  const { toast } = useToast();
  const [habits, setHabits] = useLocalStorage<Habit[]>("lifeo.habits", []);
  const [completions, setCompletions] = useLocalStorage<HabitCompletions>("lifeo.habitCompletions", {});
  const [title, setTitle] = useState("");
  const today = todayKey();

  function addHabit() {
    if (!title.trim()) return;
    const h: Habit = { id: `${Date.now()}`, title: title.trim(), active: true };
    setHabits(prev => [...prev, h]);
    setTitle("");
    toast({ title: "Habit added" });
  }
  function toggleToday(id: string) {
    setCompletions(prev => {
      const day = prev[today] || [];
      const isDone = day.includes(id);
      const next = isDone ? day.filter(x=>x!==id) : [...day, id];
      return { ...prev, [today]: next };
    });
  }
  const doneToday = completions[today] || [];

  const streaks = useMemo(() => {
    // simple streak: count consecutive days present in completions moving backwards
    const result: Record<string, number> = {};
    for (const h of habits) {
      let streak = 0;
      for (let i=0; i<365; i++) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = todayKey(d);
        const arr = completions[key] || [];
        if (arr.includes(h.id)) streak++; else break;
      }
      result[h.id] = streak;
    }
    return result;
  }, [habits, completions]);

  function removeHabit(id: string) {
    setHabits(prev => prev.filter(h=>h.id!==id));
  }

  return (
    <section aria-labelledby="habits-title" className="space-y-4">
      <h1 id="habits-title" className="text-3xl font-semibold">Habits</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add habit</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="e.g., Read 10 minutes" value={title} onChange={e=>setTitle(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter') addHabit(); }} />
          <Button onClick={addHabit}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's habits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {habits.map(h => (
              <li key={h.id} className="flex items-center justify-between p-3 rounded-md bg-card card-glow">
                <div className="flex items-center gap-3">
                  <Checkbox checked={doneToday.includes(h.id)} onCheckedChange={()=>toggleToday(h.id)} />
                  <span>{h.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Streak: {streaks[h.id] || 0}</span>
                  <Button variant="secondary" onClick={()=>removeHabit(h.id)}>Remove</Button>
                </div>
              </li>
            ))}
            {habits.length===0 && <p className="text-sm text-muted-foreground">No habits yet.</p>}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
