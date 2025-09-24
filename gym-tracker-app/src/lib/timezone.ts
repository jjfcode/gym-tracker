// Timezone utilities and common timezone options

export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Mumbai', label: 'Mumbai (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
];

/**
 * Get the user's current timezone using the browser's Intl API
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    console.warn('Could not detect user timezone, defaulting to UTC');
    return 'UTC';
  }
}

/**
 * Format a timezone for display
 */
export function formatTimezone(timezone: string): string {
  const timezoneOption = COMMON_TIMEZONES.find(tz => tz.value === timezone);
  
  if (timezoneOption) {
    return timezoneOption.label;
  }
  
  // If not in our common list, try to format it nicely
  return timezone.replace(/_/g, ' ').replace('/', ' / ');
}

/**
 * Get the current date in a specific timezone
 */
export function getCurrentDateInTimezone(timezone: string): Date {
  const now = new Date();
  
  try {
    // Create a date string in the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const dateString = formatter.format(now);
    return new Date(dateString + 'T00:00:00.000Z');
  } catch {
    console.warn(`Invalid timezone: ${timezone}, using UTC`);
    return now;
  }
}

/**
 * Convert a date to a specific timezone for display
 */
export function formatDateInTimezone(date: Date, timezone: string, locale: string = 'en-US'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn(`Error formatting date in timezone ${timezone}:`, error);
    return date.toLocaleDateString();
  }
}