# GYM TRACKER — Modern Full-Stack Fitness App 💪

**Una aplicación moderna de seguimiento de ejercicios y peso, construida desde cero con tecnologías actuales y diseño minimalista.**

---

## 🎯 Visión del Producto

Una **progressive web app (PWA)** minimalista y elegante para el seguimiento de entrenamientos y progreso físico. Enfoque en **simplicidad, velocidad y experiencia de usuario excepcional**.

### Características Principales:
- 🔐 **Autenticación moderna** con JWT
- 📱 **Mobile-first** con diseño responsive
- 📊 **Dashboard inteligente** con métricas importantes
- 🏋️ **Tracking de ejercicios** con sets/reps/peso
- 📈 **Progreso visual** con gráficos interactivos
- 🌙 **Dark/Light mode** automático
- 🌍 **Bilingüe** (ES/EN) desde el inicio
- ⚡ **Offline-first** con sincronización

---

## 🛠 Stack Tecnológico (2025)

### Frontend:
- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** + **Headless UI** para componentes
- **Framer Motion** para animaciones suaves
- **React Query (TanStack)** para state management
- **React Hook Form** + **Zod** para formularios
- **Recharts** para gráficos
- **PWA** con Workbox

### Backend:
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** con **Prisma ORM**
- **JWT** + **bcrypt** para autenticación
- **Cloudinary** para imágenes (opcional)
- **Rate limiting** y **CORS** configurado

### Deployment:
- **Render** para backend y base de datos
- **Render** o **Vercel** para frontend
- **GitHub Actions** para CI/CD

---

## 🎨 Diseño y UX

### Principios de Diseño:
1. **Minimalismo** - Solo lo esencial, nada más
2. **Velocidad** - Carga instantánea, transiciones fluidas
3. **Intuitividad** - No necesita tutorial
4. **Accesibilidad** - WCAG 2.1 compliant
5. **Mobile-first** - Diseñado para móvil primero

### Paleta de Colores:
```css
/* Dark Theme (Primary) */
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
--text-primary: #ffffff;
--text-secondary: #a3a3a3;
--accent: #3b82f6;
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* Light Theme */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1e293b;
--text-secondary: #64748b;
```

### Tipografía:
- **Primary:** Inter (clean, modern)
- **Monospace:** JetBrains Mono (para números/datos)

---

## 📱 Arquitectura de la App

### Estructura del Proyecto:
```
gym-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── ui/             # Componentes base (Button, Input, etc.)
│   │   │   ├── layout/         # Layout components
│   │   │   └── charts/         # Gráficos personalizados
│   │   ├── features/           # Features por dominio
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── workouts/       # Entrenamientos
│   │   │   ├── exercises/      # Ejercicios
│   │   │   ├── progress/       # Progreso y estadísticas
│   │   │   └── profile/        # Perfil de usuario
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilidades y configuración
│   │   ├── store/              # Estado global (Zustand)
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Funciones auxiliares
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/        # Controladores REST
│   │   ├── middleware/         # Middleware personalizado
│   │   ├── models/             # Modelos de datos
│   │   ├── routes/             # Rutas de la API
│   │   ├── services/           # Lógica de negocio
│   │   ├── utils/              # Utilidades
│   │   └── types/              # Tipos compartidos
│   ├── prisma/                 # Schema de base de datos
│   └── package.json
└── shared/                     # Tipos compartidos entre front/back
```

---

## 🗄 Modelo de Datos

### Entidades Principales:

```typescript
// Usuario
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'es' | 'en';
  units: 'metric' | 'imperial';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

// Entrenamiento
interface Workout {
  id: string;
  userId: string;
  name: string;
  date: Date;
  duration?: number; // en minutos
  notes?: string;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  completedAt?: Date;
}

// Ejercicio en entrenamiento
interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  sets: ExerciseSet[];
  notes?: string;
}

// Set de ejercicio
interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  duration?: number; // para cardio
  distance?: number; // para cardio
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

// Catálogo de ejercicios
interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  nameEs: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  tips?: string;
  media?: ExerciseMedia[];
}

// Peso corporal
interface BodyWeight {
  id: string;
  userId: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: Date;
  notes?: string;
}
```

