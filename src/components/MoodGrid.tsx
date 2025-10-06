import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useMoods } from "@/hooks/useSupabaseData";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { ChevronLeft, ChevronRight, Frown, Meh, Smile, Laugh, Angry } from "lucide-react";

type TimeRange = "month" | "quarter" | "year";

export default function MoodGrid() {
  const { moods } = useMoods();
  const { currentTheme } = useMoodTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const gridData = useMemo(() => {
    const data = [];
    const today = new Date();
    let startDate: Date;
    let days: number;

    switch (timeRange) {
      case "month":
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        days = Math.ceil((nextMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        break;
      case "quarter":
        const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStart, 1);
        days = 92; // Approximate quarter length
        break;
      case "year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        days = 365;
        break;
    }

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (date > today) break;
      
      const dateKey = date.toISOString().split('T')[0];
      const mood = moods[dateKey];
      
      data.push({
        date: dateKey,
        mood: mood?.level,
        notes: mood?.notes,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        isToday: dateKey === today.toISOString().split('T')[0]
      });
    }

    return data;
  }, [moods, timeRange, currentDate]);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (timeRange) {
        case "month":
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case "quarter":
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 3 : -3));
          break;
        case "year":
          newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  };

  const getTitle = () => {
    switch (timeRange) {
      case "month":
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case "quarter":
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        return `Q${quarter} ${currentDate.getFullYear()}`;
      case "year":
        return currentDate.getFullYear().toString();
    }
  };

  const getGridLayout = () => {
    switch (timeRange) {
      case "month": {
        return {
          cols: 7,
          cellSize: "w-16 h-16",
          iconSize: "h-6 w-6",
          showDayLabels: true,
          showDayNumbers: true,
          useCircles: true
        };
      }
      case "quarter": {
        return {
          cols: 14,
          cellSize: "w-10 h-10",
          iconSize: "h-4 w-4",
          showDayLabels: false,
          showDayNumbers: false,
          useCircles: true
        };
      }
      case "year": {
        return {
          cols: 26,
          cellSize: "w-6 h-6",
          iconSize: "h-3 w-3",
          showDayLabels: false,
          showDayNumbers: false,
          useCircles: false
        };
      }
    }
  };

  const layout = getGridLayout();
  
  const getMoodIcon = (moodLevel: number) => {
    const icons = [Angry, Frown, Meh, Smile, Laugh];
    return icons[moodLevel];
  };

  const moodStats = useMemo(() => {
    const total = gridData.filter(d => d.mood !== undefined).length;
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    
    gridData.forEach(d => {
      if (d.mood !== undefined) {
        counts[d.mood as keyof typeof counts]++;
      }
    });

    const average = total > 0 
      ? Object.entries(counts).reduce((sum, [mood, count]) => sum + (parseInt(mood) * count), 0) / total
      : 0;

    return { total, counts, average: average.toFixed(1) };
  }, [gridData]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Mood Calendar</CardTitle>
            <InfoTooltip content="You can change the color theme of the grid in the settings!" />
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{getTitle()}</span>
          <span>Avg: {moodStats.average}/5 ({moodStats.total} entries)</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Week labels for month view */}
        {timeRange === "month" && layout.showDayLabels && (
          <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground text-center font-semibold px-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>
        )}

        {/* Mood Grid - Compact with no excess spacing */}
        <div className="flex items-center justify-center">
          <div 
            className={`grid ${timeRange === 'month' ? 'gap-2' : timeRange === 'quarter' ? 'gap-1.5' : 'gap-1'} w-full justify-items-center`}
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
              maxWidth: timeRange === 'month' ? '100%' : timeRange === 'quarter' ? '600px' : '700px'
            }}
          >
            {gridData.map(({ date, mood, isToday, dayOfMonth }, index) => {
              const MoodIcon = mood !== undefined ? getMoodIcon(mood) : null;
              
              return (
                <div
                  key={date}
                  className="flex flex-col items-center justify-center gap-1"
                >
                  <div
                    className={`
                      ${layout.cellSize}
                      ${layout.useCircles ? 'rounded-full' : 'rounded'}
                      transition-all duration-200 cursor-pointer
                      flex items-center justify-center
                      ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      ${mood !== undefined 
                        ? 'hover:scale-110 hover:shadow-lg hover:z-10 relative' 
                        : 'hover:opacity-70 border-2 border-dashed border-muted'
                      }
                    `}
                    style={{
                      backgroundColor: mood !== undefined ? currentTheme.colors[mood] : 'transparent'
                    }}
                    title={`${date}${mood !== undefined ? ` - Mood: ${['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][mood]}` : ' - No mood recorded'}`}
                  >
                    {MoodIcon ? (
                      <MoodIcon className={`${layout.iconSize} text-white drop-shadow`} strokeWidth={2.5} />
                    ) : (
                      <span className="text-muted-foreground text-lg font-light">+</span>
                    )}
                  </div>
                  
                  {layout.showDayNumbers && (
                    <div className="text-xs font-medium text-muted-foreground">
                      {dayOfMonth}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Moods:</span>
            <div className="flex gap-1">
              {currentTheme.colors.map((color, index) => {
                const Icon = getMoodIcon(index);
                return (
                  <div
                    key={index}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    title={['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][index]}
                  >
                    <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
              <span className="text-lg font-light">+</span>
            </div>
            <span>No data</span>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {[
            { icon: Angry, label: 'Very Bad' },
            { icon: Frown, label: 'Bad' },
            { icon: Meh, label: 'Neutral' },
            { icon: Smile, label: 'Good' },
            { icon: Laugh, label: 'Very Good' }
          ].map(({ icon: Icon, label }, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className="h-5 w-5" style={{ color: currentTheme.colors[index] }} />
              </div>
              <div className="text-sm font-medium">{moodStats.counts[index as keyof typeof moodStats.counts]}</div>
              <div className="text-xs text-muted-foreground">
                {moodStats.total > 0 
                  ? Math.round((moodStats.counts[index as keyof typeof moodStats.counts] / moodStats.total) * 100)
                  : 0}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}