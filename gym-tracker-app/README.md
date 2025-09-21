# Gym Tracker App

A modern Progressive Web App (PWA) for fitness enthusiasts to track workouts, monitor progress, and maintain consistency in their fitness journey.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with Design Tokens
- **State Management**: Zustand for client state, React Query for server state
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Modal/
│   └── layout/             # Layout components
│       └── AppLayout/
├── features/               # Feature-specific components
│   ├── auth/
│   ├── dashboard/
│   ├── workouts/
│   ├── progress/
│   ├── planning/
│   └── settings/
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configuration
├── store/                  # Global state management
├── styles/                 # Global styles and design tokens
├── types/                  # TypeScript definitions
└── main.tsx               # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Design System

The app uses a comprehensive design token system with CSS custom properties for:

- Colors (light/dark theme support)
- Typography scales
- Spacing system
- Border radius
- Shadows
- Z-index layers
- Transitions

Themes are automatically applied based on user preference or system setting.

## Development Guidelines

- Follow the feature-based folder structure
- Use TypeScript strict mode
- Write semantic, accessible HTML
- Follow the established design token system
- Use CSS Modules for component styling
- Implement proper error boundaries
- Write tests for critical functionality

## Next Steps

This foundation provides:
- ✅ Vite React TypeScript project setup
- ✅ ESLint and Prettier configuration
- ✅ CSS Modules and design token system
- ✅ Core dependencies (React Router, React Query, Zustand)
- ✅ Feature-based project structure
- ✅ Basic component placeholders
- ✅ Global state management setup
- ✅ TypeScript type definitions

Ready for implementing the next tasks in the specification!