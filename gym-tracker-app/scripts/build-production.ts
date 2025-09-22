#!/usr/bin/env tsx

/**
 * Production build script with optimizations and validation
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface BuildConfig {
  skipTests?: boolean;
  skipLint?: boolean;
  skipTypeCheck?: boolean;
  skipOptimization?: boolean;
  generateReport?: boolean;
}

class ProductionBuilder {
  private config: BuildConfig;
  private startTime: number;

  constructor(config: BuildConfig = {}) {
    this.config = config;
    this.startTime = Date.now();
  }

  async build(): Promise<void> {
    console.log('🚀 Starting production build...\n');

    try {
      // Step 1: Pre-build validation
      await this.preBuildValidation();

      // Step 2: Run tests
      if (!this.config.skipTests) {
        await this.runTests();
      }

      // Step 3: Type checking
      if (!this.config.skipTypeCheck) {
        await this.typeCheck();
      }

      // Step 4: Linting
      if (!this.config.skipLint) {
        await this.lint();
      }

      // Step 5: Build application
      await this.buildApp();

      // Step 6: Post-build optimization
      if (!this.config.skipOptimization) {
        await this.optimize();
      }

      // Step 7: Generate build report
      if (this.config.generateReport) {
        await this.generateBuildReport();
      }

      // Step 8: Validate build output
      await this.validateBuild();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`\n✅ Production build completed successfully in ${duration}s`);

    } catch (error) {
      console.error('\n❌ Production build failed:', error);
      process.exit(1);
    }
  }

  private async preBuildValidation(): Promise<void> {
    console.log('📋 Running pre-build validation...');

    // Check required environment variables
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Check package.json version
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    console.log(`Building version: ${packageJson.version}`);

    console.log('✅ Pre-build validation passed\n');
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running tests...');
    
    try {
      execSync('npm run test', { stdio: 'inherit' });
      console.log('✅ All tests passed\n');
    } catch (error) {
      throw new Error('Tests failed. Fix failing tests before building for production.');
    }
  }

  private async typeCheck(): Promise<void> {
    console.log('🔍 Running TypeScript type checking...');
    
    try {
      execSync('npm run type-check', { stdio: 'inherit' });
      console.log('✅ Type checking passed\n');
    } catch (error) {
      throw new Error('TypeScript type checking failed. Fix type errors before building.');
    }
  }

  private async lint(): Promise<void> {
    console.log('🔧 Running linting...');
    
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ Linting passed\n');
    } catch (error) {
      throw new Error('Linting failed. Fix linting errors before building.');
    }
  }

  private async buildApp(): Promise<void> {
    console.log('🏗️  Building application...');
    
    try {
      // Set production environment
      process.env.NODE_ENV = 'production';
      
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Application built successfully\n');
    } catch (error) {
      throw new Error('Application build failed.');
    }
  }

  private async optimize(): Promise<void> {
    console.log('⚡ Running post-build optimizations...');
    
    try {
      // Run bundle analysis
      console.log('📊 Analyzing bundle size...');
      execSync('npm run analyze', { stdio: 'pipe' });
      
      console.log('✅ Optimizations completed\n');
    } catch (error) {
      console.warn('⚠️  Bundle analysis failed, continuing...\n');
    }
  }

  private async generateBuildReport(): Promise<void> {
    console.log('📊 Generating build report...');
    
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: JSON.parse(readFileSync('package.json', 'utf-8')).version,
      environment: 'production',
      nodeVersion: process.version,
      buildDuration: ((Date.now() - this.startTime) / 1000).toFixed(2) + 's'
    };

    writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
    console.log('✅ Build report generated\n');
  }

  private async validateBuild(): Promise<void> {
    console.log('🔍 Validating build output...');
    
    const requiredFiles = [
      'dist/index.html',
      'dist/assets',
      'dist/manifest.webmanifest'
    ];

    const missingFiles = requiredFiles.filter(file => !existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required build files: ${missingFiles.join(', ')}`);
    }

    // Check if service worker was generated
    if (!existsSync('dist/sw.js')) {
      console.warn('⚠️  Service worker not found. PWA features may not work.');
    }

    console.log('✅ Build validation passed\n');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config: BuildConfig = {
    skipTests: args.includes('--skip-tests'),
    skipLint: args.includes('--skip-lint'),
    skipTypeCheck: args.includes('--skip-type-check'),
    skipOptimization: args.includes('--skip-optimization'),
    generateReport: args.includes('--report') || process.env.CI === 'true'
  };

  const builder = new ProductionBuilder(config);
  await builder.build();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProductionBuilder };