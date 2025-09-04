import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DownloadIcon, UploadIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Analytics from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines, useHabits, useMoods } from "@/hooks/useSupabaseData";

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { routines, completions } = useRoutines();
  const { habits, completions: habitCompletions } = useHabits();
  const { moods } = useMoods();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const calendarDays = [];
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    calendarDays.push(new Date(date));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getDayData = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof routines;
    const dayRoutines = routines[dayOfWeek];
    const totalTasks = dayRoutines.morning.length + dayRoutines.daily.length + dayRoutines.evening.length;
    const completedTasks = completions[dateKey]?.length || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    
    const completedHabits = habitCompletions[dateKey]?.length || 0;
    const habitRate = habits.length > 0 ? (completedHabits / habits.length) : 0;
    
    const mood = moods[dateKey]?.level;
    const moodEmoji = mood !== undefined ? ['😞','🙁','😐','🙂','😄'][mood] : null;

    return { completionRate, habitRate, moodEmoji, totalTasks, completedTasks, completedHabits };
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((date, index) => {
            const dayData = getDayData(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const todayClass = isToday(date) ? 'ring-2 ring-primary' : '';
            
            return (
              <div
                key={index}
                className={`
                  relative p-1 sm:p-2 rounded-md border min-h-[60px] sm:min-h-[80px] smooth-transition
                  ${isCurrentMonthDay ? 'bg-card hover:bg-accent/30' : 'bg-muted/30 text-muted-foreground'}
                  ${todayClass}
                `}
              >
                <div className="text-xs sm:text-sm font-medium mb-1">{date.getDate()}</div>
                
                {isCurrentMonthDay && (
                  <div className="space-y-1">
                    {/* Completion Rate Bar */}
                    {dayData.totalTasks > 0 && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${dayData.completionRate * 100}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Habit Rate Bar */}
                    {habits.length > 0 && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success transition-all duration-300"
                          style={{ width: `${dayData.habitRate * 100}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Mood Emoji */}
                    {dayData.moodEmoji && (
                      <div className="absolute top-1 right-1 text-xs">
                        {dayData.moodEmoji}
                      </div>
                    )}
                    
                    {/* Completion Summary */}
                    {(dayData.completedTasks > 0 || dayData.completedHabits > 0) && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {dayData.completedTasks > 0 && <div className="truncate">{dayData.completedTasks}/{dayData.totalTasks}</div>}
                        {dayData.completedHabits > 0 && <div className="truncate">{dayData.completedHabits}h</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-6 mt-4 pt-4 border-t text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-primary rounded-full" />
            <span className="text-muted-foreground">Routine Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-success rounded-full" />
            <span className="text-muted-foreground">Habits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">😄</span>
            <span className="text-muted-foreground">Mood</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analytics");

  const exportData = async () => {
    toast({ title: "Export feature coming soon", description: "Data export will be available in a future update." });
  };

  const importData = async () => {
    toast({ title: "Import feature coming soon", description: "Data import will be available in a future update." });
  };

  return (
    <section aria-labelledby="calendar-title" className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 id="calendar-title" className="text-2xl sm:text-3xl font-semibold">Calendar & Analytics</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Analytics />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </section>
  );
}