---

## 🚀 Flujo de la Aplicación

### 1. **Landing & Auth**
```
┌─ Landing Page (/)*
├─ Sign In (/login)
├─ Sign Up (/register)
└─ Password Reset (/reset)
```

### 2. **Onboarding** (First-time users)
```
┌─ Welcome (/onboarding)
├─ Basic Info (name, goals)
├─ Body Stats (weight, height)
├─ Experience Level
├─ Workout Preferences
└─ Plan Selection
```

### 3. **Main App** (Authenticated users)
```
┌─ Dashboard (/) - Vista principal
├─ Workouts (/workouts)
│   ├─ Today's Workout (/workouts/today)
│   ├─ Create Workout (/workouts/new)
│   ├─ Workout History (/workouts/history)
│   └─ Workout Detail (/workouts/:id)
├─ Progress (/progress)
│   ├─ Body Weight (/progress/weight)
│   ├─ Exercise PR (/progress/records)
│   └─ Statistics (/progress/stats)
├─ Exercises (/exercises)
│   ├─ Exercise Library (/exercises/library)
│   └─ Exercise Detail (/exercises/:id)
└─ Profile (/profile)
    ├─ Settings (/profile/settings)
    ├─ Preferences (/profile/preferences)
    └─ Data Export (/profile/export)
```

---

## 📋 Milestones de Desarrollo

### 🎯 **Milestone 1: Foundation (Week 1)**
- [ ] Setup del proyecto (frontend + backend)
- [ ] Configuración de Render y base de datos
- [ ] Sistema de autenticación completo
- [ ] Diseño base y componentes UI
- [ ] Routing y navegación

### 🎯 **Milestone 2: Core Features (Week 2)**
- [ ] Dashboard principal
- [ ] CRUD de entrenamientos
- [ ] Sistema de ejercicios básico
- [ ] Tracking de peso corporal
- [ ] Responsive design completo

### 🎯 **Milestone 3: Advanced Features (Week 3)**
- [ ] Gráficos y visualizaciones
- [ ] Plantillas de entrenamientos
- [ ] Sistema de progreso y métricas
- [ ] Búsqueda y filtros
- [ ] Optimizaciones de performance

### 🎯 **Milestone 4: Polish & PWA (Week 4)**
- [ ] PWA configuration
- [ ] Offline functionality
- [ ] Internacionalización (ES/EN)
- [ ] Dark/Light mode
- [ ] Testing y QA final

---

## 🔧 APIs y Endpoints

### Autenticación:
```
POST /api/auth/register    # Registro
POST /api/auth/login       # Login
POST /api/auth/logout      # Logout
POST /api/auth/refresh     # Refresh token
POST /api/auth/reset       # Reset password
```

### Entrenamientos:
```
GET    /api/workouts       # Lista de entrenamientos
POST   /api/workouts       # Crear entrenamiento
GET    /api/workouts/:id   # Detalle del entrenamiento
PUT    /api/workouts/:id   # Actualizar entrenamiento
DELETE /api/workouts/:id   # Eliminar entrenamiento
```

### Ejercicios:
```
GET    /api/exercises      # Catálogo de ejercicios
GET    /api/exercises/:id  # Detalle del ejercicio
POST   /api/exercises      # Crear ejercicio personalizado
```

### Progreso:
```
GET    /api/progress/weight    # Historial de peso
POST   /api/progress/weight    # Registrar peso
GET    /api/progress/stats     # Estadísticas generales
GET    /api/progress/charts    # Datos para gráficos
```

---

## 🎨 Componentes UI Clave

### Design System:
```typescript
// Botones
<Button variant="primary|secondary|ghost" size="sm|md|lg">
<IconButton icon="plus|edit|delete" />

// Inputs
<Input type="text|email|password|number" />
<Select options={[]} />
<DatePicker />
<NumberInput unit="kg|lbs|min" />

// Layout
<Card>
<Modal>
<Drawer>
<Tabs>

// Charts
<LineChart data={} />
<BarChart data={} />
<ProgressRing value={} />

// Workout specific
<ExerciseCard>
<SetInput>
<WorkoutTimer>
<ProgressIndicator>
```

