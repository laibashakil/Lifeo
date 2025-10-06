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
    const dataLength = gridData.length;
    
    switch (timeRange) {
      case "month": {
        // 7 columns (week layout), calculate rows needed
        const rows = Math.ceil(dataLength / 7);
        return {
          cols: 7,
          cellSize: "w-12 h-12",
          gap: "gap-2",
          rounded: "rounded-lg"
        };
      }
      case "quarter": {
        // Aim for ~13 columns for aesthetic rectangular shape
        const cols = 13;
        return {
          cols,
          cellSize: "w-5 h-5",
          gap: "gap-1.5",
          rounded: "rounded-md"
        };
      }
      case "year": {
        // Aim for ~26 columns for balanced rectangular year view
        const cols = 26;
        return {
          cols,
          cellSize: "w-3 h-3",
          gap: "gap-1",
          rounded: "rounded"
        };
      }
    }
  };

  const layout = getGridLayout();

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
      <CardContent className="space-y-4">
        {/* Week labels for month view */}
        {timeRange === "month" && (
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>
        )}

        {/* Mood Grid - Consistent height container */}
        <div className="min-h-[380px] flex items-center justify-center">
          <div 
            className={`grid ${layout.gap}`}
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
              maxWidth: '100%'
            }}
          >
            {gridData.map(({ date, mood, isToday, dayOfMonth }, index) => (
              <div
                key={date}
                className={`
                  ${layout.cellSize} ${layout.rounded}
                  transition-all duration-300 cursor-pointer
                  ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                  ${mood !== undefined 
                    ? 'hover:scale-125 hover:shadow-lg hover:z-10 relative shadow-sm' 
                    : 'hover:opacity-70'
                  }
                `}
                style={{
                  backgroundColor: mood !== undefined ? currentTheme.colors[mood] : 'hsl(var(--muted)/0.5)'
                }}
                title={`${date}${mood !== undefined ? ` - Mood: ${['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][mood]}` : ' - No mood recorded'}`}
              >
                {timeRange === "month" && (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold">
                    {dayOfMonth}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-0">
              {currentTheme.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 border-0"
                  style={{ backgroundColor: color }}
                  title={['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][index]}
                />
              ))}
            </div>
            <span className="text-muted-foreground">More</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted border-0" />
              <span>No data</span>
            </div>
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