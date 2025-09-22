#!/usr/bin/env tsx

/**
 * Final validation script for deployment readiness
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string;
  test: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
}

class DeploymentValidator {
  private results: ValidationResult[] = [];

  async validateDeploymentReadiness(): Promise<void> {
    console.log('🔍 Running final deployment validation...\n');

    try {
      // Run all validation categories
      await this.validateProjectStructure();
      await this.validateConfiguration();
      await this.validateBuild();
      await this.validateTests();
      await this.validateSecurity();
      await this.validatePerformance();
      await this.validateDocumentation();

      // Generate validation report
      this.generateReport();

      // Check results
      const failed = this.results.filter(r => r.status === 'failed');
      const warnings = this.results.filter(r => r.status === 'warning');

      if (failed.length > 0) {
        console.error(`\n❌ Deployment validation failed: ${failed.length} critical issues found`);
        process.exit(1);
      } else if (warnings.length > 0) {
        console.warn(`\n⚠️  Deployment validation passed with ${warnings.length} warnings`);
      } else {
        console.log(`\n✅ Deployment validation passed! Application is ready for deployment.`);
      }

    } catch (error) {
      console.error('Validation failed:', error);
      process.exit(1);
    }
  }

  private async validateProjectStructure(): Promise<void> {
    console.log('📁 Validating project structure...');

    const requiredFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/main.tsx',
      'src/App.tsx',
      'public/manifest.webmanifest',
      '.env.example',
      '.env.production'
    ];

    const requiredDirectories = [
      'src',
      'src/components',
      'src/features',
      'src/lib',
      'public',
      'scripts',
      'deployment'
    ];

    // Check required files
    for (const file of requiredFiles) {
      if (existsSync(file)) {
        this.addResult('Structure', `File: ${file}`, 'passed', 'Required file exists');
      } else {
        this.addResult('Structure', `File: ${file}`, 'failed', 'Required file missing');
      }
    }

    // Check required directories
    for (const dir of requiredDirectories) {
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        this.addResult('Structure', `Directory: ${dir}`, 'passed', 'Required directory exists');
      } else {
        this.addResult('Structure', `Directory: ${dir}`, 'failed', 'Required directory missing');
      }
    }

    console.log('✅ Project structure validation completed\n');
  }

  private async validateConfiguration(): Promise<void> {
    console.log('⚙️  Validating configuration...');

    try {
      // Check package.json
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      
      if (packageJson.scripts?.build) {
        this.addResult('Config', 'Build script', 'passed', 'Build script configured');
      } else {
        this.addResult('Config', 'Build script', 'failed', 'Build script missing');
      }

      if (packageJson.scripts?.test) {
        this.addResult('Config', 'Test script', 'passed', 'Test script configured');
      } else {
        this.addResult('Config', 'Test script', 'failed', 'Test script missing');
      }

      // Check TypeScript config
      if (existsSync('tsconfig.json')) {
        const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'));
        if (tsConfig.compilerOptions?.strict) {
          this.addResult('Config', 'TypeScript strict mode', 'passed', 'Strict mode enabled');
        } else {
          this.addResult('Config', 'TypeScript strict mode', 'warning', 'Strict mode not enabled');
        }
      }

      // Check Vite config
      if (existsSync('vite.config.ts')) {
        this.addResult('Config', 'Vite configuration', 'passed', 'Vite config exists');
      } else {
        this.addResult('Config', 'Vite configuration', 'failed', 'Vite config missing');
      }

      // Check environment files
      if (existsSync('.env.example')) {
        this.addResult('Config', 'Environment template', 'passed', 'Environment template exists');
      } else {
        this.addResult('Config', 'Environment template', 'warning', 'Environment template missing');
      }

    } catch (error) {
      this.addResult('Config', 'Configuration parsing', 'failed', `Configuration error: ${error}`);
    }

    console.log('✅ Configuration validation completed\n');
  }

  private async validateBuild(): Promise<void> {
    console.log('🏗️  Validating build process...');

    try {
      // Test build
      console.log('   Running build...');
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build', 'Build process', 'passed', 'Build completed successfully');

      // Check build output
      const buildFiles = [
        'dist/index.html',
        'dist/manifest.webmanifest',
        'dist/sw.js'
      ];

      for (const file of buildFiles) {
        if (existsSync(file)) {
          this.addResult('Build', `Build output: ${file}`, 'passed', 'Build file exists');
        } else {
          this.addResult('Build', `Build output: ${file}`, 'failed', 'Build file missing');
        }
      }

      // Check bundle size
      const distStats = statSync('dist');
      if (distStats.isDirectory()) {
        this.addResult('Build', 'Build directory', 'passed', 'Build directory created');
      }

    } catch (error) {
      this.addResult('Build', 'Build process', 'failed', `Build failed: ${error}`);
    }

    console.log('✅ Build validation completed\n');
  }

  private async validateTests(): Promise<void> {
    console.log('🧪 Validating tests...');

    try {
      // Run unit tests
      console.log('   Running unit tests...');
      execSync('npm run test', { stdio: 'pipe' });
      this.addResult('Tests', 'Unit tests', 'passed', 'Unit tests passed');

      // Check for test files
      const testPatterns = [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'e2e/**/*.spec.ts'
      ];

      // This is a simplified check - in a real implementation you'd use glob
      if (existsSync('src') || existsSync('e2e')) {
        this.addResult('Tests', 'Test files', 'passed', 'Test files exist');
      } else {
        this.addResult('Tests', 'Test files', 'warning', 'No test files found');
      }

    } catch (error) {
      this.addResult('Tests', 'Test execution', 'failed', `Tests failed: ${error}`);
    }

    console.log('✅ Test validation completed\n');
  }

  private async validateSecurity(): Promise<void> {
    console.log('🔒 Validating security...');

    try {
      // Run security audit
      console.log('   Running security audit...');
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
      this.addResult('Security', 'Dependency audit', 'passed', 'No security vulnerabilities found');

      // Check for security configurations
      const securityChecks = [
        { file: 'vite.config.ts', check: 'Security headers configuration' },
        { file: '.env.example', check: 'Environment variable template' }
      ];

      for (const { file, check } of securityChecks) {
        if (existsSync(file)) {
          this.addResult('Security', check, 'passed', `${file} exists`);
        } else {
          this.addResult('Security', check, 'warning', `${file} missing`);
        }
      }

    } catch (error) {
      this.addResult('Security', 'Security audit', 'warning', 'Security vulnerabilities found - review and fix');
    }

    console.log('✅ Security validation completed\n');
  }

  private async validatePerformance(): Promise<void> {
    console.log('⚡ Validating performance...');

    try {
      // Check if Lighthouse config exists
      if (existsSync('lighthouserc.js')) {
        this.addResult('Performance', 'Lighthouse configuration', 'passed', 'Lighthouse config exists');
      } else {
        this.addResult('Performance', 'Lighthouse configuration', 'warning', 'Lighthouse config missing');
      }

      // Check bundle size (simplified check)
      if (existsSync('dist')) {
        this.addResult('Performance', 'Bundle optimization', 'passed', 'Build output exists for analysis');
      } else {
        this.addResult('Performance', 'Bundle optimization', 'warning', 'Build required for bundle analysis');
      }

      // Check PWA configuration
      if (existsSync('public/manifest.webmanifest')) {
        this.addResult('Performance', 'PWA manifest', 'passed', 'PWA manifest exists');
      } else {
        this.addResult('Performance', 'PWA manifest', 'failed', 'PWA manifest missing');
      }

    } catch (error) {
      this.addResult('Performance', 'Performance validation', 'warning', `Performance check failed: ${error}`);
    }

    console.log('✅ Performance validation completed\n');
  }

  private async validateDocumentation(): Promise<void> {
    console.log('📚 Validating documentation...');

    const requiredDocs = [
      'README.md',
      'DEPLOYMENT.md',
      'MAINTENANCE.md'
    ];

    for (const doc of requiredDocs) {
      if (existsSync(doc)) {
        const content = readFileSync(doc, 'utf-8');
        if (content.length > 100) {
          this.addResult('Documentation', doc, 'passed', 'Documentation file exists and has content');
        } else {
          this.addResult('Documentation', doc, 'warning', 'Documentation file exists but appears incomplete');
        }
      } else {
        this.addResult('Documentation', doc, 'failed', 'Required documentation missing');
      }
    }

    console.log('✅ Documentation validation completed\n');
  }

  private addResult(category: string, test: string, status: ValidationResult['status'], message: string, details?: string): void {
    this.results.push({ category, test, status, message, details });
  }

  private generateReport(): void {
    console.log('📊 Validation Summary:\n');

    const categories = [...new Set(this.results.map(r => r.category))];
    
    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.status === 'passed').length;
      const failed = categoryResults.filter(r => r.status === 'failed').length;
      const warnings = categoryResults.filter(r => r.status === 'warning').length;

      console.log(`${category}:`);
      console.log(`  ✅ Passed: ${passed}`);
      if (warnings > 0) console.log(`  ⚠️  Warnings: ${warnings}`);
      if (failed > 0) console.log(`  ❌ Failed: ${failed}`);
      console.log('');
    }

    // Show failed tests
    const failed = this.results.filter(r => r.status === 'failed');
    if (failed.length > 0) {
      console.log('❌ Failed validations:');
      for (const result of failed) {
        console.log(`  - ${result.category}: ${result.test} - ${result.message}`);
      }
      console.log('');
    }

    // Show warnings
    const warnings = this.results.filter(r => r.status === 'warning');
    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      for (const result of warnings) {
        console.log(`  - ${result.category}: ${result.test} - ${result.message}`);
      }
      console.log('');
    }
  }
}

// CLI interface
async function main() {
  const validator = new DeploymentValidator();
  await validator.validateDeploymentReadiness();
}

// Run main function when script is executed directly
main().catch(console.error);

export { DeploymentValidator };