---

## 📱 PWA Features

- **Offline functionality** - Cachear datos críticos
- **Push notifications** - Recordatorios de entrenamientos
- **Install prompt** - "Agregar a pantalla de inicio"
- **Background sync** - Sincronizar cuando hay conexión
- **Dark mode** - Respeta preferencias del sistema

---

## 🚀 Deployment Strategy

### Render Setup:
1. **Database**: PostgreSQL en Render
2. **Backend**: Node.js service en Render
3. **Frontend**: Static site en Render/Vercel
4. **Environment Variables**: Configuradas en Render
5. **Custom Domain**: Opcional

### CI/CD Pipeline:
- **GitHub Actions** para testing automático
- **Deploy automático** en push a main
- **Preview deployments** para PRs
- **Database migrations** automáticas

---

## ¿Empezamos desde cero con este nuevo diseño?

Este nuevo enfoque es más moderno, escalable y está optimizado para 2025. ¿Te gusta la dirección? ¿Quieres que empecemos a implementar este diseño nuevo?

**Flow summary:**
1. User lands → if not authed → Sign In / Sign Up.
2. On first sign‑in → Onboarding: ask **current weight** + **days/week** → generate plan.
3. Home shows “**Today**” workout + quick actions (mark done, add weight).
4. Planner tabs: **Week** and **Month**.
5. Progress: **Weight chart**, **streak**, **completed sessions**.
6. Settings: units (lb/kg), language (EN/ES), sign‑out.

---

## 3) Data model (Supabase — Postgres)
```sql
-- USERS are managed by supabase.auth.users (uuid). We store profile in public.profile.

create table public.profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text default 'en',
  units text default 'imperial', -- 'imperial' | 'metric'
  created_at timestamptz default now()
);

create table public.weight_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  measured_at date not null,        -- YYYY-MM-DD
  weight numeric(6,2) not null,     -- supports kg or lb; store as lbs by default, convert in UI
  note text,
  created_at timestamptz default now(),
  unique (user_id, measured_at)     -- 1 entry per day
);

create table public.plans (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  goal_days_per_week int not null check (goal_days_per_week between 1 and 7),
  plan_scope text not null default 'weekly',   -- 'weekly' or 'monthly'
  start_date date not null,                    -- week or month anchor
  meta jsonb default '{}'::jsonb,              -- extra knobs if needed
  created_at timestamptz default now()
);

create table public.workouts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  plan_id bigint references public.plans(id) on delete cascade,
  date date not null,                          -- calendar date
  title text not null,                         -- e.g., "Full Body A"
  is_completed boolean default false,
  created_at timestamptz default now(),
  unique (user_id, date)                       -- 1 workout/day by default (can relax later)
);

create table public.exercises (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  workout_id bigint references public.workouts(id) on delete cascade,
  slug text not null,                          -- 'chest-press', 'lat-pulldown', etc.
  name_en text not null,
  name_es text not null,
  machine_brand text,                          -- 'Life Fitness', 'Hammer Strength'
  order_index int default 0,
  target_sets int default 3,
  target_reps int default 10,
  created_at timestamptz default now()
);

create table public.exercise_sets (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id bigint references public.exercises(id) on delete cascade,
  set_index int not null,                      -- 1,2,3...
  weight numeric(6,2),                         -- store in lbs by default
  reps int,
  rpe numeric(3,1),                            -- optional intensity
  notes text,
  created_at timestamptz default now()
);

-- Quick progress counters
create view public.v_user_weekly_summary as
select user_id,
       date_trunc('week', date)::date as week_start,
       count(*) filter (where is_completed) as workouts_done,
       count(*) as workouts_total
from public.workouts
group by 1,2;
```

> Minimal policy: enable Row Level Security (RLS) per table. Policies: user can CRUD only their rows (`user_id = auth.uid()`).

---

