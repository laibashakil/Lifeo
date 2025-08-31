import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Category, DayKey, RoutineState, TaskTemplate } from "@/types/lifeo";

const days: DayKey[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
];

const emptyDay = () => ({ morning: [], daily: [], evening: [] });

export default function Routines() {
  const { toast } = useToast();
  const [routines, setRoutines] = useLocalStorage<RoutineState>("lifeo.routines", {
    monday: emptyDay(), tuesday: emptyDay(), wednesday: emptyDay(),
    thursday: emptyDay(), friday: emptyDay(), saturday: emptyDay(), sunday: emptyDay()
  });
  const [currentDay, setCurrentDay] = useState<DayKey>(days[new Date().getDay() === 0 ? 6 : new Date().getDay()-1]);

  const totalCount = useMemo(() => {
    const d = routines[currentDay];
    return d.morning.length + d.daily.length + d.evening.length;
  }, [routines, currentDay]);

  function addTask(category: Category, title: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    setRoutines(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [category]: [...prev[currentDay][category], { id, title, category, active: true, sort: Date.now() } as TaskTemplate]
      }
    }));
  }

  function removeTask(category: Category, id: string) {
    setRoutines(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [category]: prev[currentDay][category].filter(t => t.id !== id)
      }
    }));
  }

  function copyToAllDays() {
    setRoutines(prev => {
      const src = prev[currentDay];
      const next = { ...prev } as RoutineState;
      for (const d of days) {
        if (d === currentDay) continue;
        next[d] = {
          morning: src.morning.map(t => ({ ...t, id: `${t.id}-${d}` })),
          daily: src.daily.map(t => ({ ...t, id: `${t.id}-${d}` })),
          evening: src.evening.map(t => ({ ...t, id: `${t.id}-${d}` })),
        };
      }
      return next;
    });
    toast({ title: "Copied", description: `Routine copied to other days.` });
  }

  const DayEditor = ({ category }: { category: Category }) => {
    const [newTitle, setNewTitle] = useState("");
    const tasks = routines[currentDay][category];
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder={`Add ${category} task`} value={newTitle} onChange={e=>setNewTitle(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter' && newTitle.trim()){ addTask(category, newTitle.trim()); setNewTitle(""); } }} />
          <Button onClick={()=>{ if(newTitle.trim()){ addTask(category, newTitle.trim()); setNewTitle(""); } }}>Add</Button>
        </div>
        <Separator />
        <ul className="space-y-2">
          {tasks.map((t)=> (
            <li key={t.id} className="flex items-center justify-between p-3 rounded-md bg-card card-glow">
              <span>{t.title}</span>
              <Button variant="secondary" onClick={()=>removeTask(category, t.id)}>Remove</Button>
            </li>
          ))}
          {tasks.length===0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
        </ul>
      </div>
    );
  };

  return (
    <section aria-labelledby="routines-title" className="space-y-4">
      <h1 id="routines-title" className="text-3xl font-semibold">Routine Templates</h1>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl">Customize by day</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={currentDay} onValueChange={(v)=>setCurrentDay(v as DayKey)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Select day"/></SelectTrigger>
              <SelectContent>
                {days.map(d=> <SelectItem key={d} value={d}>{d[0].toUpperCase()+d.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={copyToAllDays}>Copy to all days</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="morning">
            <TabsList>
              <TabsTrigger value="morning">Morning</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="evening">Evening</TabsTrigger>
            </TabsList>
            <TabsContent value="morning"><DayEditor category="morning"/></TabsContent>
            <TabsContent value="daily"><DayEditor category="daily"/></TabsContent>
            <TabsContent value="evening"><DayEditor category="evening"/></TabsContent>
          </Tabs>
          <p className="mt-4 text-sm text-muted-foreground">Total tasks today: {totalCount}</p>
        </CardContent>
      </Card>
    </section>
  );
}
