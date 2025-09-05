import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useSupabaseData";
import { todayKey } from "@/utils/date";
import { HabitIcon } from "@/components/HabitIcon";
import { Flame } from "lucide-react";

export default function Habits() {
  const { toast } = useToast();
  const { habits, completions, addHabit, removeHabit, toggleHabitCompletion } = useHabits();
  const [title, setTitle] = useState("");
  const today = todayKey();

  async function handleAddHabit() {
    if (!title.trim()) return;
    await addHabit(title.trim());
    setTitle("");
    toast({ title: "Habit added", description: "Your new habit has been added successfully!" });
  }

  const doneToday = completions[today] || [];

  const streaks = useMemo(() => {
    // Simple streak: count consecutive days present in completions moving backwards
    const result: Record<string, number> = {};
    for (const h of habits) {
      let streak = 0;
      for (let i=0; i<365; i++) {
        const d = new Date(); 
        d.setDate(d.getDate()-i);
        const key = todayKey(d);
        const arr = completions[key] || [];
        if (arr.includes(h.id)) streak++; 
        else break;
      }
      result[h.id] = streak;
    }
    return result;
  }, [habits, completions]);

  return (
    <section aria-labelledby="habits-title" className="space-y-4 animate-fade-in">
      <h1 id="habits-title" className="text-3xl font-semibold">Habits</h1>
      
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Add New Habit</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input 
            placeholder="e.g., Read 10 minutes, Exercise, Meditate" 
            value={title} 
            onChange={e=>setTitle(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter') handleAddHabit(); }} 
          />
          <Button onClick={handleAddHabit}>Add</Button>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Today's Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {habits.map(h => (
              <li key={h.id} className="flex items-center justify-between p-4 rounded-lg bg-card card-glow animate-slide-up">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={doneToday.includes(h.id)} 
                    onCheckedChange={()=>toggleHabitCompletion(h.id, today)} 
                  />
                  <div className="flex items-center gap-2">
                    <HabitIcon iconName={h.icon} className="h-5 w-5" />
                    <span className={doneToday.includes(h.id) ? "line-through text-muted-foreground" : ""}>
                      {h.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                      {streaks[h.id] || 0} day streak
                    </div>
                    {streaks[h.id] > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        Keep it up! <Flame className="h-3 w-3 text-orange-500" />
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={()=>removeHabit(h.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
            {habits.length===0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No habits yet</p>
                <p className="text-sm text-muted-foreground">
                  Start building better habits by adding your first one above!
                </p>
              </div>
            )}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
