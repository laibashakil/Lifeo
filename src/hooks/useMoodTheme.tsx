import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type MoodTheme = {
  name: string;
  colors: string[];
};

const moodThemes: MoodTheme[] = [
  {
    name: "Pastel",
    colors: [
      'hsl(0 65% 75%)',     // Very bad - soft red
      'hsl(25 65% 75%)',    // Bad - soft orange  
      'hsl(45 45% 75%)',    // Neutral - soft yellow
      'hsl(85 50% 75%)',    // Good - soft green
      'hsl(142 45% 70%)',   // Very good - bright green
    ]
  },
  {
    name: "Vibrant",
    colors: [
      'hsl(0 70% 60%)',     // Very bad - red
      'hsl(30 85% 65%)',    // Bad - orange
      'hsl(50 80% 70%)',    // Neutral - yellow
      'hsl(120 60% 65%)',   // Good - green
      'hsl(140 65% 55%)',   // Very good - emerald
    ]
  },
  {
    name: "Ocean",
    colors: [
      'hsl(340 55% 70%)',   // Very bad - pink
      'hsl(20 65% 75%)',    // Bad - coral
      'hsl(200 40% 75%)',   // Neutral - light blue
      'hsl(180 55% 65%)',   // Good - teal
      'hsl(160 60% 60%)',   // Very good - mint
    ]
  },
  {
    name: "Monochrome",
    colors: [
      'hsl(0 0% 30%)',      // Very bad - dark gray
      'hsl(0 0% 45%)',      // Bad - medium gray
      'hsl(0 0% 60%)',      // Neutral - gray
      'hsl(0 0% 75%)',      // Good - light gray
      'hsl(0 0% 85%)',      // Very good - very light gray
    ]
  }
];

interface MoodThemeContextType {
  currentTheme: MoodTheme;
  setTheme: (themeName: string) => void;
  themes: MoodTheme[];
}

const MoodThemeContext = createContext<MoodThemeContextType | undefined>(undefined);

export function MoodThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(moodThemes[0]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mood-theme');
    if (savedTheme) {
      const theme = moodThemes.find(t => t.name === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, []);

  const setTheme = (themeName: string) => {
    const theme = moodThemes.find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('mood-theme', themeName);
    }
  };

  return (
    <MoodThemeContext.Provider value={{ currentTheme, setTheme, themes: moodThemes }}>
      {children}
    </MoodThemeContext.Provider>
  );
}

export function useMoodTheme() {
  const context = useContext(MoodThemeContext);
  if (context === undefined) {
    throw new Error("useMoodTheme must be used within a MoodThemeProvider");
  }
  return context;
}