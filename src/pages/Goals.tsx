import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidationRules, globalRateLimiter } from "@/utils/validation";
import { Calendar, Plus, Target, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubTask {
  id: string;
  title: string;
  daysOfWeek: string[];
}

interface Goal {
  id: string;
  title: string;
  type: 'monthly' | 'yearly';
  targetDate: string;
  subTasks: SubTask[];
  completed: boolean;
}

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function Goals() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Get Driver\'s License',
      type: 'monthly',
      targetDate: '2025-03-01',
      completed: false,
      subTasks: [
        {
          id: 'st1',
          title: 'Practice driving',
          daysOfWeek: ['tuesday', 'thursday', 'saturday']
        },
        {
          id: 'st2', 
          title: 'Learn driving rules',
          daysOfWeek: ['monday', 'wednesday', 'friday']
        }
      ]
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'monthly' as 'monthly' | 'yearly',
    targetDate: '',
  });

  const [newSubTask, setNewSubTask] = useState({
    title: '',
    daysOfWeek: [] as string[],
    goalId: ''
  });

  const [goalTitleValid, setGoalTitleValid] = useState(false);
  const [subTaskTitleValid, setSubTaskTitleValid] = useState(false);

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddSubTaskOpen, setIsAddSubTaskOpen] = useState(false);

  const addGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetDate || !goalTitleValid) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields with valid data.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    if (!globalRateLimiter.isAllowed('add-goal', 5, 60000)) {
      toast({ 
        title: "Too many requests", 
        description: "Please wait before adding more goals.",
        variant: "destructive"
      });
      return;
    }

    // Validate target date is in the future
    const targetDate = new Date(newGoal.targetDate);
    const now = new Date();
    if (targetDate <= now) {
      toast({ 
        title: "Invalid date", 
        description: "Target date must be in the future.",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      type: newGoal.type,
      targetDate: newGoal.targetDate,
      completed: false,
      subTasks: []
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', type: 'monthly', targetDate: '' });
    setGoalTitleValid(false);
    setIsAddGoalOpen(false);
    
    toast({ 
      title: "Goal added", 
      description: `${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} goal "${goal.title}" has been created.` 
    });
  };

  const addSubTask = () => {
    if (!newSubTask.title.trim() || !newSubTask.goalId || newSubTask.daysOfWeek.length === 0 || !subTaskTitleValid) {
      toast({ 
        title: "Error", 
        description: "Please fill in all fields with valid data and select at least one day.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    if (!globalRateLimiter.isAllowed('add-subtask', 10, 60000)) {
      toast({ 
        title: "Too many requests", 
        description: "Please wait before adding more sub-tasks.",
        variant: "destructive"
      });
      return;
    }

    const subTask: SubTask = {
      id: Date.now().toString(),
      title: newSubTask.title.trim(),
      daysOfWeek: newSubTask.daysOfWeek
    };

    setGoals(prev => prev.map(goal => 
      goal.id === newSubTask.goalId 
        ? { ...goal, subTasks: [...goal.subTasks, subTask] }
        : goal
    ));

    setNewSubTask({ title: '', daysOfWeek: [], goalId: '' });
    setSubTaskTitleValid(false);
    setIsAddSubTaskOpen(false);

    toast({ 
      title: "Sub-task added", 
      description: `"${subTask.title}" will appear on selected days.` 
    });
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast({ title: "Goal removed", description: "Goal and all its sub-tasks have been removed." });
  };

  const removeSubTask = (goalId: string, subTaskId: string) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId
        ? { ...goal, subTasks: goal.subTasks.filter(st => st.id !== subTaskId) }
        : goal
    ));
    toast({ title: "Sub-task removed", description: "Sub-task has been removed." });
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setNewSubTask(prev => ({
      ...prev,
      daysOfWeek: checked 
        ? [...prev.daysOfWeek, day]
        : prev.daysOfWeek.filter(d => d !== day)
    }));
  };

  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const yearlyGoals = goals.filter(g => g.type === 'yearly');

  const getTypeIcon = (type: 'monthly' | 'yearly') => {
    return type === 'monthly' ? <Calendar className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <Card className={`card-glow ${goal.completed ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={goal.completed}
              onCheckedChange={() => toggleGoalCompletion(goal.id)}
            />
            <div>
              <CardTitle className={`text-lg ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1">
                  {getTypeIcon(goal.type)}
                  {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Due: {formatDate(goal.targetDate)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeGoal(goal.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Sub-tasks</Label>
            <Dialog open={isAddSubTaskOpen} onOpenChange={setIsAddSubTaskOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewSubTask(prev => ({ ...prev, goalId: goal.id }))}
                  className="gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Sub-task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Sub-task to "{goal.title}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subtask-title">Sub-task Title</Label>
                    <ValidatedInput
                      id="subtask-title"
                      value={newSubTask.title}
                      validationRules={ValidationRules.taskTitle}
                      onValueChange={(value, valid) => {
                        setNewSubTask(prev => ({ ...prev, title: value }));
                        setSubTaskTitleValid(valid);
                      }}
                      placeholder="e.g., Practice driving"
                    />
                  </div>
                  <div>
                    <Label>Days of the Week</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {daysOfWeek.map(day => (
                        <div key={day.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={day.id}
                            checked={newSubTask.daysOfWeek.includes(day.id)}
                            onCheckedChange={(checked) => handleDayToggle(day.id, !!checked)}
                          />
                          <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addSubTask} 
                      className="flex-1"
                      disabled={!subTaskTitleValid || newSubTask.daysOfWeek.length === 0}
                    >
                      Add Sub-task
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddSubTaskOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {goal.subTasks.length > 0 ? (
            <div className="space-y-2">
              {goal.subTasks.map(subTask => (
                <div key={subTask.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{subTask.title}</p>
                    <div className="flex gap-1 mt-1">
                      {subTask.daysOfWeek.map(day => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubTask(goal.id, subTask.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sub-tasks yet. Add some to break down this goal!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Goals
        </h1>
        
        <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-title">Goal Title</Label>
                <ValidatedInput
                  id="goal-title"
                  value={newGoal.title}
                  validationRules={ValidationRules.goalTitle}
                  onValueChange={(value, valid) => {
                    setNewGoal(prev => ({ ...prev, title: value }));
                    setGoalTitleValid(valid);
                  }}
                  placeholder="e.g., Get driver's license"
                />
              </div>
              <div>
                <Label htmlFor="goal-type">Goal Type</Label>
                <Select value={newGoal.type} onValueChange={(value: 'monthly' | 'yearly') => 
                  setNewGoal(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Goal</SelectItem>
                    <SelectItem value="yearly">Yearly Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target-date">Target Date</Label>
                <input
                  id="target-date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addGoal} 
                  className="flex-1"
                  disabled={!goalTitleValid || !newGoal.targetDate.trim()}
                >
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monthly" className="gap-2">
            <Calendar className="h-4 w-4" />
            Monthly Goals ({monthlyGoals.length})
          </TabsTrigger>
          <TabsTrigger value="yearly" className="gap-2">
            <Clock className="h-4 w-4" />
            Yearly Goals ({yearlyGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          {monthlyGoals.length > 0 ? (
            monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
          ) : (
            <Card className="card-glow">
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No monthly goals yet.</p>
                <p className="text-sm text-muted-foreground">Add your first monthly goal to get started!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          {yearlyGoals.length > 0 ? (
            yearlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
          ) : (
            <Card className="card-glow">
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No yearly goals yet.</p>
                <p className="text-sm text-muted-foreground">Set some long-term yearly goals!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}