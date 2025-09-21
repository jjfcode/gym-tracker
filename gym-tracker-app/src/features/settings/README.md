# Settings Feature

The Settings feature provides comprehensive user preference management, profile editing, security controls, and data export functionality for the Gym Tracker app.

## Features

### 1. Profile Settings
- **Personal Information**: Update display name and email address
- **Account Information**: View user ID, account creation date, and last update
- **Email Verification**: Change email with verification requirement
- **Real-time Updates**: Changes are saved immediately with optimistic UI updates

### 2. Preferences Settings
- **Theme Management**: Switch between light, dark, and system themes
- **Language Support**: Toggle between English and Spanish (i18n ready)
- **Unit System**: Choose between metric (kg, cm) and imperial (lbs, in) units
- **Live Preview**: See changes applied immediately
- **Cross-device Sync**: Preferences are synchronized across all devices

### 3. Security Settings
- **Password Management**: Change password with validation
- **Account Security**: View email verification status and last sign-in
- **Session Management**: Sign out from all devices
- **Security Tips**: Built-in security recommendations

### 4. Data & Privacy
- **Data Export**: Export all user data in JSON or CSV format
- **Selective Export**: Choose which data types to include
- **Date Range Filtering**: Export data for specific time periods
- **Privacy Information**: Clear data usage and security policies
- **Account Deletion**: Secure account deletion process (placeholder)

## Architecture

### Components
```
src/features/settings/
├── components/
│   ├── Settings.tsx              # Main settings container
│   ├── SettingsNavigation.tsx    # Navigation sidebar
│   ├── ProfileSettings.tsx       # Profile management
│   ├── PreferencesSettings.tsx   # Theme, language, units
│   ├── SecuritySettings.tsx      # Password and security
│   └── DataSettings.tsx          # Export and privacy
├── hooks/
│   ├── useSettings.ts            # Main settings hook
│   └── usePreferencesSync.ts     # Preference synchronization
├── services/
│   └── settingsService.ts        # API service layer
├── utils/
│   └── unitConversion.ts         # Unit conversion utilities
└── types.ts                      # TypeScript definitions
```

### State Management
- **Local State**: Zustand store for immediate UI updates
- **Server State**: React Query for data synchronization
- **Form State**: React Hook Form with Zod validation
- **Preference Sync**: Automatic sync between local and server state

### Data Flow
1. User interacts with settings UI
2. Form validation with Zod schemas
3. Optimistic UI updates via Zustand
4. API calls through settings service
5. Server state updates via React Query
6. Cross-device synchronization

## Usage

### Basic Setup
```tsx
import { Settings } from './features/settings';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Settings />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Using Settings Hook
```tsx
import { useSettings } from './features/settings';

function MyComponent() {
  const {
    updatePreferences,
    currentPreferences,
    isUpdatingPreferences,
  } = useSettings();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({
      ...currentPreferences,
      theme,
    });
  };

  return (
    <button 
      onClick={() => handleThemeChange('dark')}
      disabled={isUpdatingPreferences}
    >
      Switch to Dark Theme
    </button>
  );
}
```

### Unit Conversion
```tsx
import { convertWeight, formatWeight } from './features/settings/utils/unitConversion';

// Convert between units
const weightInKg = convertWeight(150, 'imperial', 'metric'); // 68.04 kg

// Format with units
const formattedWeight = formatWeight(70, 'metric'); // "70.0 kg"
```

## API Integration

### Profile Updates
```typescript
// Update user profile
await SettingsService.updateProfile(userId, {
  display_name: 'New Name',
  email: 'new@email.com',
});

// Update preferences
await SettingsService.updatePreferences(userId, {
  theme: 'dark',
  locale: 'es',
  units: 'metric',
});
```

### Data Export
```typescript
// Export user data
const exportData = await SettingsService.exportUserData(userId, {
  includeWorkouts: true,
  includeWeightLogs: true,
  includePlans: true,
  format: 'json',
  dateRange: {
    start: '2023-01-01',
    end: '2023-12-31',
  },
});

// Download formatted data
const formattedData = SettingsService.formatExportData(exportData, 'json');
SettingsService.downloadExportData(formattedData, 'my-data', 'json');
```

## Validation

All forms use Zod schemas for validation:

```typescript
// Profile validation
const profileSchema = z.object({
  display_name: z.string().min(1).max(50),
  email: z.string().email(),
});

// Password validation
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword);
```

## Testing

The feature includes comprehensive tests:

- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: Component rendering and user interactions
- **Type Safety**: Full TypeScript coverage

Run tests:
```bash
npm test src/features/settings
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order
- **Error Handling**: Clear error messages and validation feedback

## Performance

- **Code Splitting**: Lazy-loaded components
- **Optimistic Updates**: Immediate UI feedback
- **Debounced Sync**: Efficient preference synchronization
- **Caching**: React Query for server state management

## Security

- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Supabase secure headers
- **Data Encryption**: HTTPS for all communications

## Future Enhancements

- **Two-Factor Authentication**: Additional security layer
- **Data Backup**: Automated backup scheduling
- **Advanced Themes**: Custom theme creation
- **Notification Preferences**: Email and push notification settings
- **Account Linking**: Social media account connections