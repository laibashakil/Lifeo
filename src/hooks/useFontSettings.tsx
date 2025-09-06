import { useEffect } from 'react';
import { useAppSettings } from './useAnalyticsSettings';

const fontOptions = [
  { id: 'inter', name: 'Inter', description: 'Clean & Modern' },
  { id: 'poppins', name: 'Poppins', description: 'Friendly & Rounded' },
  { id: 'source', name: 'Source Sans Pro', description: 'Professional & Clear' },
  { id: 'lato', name: 'Lato', description: 'Humanist & Elegant' },
  { id: 'opensans', name: 'Open Sans', description: 'Neutral & Readable' },
];

export function useFontSettings() {
  const { appSettings, updateAppSetting } = useAppSettings();
  
  useEffect(() => {
    // Apply font to document body
    const fontClass = `font-${appSettings.fontFamily}`;
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('font-'))
      .concat(fontClass)
      .join(' ');
  }, [appSettings.fontFamily]);
  
  const setFont = (fontId: string) => {
    updateAppSetting('fontFamily', fontId);
  };
  
  return {
    fontOptions,
    currentFont: appSettings.fontFamily,
    setFont
  };
}