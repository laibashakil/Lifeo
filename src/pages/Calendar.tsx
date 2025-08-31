import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthDays, todayKey, weekdayKey } from "@/utils/date";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { RoutineState, TaskCompletions } from "@/types/lifeo";

export default function CalendarPage() {
  const now = new Date();
  const days = monthDays(now.getFullYear(), now.getMonth());
  const [routines] = useLocalStorage<RoutineState>("lifeo.routines", {
    monday: { morning: [], daily: [], evening: [] },
    tuesday: { morning: [], daily: [], evening: [] },
    wednesday: { morning: [], daily: [], evening: [] },
    thursday: { morning: [], daily: [], evening: [] },
    friday: { morning: [], daily: [], evening: [] },
    saturday: { morning: [], daily: [], evening: [] },
    sunday: { morning: [], daily: [], evening: [] },
  });
  const [completions] = useLocalStorage<TaskCompletions>("lifeo.completions", {});

  const pct = (date: Date) => {
    const wk = weekdayKey(date) as keyof typeof routines;
    const total = routines[wk].morning.length + routines[wk].daily.length + routines[wk].evening.length;
    if (!total) return 0;
    const key = todayKey(date);
    const done = (completions[key] || []).length;
    return Math.round((done / total) * 100);
  };

  const colorFor = (p: number) => {
    if (p === 0) return "bg-muted";
    if (p < 34) return "bg-accent";
    if (p < 67) return "bg-secondary";
    return "bg-primary";
  };

  return (
    <section aria-labelledby="calendar-title" className="space-y-4">
      <h1 id="calendar-title" className="text-3xl font-semibold">Monthly Progress</h1>
      <Card>
        <CardHeader>
          <CardTitle>{now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const p = pct(d);
              return (
                <div key={d.toISOString()} className="p-2 rounded-md border text-center">
                  <div className={`mx-auto h-8 w-8 rounded ${colorFor(p)}`} aria-label={`Completion ${p}%`} />
                  <div className="mt-1 text-xs text-muted-foreground">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
