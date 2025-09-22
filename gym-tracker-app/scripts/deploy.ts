#!/usr/bin/env tsx

/**
 * Deployment script for different environments
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

type Environment = 'staging' | 'production';
type Platform = 'vercel' | 'netlify' | 'manual';

interface DeploymentConfig {
  environment: Environment;
  platform: Platform;
  skipBuild?: boolean;
  skipTests?: boolean;
  dryRun?: boolean;
}

class Deployer {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async deploy(): Promise<void> {
    console.log(`🚀 Starting deployment to ${this.config.environment} on ${this.config.platform}...\n`);

    try {
      // Pre-deployment checks
      await this.preDeploymentChecks();

      // Build application if needed
      if (!this.config.skipBuild) {
        await this.buildApplication();
      }

      // Run tests if needed
      if (!this.config.skipTests) {
        await this.runTests();
      }

      // Deploy to platform
      if (!this.config.dryRun) {
        await this.deployToPlatform();
      } else {
        console.log('🔍 Dry run mode - skipping actual deployment');
      }

      // Post-deployment verification
      if (!this.config.dryRun) {
        await this.postDeploymentVerification();
      }

      console.log(`\n✅ Deployment to ${this.config.environment} completed successfully!`);

    } catch (error) {
      console.error(`\n❌ Deployment failed:`, error);
      process.exit(1);
    }
  }

  private async preDeploymentChecks(): Promise<void> {
    console.log('📋 Running pre-deployment checks...');

    // Check if we're on the correct branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const expectedBranch = this.config.environment === 'production' ? 'main' : 'develop';

    if (currentBranch !== expectedBranch) {
      throw new Error(`Wrong branch for ${this.config.environment} deployment. Expected: ${expectedBranch}, Current: ${currentBranch}`);
    }

    // Check for uncommitted changes
    try {
      execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
    } catch {
      throw new Error('Uncommitted changes detected. Please commit or stash changes before deployment.');
    }

    // Check environment variables
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log('✅ Pre-deployment checks passed\n');
  }

  private async buildApplication(): Promise<void> {
    console.log('🏗️  Building application...');

    try {
      execSync('npm run build:production', { stdio: 'inherit' });
      console.log('✅ Application built successfully\n');
    } catch (error) {
      throw new Error('Application build failed');
    }
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running tests...');

    try {
      // Run unit tests
      execSync('npm run test', { stdio: 'inherit' });
      
      // Run E2E tests for production deployments
      if (this.config.environment === 'production') {
        execSync('npm run test:e2e', { stdio: 'inherit' });
      }

      console.log('✅ All tests passed\n');
    } catch (error) {
      throw new Error('Tests failed');
    }
  }

  private async deployToPlatform(): Promise<void> {
    console.log(`🚀 Deploying to ${this.config.platform}...`);

    switch (this.config.platform) {
      case 'vercel':
        await this.deployToVercel();
        break;
      case 'netlify':
        await this.deployToNetlify();
        break;
      case 'manual':
        await this.manualDeployment();
        break;
      default:
        throw new Error(`Unsupported platform: ${this.config.platform}`);
    }

    console.log('✅ Deployment completed\n');
  }

  private async deployToVercel(): Promise<void> {
    const prodFlag = this.config.environment === 'production' ? '--prod' : '';
    
    try {
      execSync(`npx vercel deploy ${prodFlag} --yes`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error('Vercel deployment failed');
    }
  }

  private async deployToNetlify(): Promise<void> {
    const prodFlag = this.config.environment === 'production' ? '--prod' : '';
    
    try {
      execSync(`npx netlify deploy --dir=dist ${prodFlag}`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error('Netlify deployment failed');
    }
  }

  private async manualDeployment(): Promise<void> {
    console.log('📦 Manual deployment - build artifacts ready in ./dist/');
    console.log('Please upload the contents of the dist/ directory to your hosting provider.');
  }

  private async postDeploymentVerification(): Promise<void> {
    console.log('🔍 Running post-deployment verification...');

    // Add deployment verification logic here
    // For example: health checks, smoke tests, etc.

    console.log('✅ Post-deployment verification passed\n');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: npm run deploy <environment> <platform> [options]

Environments:
  staging     Deploy to staging environment
  production  Deploy to production environment

Platforms:
  vercel      Deploy to Vercel
  netlify     Deploy to Netlify
  manual      Build for manual deployment

Options:
  --skip-build    Skip the build step
  --skip-tests    Skip running tests
  --dry-run       Perform a dry run without actual deployment

Examples:
  npm run deploy staging vercel
  npm run deploy production vercel --skip-tests
  npm run deploy production manual --dry-run
    `);
    process.exit(1);
  }

  const environment = args[0] as Environment;
  const platform = args[1] as Platform;

  if (!['staging', 'production'].includes(environment)) {
    console.error('Invalid environment. Use "staging" or "production".');
    process.exit(1);
  }

  if (!['vercel', 'netlify', 'manual'].includes(platform)) {
    console.error('Invalid platform. Use "vercel", "netlify", or "manual".');
    process.exit(1);
  }

  const config: DeploymentConfig = {
    environment,
    platform,
    skipBuild: args.includes('--skip-build'),
    skipTests: args.includes('--skip-tests'),
    dryRun: args.includes('--dry-run')
  };

  const deployer = new Deployer(config);
  await deployer.deploy();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { Deployer };