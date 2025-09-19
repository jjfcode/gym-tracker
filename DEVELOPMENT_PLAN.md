# 🏋️ Gym Tracker - Step-by-Step Development Plan

**A comprehensive development roadmap for building a modern, full-stack gym tracking application without TailwindCSS.**

---

## 📋 Project Overview

Building a Progressive Web App (PWA) for workout tracking with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules (no TailwindCSS)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State**: React Query + Zustand
- **Charts**: Recharts
- **i18n**: English + Spanish support

---

## 🎯 Development Milestones

### ✅ Milestone 1: Project Setup & Foundation
**Goal**: Create basic project structure with modern tooling (no TailwindCSS)

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up project folder structure (frontend/backend separation)
- [ ] Configure CSS Modules for styling
- [ ] Install core dependencies (React Query, React Router, etc.)
- [ ] Set up development environment and scripts
- [ ] Create basic folder structure and conventions

**Dependencies to install:**
```bash
# Core React dependencies
npm install react@18 react-dom@18 react-router-dom
npm install @tanstack/react-query react-hook-form
npm install zustand clsx

# Supabase
npm install @supabase/supabase-js

# Development tools
npm install -D @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react
npm install -D typescript eslint prettier
```

**Folder Structure:**
```
gym-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base components (Button, Input, etc.)
│   │   ├── layout/         # Layout components
│   │   └── charts/         # Chart components
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Main dashboard
│   │   ├── workouts/       # Workout management
│   │   ├── exercises/      # Exercise library
│   │   ├── progress/       # Progress tracking
│   │   └── profile/        # User profile
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configuration
│   ├── store/              # Global state (Zustand)
│   ├── styles/             # Global CSS and CSS Modules
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── public/
└── package.json
```

**Acceptance Criteria:**
- ✅ Project builds and runs without errors
- ✅ CSS Modules configured and working
- ✅ TypeScript strict mode enabled
- ✅ Basic routing structure in place
- ✅ Development scripts working (dev, build, preview)

---

### ✅ Milestone 2: Supabase Database Setup
**Goal**: Configure complete database schema with security

**Tasks:**
- [ ] Create Supabase project
- [ ] Set up database tables with proper relationships
- [ ] Configure Row Level Security (RLS) policies
- [ ] Create database indexes for performance
- [ ] Set up environment variables
- [ ] Test database connection

**Database Schema:**
```sql
-- User profile table
create table public.profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text default 'en',
  units text default 'imperial', -- 'imperial' | 'metric'
  theme text default 'dark', -- 'dark' | 'light' | 'system'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weight tracking
create table public.weight_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  measured_at date not null,
  weight numeric(6,2) not null,
  note text,
  created_at timestamptz default now(),
  unique (user_id, measured_at)
);

-- Workout plans
create table public.plans (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  goal_days_per_week int not null check (goal_days_per_week between 1 and 7),
  plan_scope text not null default 'weekly',
  start_date date not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Individual workouts
create table public.workouts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  plan_id bigint references public.plans(id) on delete cascade,
  date date not null,
  title text not null,
  is_completed boolean default false,
  duration_minutes int,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Exercises in workouts
create table public.exercises (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  workout_id bigint references public.workouts(id) on delete cascade,
  slug text not null,
  name_en text not null,
  name_es text not null,
  machine_brand text,
  order_index int default 0,
  target_sets int default 3,
  target_reps int default 10,
  created_at timestamptz default now()
);

-- Exercise sets (actual performance)
create table public.exercise_sets (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id bigint references public.exercises(id) on delete cascade,
  set_index int not null,
  weight numeric(6,2),
  reps int,
  rpe numeric(3,1), -- Rate of Perceived Exertion
  notes text,
  created_at timestamptz default now()
);
```

**RLS Policies:**
```sql
-- Enable RLS on all tables
alter table public.profile enable row level security;
alter table public.weight_logs enable row level security;
alter table public.plans enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_sets enable row level security;

-- Create policies (users can only access their own data)
create policy "Users can view own profile" on public.profile
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.profile
  for update using (auth.uid() = user_id);

-- Similar policies for all other tables...
```

**Acceptance Criteria:**
- ✅ All tables created with proper relationships
- ✅ RLS enabled and policies working
- ✅ Supabase client configured in React app
- ✅ Environment variables set up
- ✅ Database connection tested

---

### ✅ Milestone 3: Authentication System
**Goal**: Complete user authentication flow with Supabase

**Tasks:**
- [ ] Create authentication components (SignIn, SignUp, ResetPassword)
- [ ] Implement form validation with React Hook Form
- [ ] Set up authentication context/store
- [ ] Create protected route wrapper
- [ ] Handle authentication states and errors
- [ ] Style authentication forms with CSS Modules

