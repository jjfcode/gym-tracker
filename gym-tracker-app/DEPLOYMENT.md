# Deployment Guide

This guide covers the deployment process for the Gym Tracker application across different environments and platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- Node.js 18+ and npm 9+
- Git
- Supabase account and project
- Deployment platform account (Vercel, Netlify, etc.)

### Environment Variables

The following environment variables are required for deployment:

```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Gym Tracker
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database setup script:
   ```bash
   npm run setup:database
   ```
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers if needed

### 2. Local Development

```bash
# Clone the repository
git clone <repository-url>
cd gym-tracker-app

# Install dependencies
npm ci

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## Build Process

### Production Build

The application uses a comprehensive build process with optimization and validation:

```bash
# Full production build with all checks
npm run build:production

# Quick build (skip tests and linting)
npm run build:production -- --skip-tests --skip-lint

# Build with analysis report
npm run build:production -- --report
```

### Build Optimization Features

- **Code Splitting**: Automatic chunking by features and vendors
- **Tree Shaking**: Removes unused code
- **Minification**: Terser with advanced compression
- **Asset Optimization**: Image compression and format optimization
- **Bundle Analysis**: Size analysis and recommendations

### Build Validation

The build process includes:

- TypeScript type checking
- ESLint code quality checks
- Unit test execution
- Security vulnerability scanning
- Performance optimization validation

## Deployment Platforms

### Vercel (Recommended)

Vercel provides excellent support for React applications with automatic deployments.

#### Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login and link project:
   ```bash
   vercel login
   vercel link
   ```

3. Configure environment variables in Vercel dashboard

4. Deploy:
   ```bash
   # Deploy to preview
   npm run deploy staging vercel
   
   # Deploy to production
   npm run deploy production vercel
   ```

#### Vercel Configuration

The project includes `deployment/vercel.json` with:
- Security headers
- Caching strategies
- SPA routing configuration
- Build optimization settings

### Netlify

Alternative deployment platform with similar features.

#### Setup

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Login and link project:
   ```bash
   netlify login
   netlify link
   ```

3. Deploy:
   ```bash
   # Deploy to preview
   npm run deploy staging netlify
   
   # Deploy to production
   npm run deploy production netlify
   ```

#### Netlify Configuration

The project includes `deployment/netlify.toml` with:
- Build settings
- Security headers
- Redirect rules
- PWA configuration

### Manual Deployment

For custom hosting providers:

```bash
# Build for manual deployment
npm run deploy production manual

# Upload contents of dist/ directory to your hosting provider
```

## CI/CD Pipeline

### GitHub Actions

The project includes a comprehensive CI/CD pipeline in `.github/workflows/ci.yml`:

#### Pipeline Stages

1. **Quality Checks**
   - TypeScript type checking
   - ESLint linting
   - Prettier formatting
   - Unit tests
   - Security audit

2. **Build**
   - Production build
   - Bundle analysis
   - Artifact upload

3. **Testing**
   - E2E tests with Playwright
   - Cross-browser testing
   - Performance testing with Lighthouse

4. **Security**
   - Vulnerability scanning
   - Security assessment
   - Dependency audit

5. **Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Release creation

#### Required Secrets

Configure these secrets in your GitHub repository:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Branch Strategy

- `main`: Production branch (auto-deploys to production)
- `develop`: Development branch (auto-deploys to staging)
- `feature/*`: Feature branches (creates preview deployments)

## Monitoring and Maintenance

### Performance Monitoring

The application includes built-in performance monitoring:

- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Automatic bundle size monitoring
- **Error Tracking**: Client-side error reporting
- **Performance Metrics**: Custom performance measurements

### Health Checks

Regular health checks ensure application stability:

```bash
# Database health check
npm run health:database

# Performance audit
npm run perf:audit

# Security assessment
npm run security:full
```

### Maintenance Tasks

#### Regular Updates

```bash
# Update dependencies
npm update

# Security audit and fixes
npm run security:audit
npm run security:fix

# Database optimization
npm run db:optimize
```

#### Performance Optimization

```bash
# Bundle analysis
npm run analyze

# Lighthouse audit
npm run lighthouse

# Cross-browser testing
npm run test:cross-browser
```

### Monitoring Dashboard

Set up monitoring for:

- Application uptime
- Performance metrics
- Error rates
- User analytics
- Database performance

## Troubleshooting

### Common Issues

#### Build Failures

1. **TypeScript Errors**
   ```bash
   npm run type-check
   # Fix reported type errors
   ```

2. **Linting Errors**
   ```bash
   npm run lint:fix
   # Review and fix remaining issues
   ```

3. **Test Failures**
   ```bash
   npm run test
   # Fix failing tests
   ```

#### Deployment Issues

1. **Environment Variables**
   - Verify all required variables are set
   - Check variable names and values
   - Ensure Supabase credentials are correct

2. **Build Size Issues**
   ```bash
   npm run analyze
   # Review bundle size report
   # Optimize large chunks if needed
   ```

3. **Performance Issues**
   ```bash
   npm run lighthouse
   # Review performance report
   # Implement recommended optimizations
   ```

#### Runtime Issues

1. **Supabase Connection**
   ```bash
   npm run test:database
   # Verify database connectivity
   ```

2. **PWA Issues**
   - Check service worker registration
   - Verify manifest.json
   - Test offline functionality

3. **Authentication Issues**
   - Verify Supabase auth configuration
   - Check RLS policies
   - Test auth flows

### Debug Mode

Enable debug mode for detailed logging:

```bash
VITE_ENABLE_DEBUG=true npm run dev
```

### Support

For additional support:

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Review application logs
3. Check Supabase dashboard for database issues
4. Monitor deployment platform logs

## Security Considerations

### Production Security

- All environment variables are validated
- Security headers are enforced
- Content Security Policy (CSP) is configured
- HTTPS is required in production
- Regular security audits are performed

### Data Protection

- Row Level Security (RLS) enforces data isolation
- Input validation prevents injection attacks
- Authentication tokens are securely managed
- User data is encrypted in transit and at rest

### Compliance

The application follows security best practices:

- OWASP security guidelines
- Data privacy regulations (GDPR ready)
- Secure authentication flows
- Regular vulnerability assessments

---

For more detailed information, see:
- [MAINTENANCE.md](./MAINTENANCE.md) - Ongoing maintenance procedures
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed troubleshooting guide
- [SECURITY.md](./SECURITY.md) - Security guidelines and procedures