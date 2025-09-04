import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useMoods } from "@/hooks/useSupabaseData";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const getGridCols = () => {
    switch (timeRange) {
      case "month":
        return "grid-cols-7"; // Week layout
      case "quarter": {
        // Calculate optimal columns for quarter (aim for roughly square grid)
        const dataLength = gridData.length;
        const cols = Math.ceil(Math.sqrt(dataLength * 1.2)); // Slightly wider rectangle
        return `grid-cols-[repeat(${Math.min(cols, 15)},minmax(0,1fr))]`;
      }
      case "year": {
        // Calculate optimal columns for year (aim for wide rectangle)
        const dataLength = gridData.length;
        const cols = Math.ceil(dataLength / 12); // Roughly 12 rows
        return `grid-cols-[repeat(${Math.min(cols, 31)},minmax(0,1fr))]`;
      }
    }
  };

  const getSquareSize = () => {
    switch (timeRange) {
      case "month":
        return "w-8 h-8"; // Larger for month view
      case "quarter":
        return "w-4 h-4"; // Medium for quarter
      case "year":
        return "w-2 h-2"; // Small for year
    }
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
      <CardContent className="space-y-4">
        {/* Week labels for month view */}
        {timeRange === "month" && (
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>
        )}

        {/* Mood Grid */}
        <div className={`inline-grid ${getGridCols()}`}>
          {gridData.map(({ date, mood, isToday, dayOfMonth }, index) => (
            <div
              key={date}
              className={`
                ${getSquareSize()} transition-all duration-200 cursor-pointer border-0
                ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${mood !== undefined 
                  ? 'hover:scale-110 hover:z-10 relative' 
                  : 'hover:opacity-70'
                }
              `}
              style={{
                backgroundColor: mood !== undefined ? currentTheme.colors[mood] : 'hsl(var(--muted))'
              }}
              title={`${date}${mood !== undefined ? ` - Mood: ${['😞','🙁','😐','🙂','😄'][mood]}` : ' - No mood recorded'}`}
            >
              {timeRange === "month" && (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                  {dayOfMonth}
                </div>
              )}
            </div>
          ))}
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
          {['😞', '🙁', '😐', '🙂', '😄'].map((emoji, index) => (
            <div key={index} className="text-center">
              <div className="text-lg mb-1">{emoji}</div>
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