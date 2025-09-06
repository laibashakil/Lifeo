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

export interface AppSettings {
  showHabitsPage: boolean;
  showGoalsPage: boolean;
  fontFamily: string;
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

const defaultAppSettings: AppSettings = {
  showHabitsPage: true,
  showGoalsPage: true,
  fontFamily: 'inter',
};

export function useAnalyticsSettings() {
  const [settings, setSettings] = useLocalStorage<AnalyticsSettings>(
    "analytics-settings", 
    defaultSettings
  );

  const updateSetting = (key: keyof Omit<AnalyticsSettings, 'visibleCards'>, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

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

  return {
    settings,
    toggleCard,
    removeCard,
    isVisible,
    updateSetting
  };
}

export function useAppSettings() {
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>(
    "app-settings",
    defaultAppSettings
  );

  const updateAppSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void => {
    setAppSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    appSettings,
    updateAppSetting
  };
}