## 4) Authentication & onboarding
**Screens:**
- **Welcome** → “Sign In” / “Create account”
- **Sign Up** (email, password, confirm password)
- **Sign In**
- **Onboarding 1:** “What’s your **current weight**?”
- **Onboarding 2:** “How many **days per week** do you want to train?” (1–7)
- **Review:** show weekly template → “Create my plan”

**On plan creation logic:**
- Anchor to the **next Monday** (or today) for weekly plan.
- Generate `workouts` for the week (D1..Dn based on days/week).
- Pre-fill `exercises` from **templates** (see §6).

---

## 5) Internationalization (i18n)
Start in English, but **prepare keys** for Spanish. Example:
```json
// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "next": "Next",
    "back": "Back"
  },
  "auth": {
    "sign_in": "Sign In",
    "sign_up": "Create account",
    "email": "Email",
    "password": "Password"
  },
  "onboarding": {
    "title": "Let's set up your plan",
    "weight_prompt": "What's your current weight?",
    "days_prompt": "How many days per week do you want to train?"
  },
  "workout": {
    "today": "Today",
    "complete_workout": "Complete workout",
    "add_weight": "Add weight"
  }
}
```
Later add `es.json` with the same keys. Use `i18next` with language switcher in Settings.

---

## 6) Workout templates (starter logic)
Create a simple planner that maps **Days/Week** → templates:

- **3 days/week (Full Body A/B/C)**  
  A: Chest Press, Seated Row, Leg Press, Shoulder Press, Biceps Curl, Triceps Pushdown  
  B: Incline Chest Press, Lat Pulldown, Leg Extension, Seated Leg Curl, Lateral Raise, Ab Crunch  
  C: Smith Squat, Hammer Row, Chest Press (variant), Hip Abductor, Cable Biceps + Rope Triceps + (optional 15–20’ cardio)

- **4–5 days/week**: split Upper/Lower + Full Body finisher.

Keep templates in code (`/lib/templates.ts`) and duplicate into `exercises` when creating the plan. You can refine later per user goals.

---

## 7) Pages & acceptance criteria

### 7.1 Home / Today
- Shows today’s workout (or “Rest day”).
- Exercise cards with **Set 1/2/3** fields (weight, reps), notes.
- **Mark workout completed** → sets `workouts.is_completed = true`.
- **Quick add weight** dialog.

**Done when**: can complete a workout and see result in Progress.

### 7.2 Planner (Week / Month)
- Week: horizontal days (Mon–Sun) with checkmarks for completed.  
- Month: calendar grid with dots for session count.
- Tap day → open workout editor.

**Done when**: changing goal days regenerates future weeks only (don’t overwrite past).

### 7.3 Weight
- Add weight entry (date picker default today).
- Show **line chart** (last 30/90 days).
- Unit switch (lb/kg) applies conversion in UI.

**Done when**: one log per day; editing persists; chart updates.

### 7.4 Profile / Settings
- Language (EN/ES), Units (Imperial/Metric), Name.
- Sign out.

**Done when**: preferences persist and update UI instantly.

### 7.5 Auth
- Email/password flows with validations.
- Password reset.

**Done when**: happy path tested + RLS policies enforced.

---

## 8) API access (Supabase client-side)
No custom servers required initially. Use Supabase JS client:
- `supabase.auth.signUp({ email, password })`
- `supabase.from('weight_logs').upsert(...)`
- `supabase.from('workouts').insert(...)`
- RLS ensures `user_id = auth.uid()` rows only.

> If you later need custom logic (e.g., template generation), add **Edge Functions** in Supabase to keep secure logic server‑side.

---

## 9) Offline-first (optional v1.1)
- Add a **Service Worker** to cache shell & JSON (Today/Week).  
- Mirror user entries in **IndexedDB** (Dexie) and **sync** to Supabase when online.  
- Conflict rule: **last write wins** per field for simplicity.

---

## 10) Analytics & metrics (v1.2)
- Store `workouts_done/week`, `streak_days`, `avg_sets`, `avg_weight_change`.  
- Use Supabase “Analytics” or ship events to PostHog.

---