**Components to create:**
```
src/features/auth/
├── components/
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── AuthLayout.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuthForm.ts
├── store/
│   └── authStore.ts
└── styles/
    └── auth.module.css
```

**Key Features:**
- Email/password authentication
- Form validation with real-time feedback
- Loading states and error handling
- Responsive design (mobile-first)
- Password strength indicator
- Remember me functionality

**Acceptance Criteria:**
- ✅ Users can sign up, sign in, and reset password
- ✅ Authentication state persists across page reloads
- ✅ Protected routes redirect to login when not authenticated
- ✅ Forms have proper validation and error messages
- ✅ Responsive design works on mobile and desktop

---

### ✅ Milestone 4: Design System & UI Components
**Goal**: Create a comprehensive design system without TailwindCSS

**Tasks:**
- [ ] Define design tokens (colors, typography, spacing)
- [ ] Create base UI components with CSS Modules
- [ ] Implement dark/light theme system
- [ ] Create layout components
- [ ] Build form components with proper accessibility
- [ ] Set up component documentation/storybook (optional)

**Design Tokens (CSS Variables):**
```css
/* styles/tokens.css */
:root {
  /* Colors - Dark Theme (Primary) */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #2a2a2a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a3a3a3;
  --color-text-tertiary: #6b6b6b;
  --color-accent: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
}
```

**Core Components:**
```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.module.css
│   └── index.ts
├── Card/
├── Modal/
├── Select/
├── Checkbox/
├── RadioGroup/
└── Spinner/
```

**Acceptance Criteria:**
- ✅ Design system with consistent visual hierarchy
- ✅ All base components built with CSS Modules
- ✅ Dark/light theme switching works
- ✅ Components are accessible (ARIA labels, keyboard navigation)
- ✅ Responsive design across all screen sizes

---

### ✅ Milestone 5: User Onboarding Flow
**Goal**: Complete first-time user experience and plan generation

**Tasks:**
- [ ] Create onboarding screens (Welcome, Weight, DaysPerWeek, Review)
- [ ] Implement workout template system
- [ ] Build plan generation logic
- [ ] Add onboarding progress indicator
- [ ] Handle onboarding completion and routing

**Onboarding Screens:**
1. **Welcome Screen**: Introduction and start button
2. **Weight Input**: Current weight with unit selection (kg/lbs)
3. **Days Per Week**: Select training frequency (1-7 days)
4. **Plan Preview**: Show generated weekly template
5. **Completion**: Save plan and redirect to dashboard

**Template System:**
```typescript
// lib/templates.ts
export const WORKOUT_TEMPLATES = {
  3: { // 3 days per week
    A: ['chest-press', 'seated-row', 'leg-press', 'shoulder-press', 'biceps-curl', 'triceps-pushdown'],
    B: ['incline-chest-press', 'lat-pulldown', 'leg-extension', 'seated-leg-curl', 'lateral-raise', 'ab-crunch'],
    C: ['smith-squat', 'hammer-row', 'chest-press-variant', 'hip-abductor', 'cable-biceps', 'rope-triceps']
  },
  4: { // 4 days per week - Upper/Lower split
    'Upper A': ['bench-press', 'seated-row', 'shoulder-press', 'lat-pulldown', 'biceps-curl', 'triceps-extension'],
    'Lower A': ['squat', 'leg-curl', 'leg-press', 'calf-raise', 'hip-thrust', 'leg-extension'],
    'Upper B': ['incline-press', 'cable-row', 'lateral-raise', 'face-pull', 'hammer-curl', 'overhead-triceps'],
    'Lower B': ['deadlift', 'leg-extension', 'leg-curl', 'walking-lunge', 'calf-press', 'glute-bridge']
  }
  // ... more templates
};
```

**Acceptance Criteria:**
- ✅ Smooth onboarding flow with progress indication
- ✅ Weight and preferences saved to user profile
- ✅ Workout plan generated based on selected days
- ✅ First week of workouts created in database
- ✅ User redirected to dashboard after completion

---

### ✅ Milestone 6: Dashboard & Today View
**Goal**: Main app interface showing today's workout

**Tasks:**
- [ ] Create main dashboard layout
- [ ] Build "Today" workout view
- [ ] Implement exercise cards with set tracking
- [ ] Add workout completion functionality
- [ ] Create quick actions (add weight, mark complete)
- [ ] Add workout timer (optional)

**Dashboard Features:**
- Current workout display
- Quick stats (streak, weekly progress)
- Quick add weight button
- Navigation to other sections
- Today's date and progress indicators

**Exercise Card Features:**
```typescript
interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    targetSets: number;
    targetReps: number;
    previousWeight?: number;
  };
  sets: ExerciseSet[];
  onSetUpdate: (setIndex: number, data: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
}
```

