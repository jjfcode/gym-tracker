# Internationalization (i18n) Implementation

This document describes the internationalization setup for the Gym Tracker application.

## Overview

The application supports English and Spanish languages using `react-i18next` for translation management and locale-specific formatting.

## Features

- ✅ English and Spanish language support
- ✅ Automatic language detection from browser/localStorage
- ✅ Real-time language switching
- ✅ Pluralization support
- ✅ String interpolation
- ✅ Locale-specific date and number formatting
- ✅ Fallback handling for missing translations
- ✅ Integration with app state management

## File Structure

```
src/
├── lib/
│   └── i18n.ts                 # Main i18n configuration
├── locales/
│   ├── en.json                 # English translations
│   └── es.json                 # Spanish translations
├── hooks/
│   └── useTranslation.ts       # Translation hooks
└── components/ui/
    └── LanguageSwitcher/       # Language switcher component
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Pluralization

```tsx
// Translation keys in JSON:
// "daysPerWeek_one": "{{count}} day per week"
// "daysPerWeek_other": "{{count}} days per week"

const { t } = useTranslation();
const message = t('onboarding.daysPerWeek', { count: 3 }); // "3 days per week"
```

### String Interpolation

```tsx
// Translation key: "step": "Step {{current}} of {{total}}"
const { t } = useTranslation();
const step = t('onboarding.step', { current: 2, total: 4 }); // "Step 2 of 4"
```

### Language Switching

```tsx
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

function Settings() {
  return (
    <div>
      {/* Dropdown variant */}
      <LanguageSwitcher variant="dropdown" />
      
      {/* Toggle variant */}
      <LanguageSwitcher variant="toggle" />
    </div>
  );
}
```

### Date and Number Formatting

```tsx
import { useDateFormatter, useNumberFormatter } from '../hooks/useTranslation';

function MyComponent() {
  const { formatDate, formatDateTime } = useDateFormatter();
  const { formatNumber, formatWeight } = useNumberFormatter();
  
  const date = new Date();
  const weight = 75.5;
  
  return (
    <div>
      <p>Date: {formatDate(date)}</p>
      <p>Weight: {formatWeight(weight, 'metric')}</p>
      <p>Number: {formatNumber(1234.56)}</p>
    </div>
  );
}
```

## Translation Keys Structure

The translation files are organized into logical sections:

- `common` - Common UI elements (buttons, labels, etc.)
- `navigation` - Navigation menu items
- `auth` - Authentication related text
- `onboarding` - Onboarding flow text
- `dashboard` - Dashboard specific text
- `workouts` - Workout tracking text
- `exercises` - Exercise library text
- `progress` - Progress tracking text
- `planning` - Workout planning text
- `settings` - Settings page text
- `errors` - Error messages
- `units` - Unit labels (kg, lbs, etc.)
- `dates` - Date-related text (days, months, etc.)

## Adding New Translations

1. Add the key to both `en.json` and `es.json`:

```json
// en.json
{
  "mySection": {
    "myKey": "My English text"
  }
}

// es.json
{
  "mySection": {
    "myKey": "Mi texto en español"
  }
}
```

2. Use in components:

```tsx
const { t } = useTranslation();
const text = t('mySection.myKey');
```

## Pluralization Rules

For pluralization, use the `_one` and `_other` suffixes:

```json
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

## Language Detection

The language is detected in this order:
1. Stored preference in localStorage (`gym-tracker-language`)
2. Browser language setting
3. Fallback to English

## State Management Integration

The language preference is synchronized with the app's global state using Zustand:

```tsx
import { useAppStore } from '../store';

const { language, setLanguage } = useAppStore();
```

## Testing

Run the i18n tests:

```bash
npm run test -- src/lib/__tests__/i18n.test.ts
```

## Configuration

The i18n configuration is in `src/lib/i18n.ts`:

- **Fallback language**: English (`en`)
- **Debug mode**: Enabled in development
- **Detection order**: localStorage → navigator → htmlTag
- **Cache**: localStorage with key `gym-tracker-language`

## Best Practices

1. **Use semantic keys**: `auth.signIn` instead of `signInButton`
2. **Group related keys**: Keep related translations in the same section
3. **Provide context**: Use descriptive key names that indicate usage
4. **Test both languages**: Always verify translations in both English and Spanish
5. **Handle missing keys**: The system falls back to the key name if translation is missing
6. **Use interpolation**: For dynamic content, use `{{variable}}` syntax
7. **Pluralization**: Always provide both singular and plural forms

## Troubleshooting

### Translation not showing
- Check if the key exists in both language files
- Verify the key path is correct
- Ensure i18n is initialized before component renders

### Language not switching
- Check if the language is properly set in the store
- Verify localStorage is accessible
- Check browser console for i18n errors

### Formatting issues
- Ensure the locale is correctly detected
- Check if the date/number is valid
- Verify the formatting options are supported

## Future Enhancements

- Add more languages (French, German, etc.)
- Implement RTL language support
- Add translation management tools
- Implement lazy loading for translation files
- Add translation validation in CI/CD