## 11) Security checklist
- Enable RLS for all tables; default deny.
- Policies per table: `user_id = auth.uid()`.
- Validate weight 20–800 lb (9–363 kg), reps 1–50, sets 0–20.
- Rate‑limit auth (Supabase handles basics).

---

## 12) Milestones (tasks roadmap)

### Milestone 1 — Auth + Onboarding (EN only)
- [ ] Supabase project, tables, RLS, policies
- [ ] Auth screens (Sign In / Sign Up / Reset)
- [ ] Onboarding: weight (with units), days/week
- [ ] Plan generator (create current week starting today)
- [ ] Home: Today shows generated workout

### Milestone 2 — Workouts CRUD + Progress
- [ ] Exercise cards with sets (add/edit/delete)
- [ ] Mark workout complete
- [ ] Planner (Week) list & navigate by date
- [ ] Weight screen + chart (Recharts)

### Milestone 3 — Month view + Settings
- [ ] Monthly calendar overview
- [ ] Settings: language toggle (EN now, ES placeholder), units
- [ ] Persist preferences in `profile`

### Milestone 4 — PWA + Offline (optional)
- [ ] Service Worker + manifest
- [ ] Cache shell, fallback offline
- [ ] Local mirror (Dexie) & sync

### Milestone 5 — Spanish (ES) + Polishing
- [ ] Add `es.json`, translate core screens
- [ ] QA i18n; right‑sized copy per locale
- [ ] UI polish + accessibility

---

## 13) Suggested file stubs (Next.js + TS example)
```
/lib/supabaseClient.ts
/lib/i18n.ts
/lib/templates.ts
/features/auth/{SignIn.tsx,SignUp.tsx,Reset.tsx}
/features/onboarding/{Welcome.tsx,Weight.tsx,Days.tsx,Review.tsx}
/features/workouts/{Today.tsx,PlannerWeek.tsx,PlannerMonth.tsx,ExerciseCard.tsx}
/features/progress/{WeightChart.tsx,History.tsx}
/features/profile/{Settings.tsx}
/i18n/en.json  (start here)
/i18n/es.json  (add later)
```

---

## 14) UX notes
- **Keep taps minimal**: default to 3 sets; add a “+ set” button if needed.
- **Smart defaults** from templates; user can edit reps/sets inline.
- Show **consistency streak** to motivate.
- **Dark theme** by default. Large touch targets.
- Save inputs **onBlur**; show small toast “Saved”.

---

## 15) Seed template (example JSON)
```ts
// /lib/templates.ts
export const TEMPLATE_3DAY = {
  A: ['chest-press', 'seated-row', 'leg-press', 'shoulder-press', 'biceps-curl', 'triceps-pushdown'],
  B: ['incline-chest-press', 'lat-pulldown', 'leg-extension', 'seated-leg-curl', 'lateral-raise', 'ab-crunch'],
  C: ['smith-squat', 'hammer-row', 'chest-press', 'hip-abductor', 'cable-biceps', 'rope-triceps']
};
```

---

## 16) Definition of Done (v1)
- User can **sign up**, **sign in**, complete onboarding (weight + days/week).
- App generates a **weekly plan** and shows **Today** workout.
- User can **log sets** and **mark complete**.
- User can **log weight** and see a **chart**.
- Settings allow **unit** and **language** (EN active, ES placeholder).
- Data is protected by **RLS**; app passes basic tests; deployed.

---

## 17) Nice‑to‑have (later)
- Exercise library with images (Life Fitness / Hammer Strength).
- Timer & rest notifications.
- Export to CSV/JSON; Apple Health / Google Fit sync.
- Personalized progression (5% auto‑increment when all sets complete).
- Coach mode & workout sharing.

---

## 18) Quick start commands
- Create Supabase project; add tables above; enable RLS; add policies.
- `npm create vite@latest gym-tracker -- --template react-ts`
- `npm i @supabase/supabase-js react-router-dom tailwindcss i18next react-i18next recharts @tanstack/react-query`
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- Build screens following milestones.

---

**That’s it.** This plan gets you shipping **Auth + Onboarding + Planner + Weight + Today** quickly, in **English** first, with a clear path to **Spanish** and **PWA/offline**.