**Acceptance Criteria:**
- ✅ Dashboard shows today's workout (or rest day)
- ✅ Exercise cards allow weight/reps input
- ✅ Sets can be marked as completed
- ✅ Workout can be marked as finished
- ✅ Previous workout data prefills suggestions
- ✅ Responsive design works on mobile

---

### ✅ Milestone 7: Workout Management System
**Goal**: Complete CRUD operations for workouts and exercises

**Tasks:**
- [ ] Build workout creation and editing interface
- [ ] Implement exercise library with search/filter
- [ ] Add custom exercise creation
- [ ] Create workout templates management
- [ ] Add workout duplication feature
- [ ] Implement workout history view

**Workout Management Features:**
- Create new workouts from templates
- Add/remove/reorder exercises
- Edit exercise details (sets, reps, weight targets)
- Save workout as template
- Duplicate previous workouts
- Workout history with filtering

**Exercise Library:**
- Pre-defined exercise database
- Search by name or muscle group
- Filter by equipment type
- Custom exercise creation
- Exercise instructions and tips
- Exercise media (images - optional for later)

**Acceptance Criteria:**
- ✅ Full CRUD operations for workouts
- ✅ Exercise library with search and filters
- ✅ Custom exercises can be created
- ✅ Workout templates can be saved and reused
- ✅ Workout history is accessible and filterable

---

### ✅ Milestone 8: Weight Tracking & Progress
**Goal**: Body weight tracking with visualizations

**Tasks:**
- [ ] Create weight logging interface
- [ ] Build weight history view with charts
- [ ] Implement unit conversion (kg/lbs)
- [ ] Add weight goals and targets (optional)
- [ ] Create progress statistics
- [ ] Add data export functionality

**Weight Tracking Features:**
- Daily weight logging (one entry per day)
- Weight history with date picker
- Visual charts (line chart for trends)
- Unit conversion support
- Weight change calculations
- Progress statistics (weekly/monthly averages)

**Charts with Recharts:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightChartProps {
  data: Array<{
    date: string;
    weight: number;
  }>;
  unit: 'kg' | 'lbs';
}
```

**Acceptance Criteria:**
- ✅ Weight can be logged daily
- ✅ Weight history displays as interactive chart
- ✅ Unit conversion works correctly
- ✅ Weight trends and statistics calculated
- ✅ Data can be edited or deleted

---

### ✅ Milestone 9: Calendar & Planning Views
**Goal**: Weekly and monthly calendar interfaces

**Tasks:**
- [ ] Create weekly calendar view
- [ ] Build monthly calendar overview
- [ ] Add workout scheduling functionality
- [ ] Implement date navigation
- [ ] Show completion indicators
- [ ] Add workout preview on calendar

**Calendar Features:**
- **Weekly View**: Horizontal scroll through days
- **Monthly View**: Traditional calendar grid
- **Workout Indicators**: Visual indicators for scheduled/completed workouts
- **Date Navigation**: Easy navigation between weeks/months
- **Quick Actions**: Mark workouts complete from calendar
- **Workout Preview**: Tap day to see workout details

**Calendar Components:**
```
src/features/planning/
├── components/
│   ├── WeeklyCalendar.tsx
│   ├── MonthlyCalendar.tsx
│   ├── CalendarDay.tsx
│   └── WorkoutPreview.tsx
├── hooks/
│   ├── useCalendar.ts
│   └── usePlanNavigation.ts
└── styles/
    └── calendar.module.css
```

**Acceptance Criteria:**
- ✅ Weekly calendar with horizontal scroll
- ✅ Monthly calendar with proper date navigation
- ✅ Workout completion status visible
- ✅ Calendar works on mobile with touch gestures
- ✅ Future workouts can be scheduled

---

### ✅ Milestone 10: Settings & User Profile
**Goal**: User preferences and profile management

**Tasks:**
- [ ] Create settings interface
- [ ] Implement theme switching (dark/light)
- [ ] Add language toggle (EN/ES preparation)
- [ ] Build unit preference toggle
- [ ] Create profile editing interface
- [ ] Add data export/import (optional)

**Settings Categories:**
1. **Appearance**: Theme (dark/light/system)
2. **Language**: English/Spanish toggle
3. **Units**: Imperial (lbs/ft) vs Metric (kg/cm)
4. **Profile**: Name, email, avatar
5. **Data**: Export, backup, account deletion
6. **About**: App version, terms, privacy

**Profile Features:**
- Edit display name
- Change email (with verification)
- Upload profile avatar (optional)
- View account statistics
- Account deletion option

**Acceptance Criteria:**
- ✅ All preferences persist across sessions
- ✅ Theme changes apply immediately
- ✅ Unit changes convert existing data
- ✅ Profile information can be updated
- ✅ Settings are synced across devices

---

### ✅ Milestone 11: Internationalization (i18n)
**Goal**: Complete English and Spanish language support

**Tasks:**
- [ ] Set up i18next configuration
- [ ] Create English translation files
- [ ] Create Spanish translation files
- [ ] Implement language detection and switching
- [ ] Handle date/number formatting per locale
- [ ] Test all UI text in both languages

**i18n Structure:**
```
src/i18n/
├── index.ts
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── workout.json
│   │   ├── profile.json
│   │   └── onboarding.json
│   └── es/
│       ├── common.json
│       ├── auth.json
│       ├── workout.json
│       ├── profile.json
│       └── onboarding.json
```

**Translation Keys Example:**
```json
// en/common.json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "next": "Next",
    "back": "Back",
    "complete": "Complete"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "workouts": "Workouts",
    "progress": "Progress",
    "settings": "Settings"
  }
}

