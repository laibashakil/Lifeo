import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRoutines } from "@/hooks/useSupabaseData";
import RoutineBoxView from "@/components/RoutineBoxView";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidationRules, globalRateLimiter } from "@/utils/validation";
import { Grid, List, Trash2 } from "lucide-react";
import type { Category, DayKey } from "@/types/lifeo";

const days: DayKey[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
];

export default function Routines() {
  const { toast } = useToast();
  const { routines, addTask, removeTask } = useRoutines();
  const [currentDay, setCurrentDay] = useState<DayKey>(days[new Date().getDay() === 0 ? 6 : new Date().getDay()-1]);
  const [viewMode, setViewMode] = useState<"list" | "box">("list");

  const totalCount = useMemo(() => {
    const d = routines[currentDay];
    return d.morning.length + d.daily.length + d.evening.length;
  }, [routines, currentDay]);

  function copyToAllDays() {
    // This would need to be implemented with bulk operations
    toast({ title: "Feature coming soon", description: "Bulk copy will be available soon." });
  }

  const DayEditor = ({ category }: { category: Category }) => {
    const [newTitle, setNewTitle] = useState("");
    const [isValid, setIsValid] = useState(false);
    const tasks = routines[currentDay][category];
    
    const handleAddTask = async () => {
      if (!newTitle.trim() || !isValid) return;
      
      // Rate limiting check
      if (!globalRateLimiter.isAllowed('add-task', 15, 60000)) {
        toast({ 
          title: "Too many requests", 
          description: "Please wait before adding more tasks.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        await addTask(currentDay, category, newTitle.trim());
        setNewTitle("");
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to add task. Please try again.",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2">
          <ValidatedInput 
            placeholder={`Add ${category} task`} 
            value={newTitle} 
            validationRules={ValidationRules.taskTitle}
            onValueChange={(value, valid) => {
              setNewTitle(value);
              setIsValid(valid);
            }}
            onKeyDown={(e)=>{ if(e.key==='Enter' && isValid) handleAddTask(); }} 
          />
          <Button onClick={handleAddTask} disabled={!isValid || !newTitle.trim()}>
            Add
          </Button>
        </div>
        <Separator />
        <ul className="space-y-2">
          {tasks.map((t)=> (
            <li key={t.id} className="flex items-center justify-between p-3 rounded-md bg-card card-glow animate-slide-up">
              <span>{t.title}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={()=>removeTask(currentDay, category, t.id)}
                className="hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
          {tasks.length===0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No {category} tasks yet. Add your first one above!
            </p>
          )}
        </ul>
      </div>
    );
  };

  return (
    <section aria-labelledby="routines-title" className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 id="routines-title" className="text-3xl font-semibold">Routine Templates</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "box" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("box")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "box" ? (
        <RoutineBoxView />
      ) : (
        <Card className="card-glow">
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
            <p className="mt-4 text-sm text-muted-foreground">Total tasks for {currentDay}: {totalCount}</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
