import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type AnalyticsCard = 
  | "progress-over-time"
  | "category-performance" 
  | "habit-streaks"
  | "mood-grid"
  | "mood-trends"
  | "overview-stats";

export interface AnalyticsSettings {
  visibleCards: AnalyticsCard[];
  combineTaskCategories: boolean;
  combineWithHabits: boolean;
}

const defaultSettings: AnalyticsSettings = {
  visibleCards: [
    "overview-stats",
    "progress-over-time", 
    "category-performance",
    "habit-streaks",
    "mood-grid",
    "mood-trends"
  ],
  combineTaskCategories: false,
  combineWithHabits: false
};

export function useAnalyticsSettings() {
  const [settings, setSettings] = useLocalStorage<AnalyticsSettings>(
    "analytics-settings", 
    defaultSettings
  );

  const toggleCard = (cardId: AnalyticsCard) => {
    setSettings(prev => ({
      ...prev,
      visibleCards: prev.visibleCards.includes(cardId)
        ? prev.visibleCards.filter(id => id !== cardId)
        : [...prev.visibleCards, cardId]
    }));
  };

  const removeCard = (cardId: AnalyticsCard) => {
    setSettings(prev => ({
      ...prev,
      visibleCards: prev.visibleCards.filter(id => id !== cardId)
    }));
  };

  const isVisible = (cardId: AnalyticsCard) => {
    return settings.visibleCards.includes(cardId);
  };

  const updateSetting = (key: keyof Omit<AnalyticsSettings, 'visibleCards'>, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    settings,
    toggleCard,
    removeCard,
    isVisible,
    updateSetting
  };
}