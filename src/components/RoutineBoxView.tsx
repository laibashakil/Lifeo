import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutines } from "@/hooks/useSupabaseData";
import type { Category, DayKey, TaskTemplate } from "@/types/lifeo";

const days: DayKey[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
];

const weekdayLayout = ["monday", "tuesday", "wednesday", "thursday"];
const weekendLayout = ["friday", "saturday", "sunday"];

export default function RoutineBoxView() {
  const { toast } = useToast();
  const { routines, addTask, removeTask } = useRoutines();
  const [newTitle, setNewTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("daily");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayKey[]>([]);

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case "morning": return "bg-routine-morning/10 border-routine-morning/20";
      case "daily": return "bg-routine-daily/10 border-routine-daily/20";
      case "evening": return "bg-routine-evening/10 border-routine-evening/20";
    }
  };

  const getCategoryTextColor = (category: Category) => {
    switch (category) {
      case "morning": return "text-routine-morning";
      case "daily": return "text-routine-daily";
      case "evening": return "text-routine-evening";
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    
    if (copyDialogOpen && selectedDays.length > 0) {
      // Add to selected days
      for (const day of selectedDays) {
        await addTask(day, selectedCategory, newTitle.trim());
      }
      toast({ 
        title: "Task added", 
        description: `Added "${newTitle}" to ${selectedDays.length} days` 
      });
    } else {
      // Add to current day only
      await addTask("monday", selectedCategory, newTitle.trim());
      toast({ title: "Task added", description: `Added "${newTitle}"` });
    }
    
    setNewTitle("");
    setSelectedDays([]);
    setCopyDialogOpen(false);
  };

  const DayBox = ({ day, isWeekend = false }: { day: DayKey; isWeekend?: boolean }) => {
    const dayTasks = routines[day];
    const categories: Category[] = ["morning", "daily", "evening"];

    return (
      <Card className={`card-glow ${isWeekend ? 'w-48' : 'flex-1'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-sm font-medium">
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <div key={category} className={`p-2 rounded-md border ${getCategoryColor(category)}`}>
              <h4 className={`text-xs font-medium mb-2 ${getCategoryTextColor(category)}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              <div className="space-y-1">
                {dayTasks[category].map((task: TaskTemplate) => (
                  <div key={task.id} className="flex items-center justify-between bg-background/50 p-1.5 rounded text-xs">
                    <span className="truncate">{task.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/20"
                      onClick={() => removeTask(day, category, task.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {dayTasks[category].length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add Task Section */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Enter task name" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleAddTask(); }} 
              className="flex-1"
            />
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value as Category)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="morning">Morning</option>
              <option value="daily">Daily</option>
              <option value="evening">Evening</option>
            </select>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Multiple Days
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Days to Copy Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {days.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDays([...selectedDays, day]);
                          } else {
                            setSelectedDays(selectedDays.filter(d => d !== day));
                          }
                        }}
                      />
                      <label htmlFor={day} className="text-sm font-medium">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddTask} className="w-full" disabled={!newTitle.trim() || selectedDays.length === 0}>
                  Add to {selectedDays.length} Selected Days
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Weekdays Row */}
      <div className="space-y-4">
        <div className="flex gap-4 justify-center">
          {weekdayLayout.map(day => (
            <DayBox key={day} day={day as DayKey} />
          ))}
        </div>

        {/* Weekend Row */}
        <div className="flex gap-4 justify-center">
          {weekendLayout.map(day => (
            <DayBox key={day} day={day as DayKey} isWeekend />
          ))}
        </div>
      </div>
    </div>
  );
}