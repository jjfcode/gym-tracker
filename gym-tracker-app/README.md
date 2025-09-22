# Gym Tracker App

A modern Progressive Web App (PWA) for tracking workouts, monitoring progress, and maintaining consistency in your fitness journey.

## Features

- **User Authentication**: Secure sign-up, sign-in, and password reset with Supabase Auth
- **Workout Tracking**: Log sets, reps, weights, and RPE for exercises with real-time sync
- **Progress Monitoring**: Track body weight and visualize progress with interactive charts
- **Workout Planning**: Weekly and monthly calendar views for workout scheduling
- **Exercise Library**: Comprehensive exercise database with custom exercise support
- **Internationalization**: Support for English and Spanish languages with i18next
- **Progressive Web App**: Installable app with offline functionality and background sync
- **Responsive Design**: Mobile-first design optimized for all devices
- **Performance Optimized**: Code splitting, lazy loading, and advanced caching strategies
- **Security First**: Row Level Security, input validation, and comprehensive security headers

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules with design token system (no external CSS frameworks)
- **State Management**: Zustand for client state, React Query for server state
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **PWA**: Service Worker with Workbox, IndexedDB for offline storage
- **Testing**: Vitest, React Testing Library, Playwright for E2E
- **Build**: Vite with advanced optimization and bundle analysis
- **CI/CD**: GitHub Actions with comprehensive testing pipeline
- **Deployment**: Vercel/Netlify ready with security headers and caching

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase account and project
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gym-tracker-app
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Set up the database:
   ```bash
   npm run setup:database
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Standard production build
- `npm run build:production` - Full production build with validation
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:mobile` - Run E2E tests on mobile devices
- `npm run test:cross-browser` - Run cross-browser compatibility tests
- `npm run test:integration` - Run complete user workflow tests

### Database & Health
- `npm run setup:database` - Set up database schema and RLS policies
- `npm run test:database` - Test database connection and setup
- `npm run health:database` - Comprehensive database health check
- `npm run db:optimize` - Optimize database performance

### Performance & Analysis
- `npm run analyze` - Analyze bundle size and dependencies
- `npm run lighthouse` - Run Lighthouse performance audit
- `npm run perf:audit` - Complete performance audit with build

### Security
- `npm run security:audit` - Run npm security audit
- `npm run security:assessment` - Custom security assessment
- `npm run security:test` - Run security-focused tests
- `npm run security:full` - Comprehensive security check

### Deployment
- `npm run deploy` - Interactive deployment script
- `npm run validate:deployment` - Validate deployment readiness
- Example: `npm run deploy production vercel`

## Project Structure

```
gym-tracker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   └── layout/         # Layout components (AppLayout, etc.)
│   ├── features/           # Feature-specific components
│   │   ├── auth/           # Authentication & onboarding
│   │   ├── dashboard/      # Main dashboard
│   │   ├── workouts/       # Workout tracking
│   │   ├── progress/       # Progress tracking & charts
│   │   ├── planning/       # Workout planning & calendar
│   │   ├── exercises/      # Exercise library
│   │   └── settings/       # User settings & preferences
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configuration
│   │   ├── supabase.ts     # Supabase client configuration
│   │   ├── config.ts       # App configuration with validation
│   │   ├── performance.ts  # Performance monitoring utilities
│   │   └── i18n.ts         # Internationalization setup
│   ├── store/              # Global state management (Zustand)
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.webmanifest # PWA manifest
├── scripts/                # Build and deployment scripts
├── deployment/             # Platform-specific deployment configs
├── e2e/                    # End-to-end tests
├── .github/workflows/      # CI/CD pipeline
└── docs/                   # Documentation
    ├── DEPLOYMENT.md       # Deployment guide
    ├── MAINTENANCE.md      # Maintenance procedures
    └── TROUBLESHOOTING.md  # Troubleshooting guide
```

## Deployment

### Quick Deployment

1. **Validate deployment readiness**:
   ```bash
   npm run validate:deployment
   ```

2. **Deploy to staging**:
   ```bash
   npm run deploy staging vercel
   ```

3. **Deploy to production**:
   ```bash
   npm run deploy production vercel
   ```

### Supported Platforms

- **Vercel** (Recommended): Automatic deployments with GitHub integration
- **Netlify**: Alternative with similar features
- **Manual**: Build and upload to any static hosting provider

### Environment Variables

Required for deployment:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional:
```bash
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## Performance Features

- **Code Splitting**: Automatic chunking by features and vendors
- **Lazy Loading**: Route-based and component-based lazy loading
- **Bundle Optimization**: Advanced Terser configuration and tree shaking
- **Caching**: Service worker with intelligent caching strategies
- **Image Optimization**: Responsive images with lazy loading
- **Web Vitals**: Built-in Core Web Vitals monitoring
- **Bundle Analysis**: Automated bundle size monitoring

## Security Features

- **Authentication**: Secure JWT-based authentication with Supabase
- **Authorization**: Row Level Security (RLS) for data isolation
- **Input Validation**: Zod schemas for all user inputs
- **Security Headers**: Comprehensive security headers configuration
- **Content Security Policy**: Strict CSP for XSS protection
- **Dependency Scanning**: Automated vulnerability scanning
- **Audit Logging**: Security event logging and monitoring

## PWA Features

- **Installable**: Web App Manifest for device installation
- **Offline Support**: Service worker with offline functionality
- **Background Sync**: Data synchronization when connection restored
- **Push Notifications**: Ready for push notification integration
- **App Shell**: Fast loading app shell architecture
- **Update Management**: Automatic updates with user notification

## Testing Strategy

- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: Feature integration testing with React Testing Library
- **E2E Tests**: Complete user workflow testing with Playwright
- **Cross-Browser**: Automated testing across Chrome, Firefox, Safari
- **Mobile Testing**: Device-specific testing for mobile compatibility
- **Performance Testing**: Lighthouse CI for performance monitoring
- **Security Testing**: Automated security vulnerability scanning

## Monitoring & Maintenance

### Built-in Monitoring
- Performance metrics collection
- Error boundary with error reporting
- Web Vitals tracking
- Bundle size monitoring

### Health Checks
```bash
npm run health:database    # Database connectivity and performance
npm run perf:audit        # Performance metrics and optimization
npm run security:full     # Security assessment and vulnerability scan
```

### Maintenance Tasks
- **Daily**: Automated health checks and monitoring
- **Weekly**: Performance review and security audit
- **Monthly**: Dependency updates and optimization review
- **Quarterly**: Major updates and security policy review

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Run tests: `npm run test && npm run test:e2e`
5. Run validation: `npm run validate:deployment`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use CSS Modules for styling
- Write tests for new features
- Follow the established project structure
- Update documentation for significant changes

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment procedures
- [Maintenance Guide](./MAINTENANCE.md) - Ongoing maintenance tasks
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Security Guidelines](./SECURITY.md) - Security best practices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
1. Check the troubleshooting guide
2. Review the documentation
3. Check existing GitHub issues
4. Create a new issue with detailed information