// es/common.json
{
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "next": "Siguiente",
    "back": "Atrás",
    "complete": "Completar"
  },
  "navigation": {
    "dashboard": "Panel",
    "workouts": "Entrenamientos",
    "progress": "Progreso",
    "settings": "Configuración"
  }
}
```

**Acceptance Criteria:**
- ✅ Language can be switched in settings
- ✅ All UI text translates correctly
- ✅ Date and number formatting respects locale
- ✅ Language preference persists
- ✅ Fallback to English for missing translations

---

### ✅ Milestone 12: PWA & Performance Optimization
**Goal**: Progressive Web App features and performance optimization

**Tasks:**
- [ ] Configure service worker for caching
- [ ] Create web app manifest
- [ ] Add install prompt functionality
- [ ] Implement offline data caching
- [ ] Add push notifications (optional)
- [ ] Optimize bundle size and loading performance

**PWA Features:**
- **Service Worker**: Cache app shell and API responses
- **Offline Support**: Core functionality works offline
- **Install Prompt**: Users can install app to home screen
- **Push Notifications**: Workout reminders (optional)
- **Background Sync**: Sync data when connection returns

**Performance Optimizations:**
- Code splitting by routes
- Lazy loading of non-critical components
- Image optimization and lazy loading
- Bundle analysis and optimization
- Critical CSS inlining
- Service worker caching strategies

**Manifest Configuration:**
```json
{
  "name": "Gym Tracker",
  "short_name": "GymTracker",
  "description": "Modern fitness tracking app",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#0a0a0a",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Acceptance Criteria:**
- ✅ App works offline for core features
- ✅ Install prompt appears on supported devices
- ✅ Service worker caches critical resources
- ✅ App loads quickly on slow networks
- ✅ Lighthouse PWA score > 90

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- Code editor (VS Code recommended)

### Quick Start Commands
```bash
# Create new Vite project
npm create vite@latest gym-tracker -- --template react-ts
cd gym-tracker

# Install dependencies
npm install @supabase/supabase-js react-router-dom
npm install @tanstack/react-query react-hook-form
npm install zustand clsx recharts
npm install i18next react-i18next

# Start development server
npm run dev
```

### Environment Variables
```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📝 Development Notes

### CSS Modules Naming Convention
```css
/* ComponentName.module.css */
.container { } /* Local class */
.button { }    /* Local class */
:global(.global-class) { } /* Global class */
```

### File Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- CSS Modules: `ComponentName.module.css`
- Types: `types.ts` or `ComponentName.types.ts`

### Git Workflow
- `main` branch for production-ready code
- Feature branches: `feature/milestone-1-setup`
- Commit messages: `feat: add authentication components`
- Pull requests for each milestone

---

## 🎯 Success Metrics

### Technical Metrics
- **Performance**: Lighthouse score > 90
- **Accessibility**: WCAG 2.1 AA compliance
- **PWA**: PWA audit score > 90
- **TypeScript**: Strict mode with no `any` types
- **Testing**: >80% test coverage (if tests added)

### User Experience Metrics
- **Mobile-first**: Designed for mobile, enhanced for desktop
- **Loading**: Initial load < 3 seconds on 3G
- **Offline**: Core features work without internet
- **Accessibility**: Keyboard navigation and screen reader support

---

## 🔄 Iteration Plan

After completing all milestones:

1. **User Testing**: Gather feedback from real users
2. **Performance Optimization**: Based on real usage patterns
3. **Feature Expansion**: Exercise videos, social features, etc.
4. **Platform Expansion**: Native mobile apps consideration

---

This development plan provides a clear roadmap from initial setup to a fully functional PWA. Each milestone builds upon the previous one, ensuring steady progress and working software at every step.

Start with **Milestone 1** and work through each milestone sequentially for the best results! 🚀