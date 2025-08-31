import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Habit, HabitCompletions, MoodEntries, RoutineState, TaskCompletions } from "@/types/lifeo";

export default function Settings() {
  const [routines, setRoutines] = useLocalStorage<RoutineState>("lifeo.routines", {
    monday: { morning: [], daily: [], evening: [] },
    tuesday: { morning: [], daily: [], evening: [] },
    wednesday: { morning: [], daily: [], evening: [] },
    thursday: { morning: [], daily: [], evening: [] },
    friday: { morning: [], daily: [], evening: [] },
    saturday: { morning: [], daily: [], evening: [] },
    sunday: { morning: [], daily: [], evening: [] },
  });
  const [habits, setHabits] = useLocalStorage<Habit[]>("lifeo.habits", []);
  const [habitCompletions, setHabitCompletions] = useLocalStorage<HabitCompletions>("lifeo.habitCompletions", {});
  const [taskCompletions, setTaskCompletions] = useLocalStorage<TaskCompletions>("lifeo.completions", {});
  const [moods, setMoods] = useLocalStorage<MoodEntries>("lifeo.moods", {} as MoodEntries);

  function exportData() {
    const data = { routines, habits, habitCompletions, taskCompletions, moods };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lifeo-backup.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.routines) setRoutines(data.routines);
        if (data.habits) setHabits(data.habits);
        if (data.habitCompletions) setHabitCompletions(data.habitCompletions);
        if (data.taskCompletions) setTaskCompletions(data.taskCompletions);
        if (data.moods) setMoods(data.moods);
      } catch {}
    };
    reader.readAsText(file);
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('lifeo.theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }

  return (
    <section aria-labelledby="settings-title" className="space-y-4">
      <h1 id="settings-title" className="text-3xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleTheme}>Toggle Light/Dark</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export / Import</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button onClick={exportData}>Export data</Button>
          <label className="text-sm">Import JSON
            <input type="file" accept="application/json" className="block mt-1" onChange={importData} />
          </label>
        </CardContent>
      </Card>
    </section>
  );
}
