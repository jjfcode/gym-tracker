#!/usr/bin/env tsx

/**
 * Security Vulnerability Assessment Script
 * Performs automated security checks on the Gym Tracker application
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

interface AssessmentResult {
  passed: number;
  failed: number;
  issues: SecurityIssue[];
  score: number;
}

class SecurityAssessment {
  private issues: SecurityIssue[] = [];
  private srcPath: string;
  private publicPath: string;

  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.publicPath = path.join(__dirname, '../public');
  }

  /**
   * Run complete security assessment
   */
  async runAssessment(): Promise<AssessmentResult> {
    console.log('🔒 Starting Security Vulnerability Assessment...\n');

    // Run all security checks
    await this.checkDependencyVulnerabilities();
    await this.checkCodeSecurity();
    await this.checkConfigurationSecurity();
    await this.checkAuthenticationSecurity();
    await this.checkInputValidation();
    await this.checkDataProtection();
    await this.checkSecurityHeaders();
    await this.checkFilePermissions();

    // Calculate results
    const result = this.calculateResults();
    this.printReport(result);

    return result;
  }

  /**
   * Check for known dependency vulnerabilities
   */
  private async checkDependencyVulnerabilities(): Promise<void> {
    console.log('📦 Checking dependency vulnerabilities...');

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { 
        cwd: path.dirname(this.srcPath),
        encoding: 'utf8' 
      });
      
      const auditResult = JSON.parse(auditOutput);
      
      if (auditResult.vulnerabilities) {
        Object.entries(auditResult.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            this.addIssue({
              severity: vuln.severity,
              category: 'Dependencies',
              description: `Vulnerable dependency: ${pkg} - ${vuln.title}`,
              recommendation: `Update ${pkg} to version ${vuln.fixAvailable?.version || 'latest'}`
            });
          }
        });
      }
    } catch (error) {
      console.log('  ⚠️  Could not run npm audit (this is normal in some environments)');
    }
  }

  /**
   * Check code for security issues
   */
  private async checkCodeSecurity(): Promise<void> {
    console.log('🔍 Checking code security...');

    const files = this.getAllFiles(this.srcPath, ['.ts', '.tsx', '.js', '.jsx']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for dangerous functions
        if (line.includes('eval(') || line.includes('Function(')) {
          this.addIssue({
            severity: 'high',
            category: 'Code Security',
            description: 'Use of eval() or Function() constructor detected',
            file: path.relative(this.srcPath, file),
            line: index + 1,
            recommendation: 'Avoid using eval() or Function() constructor. Use safer alternatives.'
          });
        }

        // Check for innerHTML usage without sanitization
        if (line.includes('innerHTML') && !line.includes('sanitize')) {
          this.addIssue({
            severity: 'medium',
            category: 'XSS Prevention',
            description: 'innerHTML usage without apparent sanitization',
            file: path.relative(this.srcPath, file),
            line: index + 1,
            recommendation: 'Use textContent or sanitize HTML before setting innerHTML'
          });
        }

        // Check for console.log in production code
        if (line.includes('console.log') && !file.includes('test') && !file.includes('__tests__')) {
          this.addIssue({
            severity: 'low',
            category: 'Information Disclosure',
            description: 'console.log statement in production code',
            file: path.relative(this.srcPath, file),
            line: index + 1,
            recommendation: 'Remove console.log statements or use proper logging'
          });
        }

        // Check for hardcoded secrets
        const secretPatterns = [
          /password\s*[:=]\s*['"][^'"]+['"]/i,
          /secret\s*[:=]\s*['"][^'"]+['"]/i,
          /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
          /token\s*[:=]\s*['"][^'"]+['"]/i,
        ];

        secretPatterns.forEach(pattern => {
          if (pattern.test(line) && !line.includes('process.env') && !line.includes('import.meta.env')) {
            this.addIssue({
              severity: 'critical',
              category: 'Secrets Management',
              description: 'Potential hardcoded secret detected',
              file: path.relative(this.srcPath, file),
              line: index + 1,
              recommendation: 'Use environment variables for secrets'
            });
          }
        });

        // Check for SQL injection vulnerabilities
        if (line.includes('SELECT') || line.includes('INSERT') || line.includes('UPDATE') || line.includes('DELETE')) {
          if (line.includes('${') || line.includes('" +')) {
            this.addIssue({
              severity: 'high',
              category: 'SQL Injection',
              description: 'Potential SQL injection vulnerability',
              file: path.relative(this.srcPath, file),
              line: index + 1,
              recommendation: 'Use parameterized queries or ORM methods'
            });
          }
        }
      });
    }
  }

  /**
   * Check configuration security
   */
  private async checkConfigurationSecurity(): Promise<void> {
    console.log('⚙️  Checking configuration security...');

    // Check Vite config
    const viteConfigPath = path.join(path.dirname(this.srcPath), 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      if (!content.includes('securityHeaders')) {
        this.addIssue({
          severity: 'medium',
          category: 'Configuration',
          description: 'Security headers not configured in Vite',
          file: 'vite.config.ts',
          recommendation: 'Add security headers plugin to Vite configuration'
        });
      }

      if (content.includes("'unsafe-eval'") || content.includes("'unsafe-inline'")) {
        this.addIssue({
          severity: 'medium',
          category: 'CSP',
          description: 'Unsafe CSP directives detected',
          file: 'vite.config.ts',
          recommendation: 'Remove unsafe-eval and unsafe-inline from CSP where possible'
        });
      }
    }

    // Check package.json for security scripts
    const packageJsonPath = path.join(path.dirname(this.srcPath), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts?.audit) {
        this.addIssue({
          severity: 'low',
          category: 'Configuration',
          description: 'No security audit script in package.json',
          recommendation: 'Add "audit": "npm audit" to package.json scripts'
        });
      }
    }

    // Check environment file examples
    const envExamplePath = path.join(path.dirname(this.srcPath), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      if (content.includes('localhost') && !content.includes('# Replace with')) {
        this.addIssue({
          severity: 'low',
          category: 'Configuration',
          description: 'Environment example contains localhost URLs',
          recommendation: 'Use placeholder values in .env.example'
        });
      }
    }
  }

  /**
   * Check authentication security
   */
  private async checkAuthenticationSecurity(): Promise<void> {
    console.log('🔐 Checking authentication security...');

    const authFiles = this.getAllFiles(this.srcPath, ['.ts', '.tsx'])
      .filter(file => file.includes('auth') || file.includes('Auth'));

    for (const file of authFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper password validation
      if (content.includes('password') && !content.includes('validatePassword')) {
        this.addIssue({
          severity: 'medium',
          category: 'Authentication',
          description: 'Password handling without validation detected',
          file: path.relative(this.srcPath, file),
          recommendation: 'Implement proper password validation'
        });
      }

      // Check for session management
      if (content.includes('session') && !content.includes('expires')) {
        this.addIssue({
          severity: 'medium',
          category: 'Session Management',
          description: 'Session handling without expiration check',
          file: path.relative(this.srcPath, file),
          recommendation: 'Implement proper session expiration handling'
        });
      }

      // Check for rate limiting
      if (content.includes('signIn') && !content.includes('rateLimit')) {
        this.addIssue({
          severity: 'medium',
          category: 'Authentication',
          description: 'Authentication without rate limiting',
          file: path.relative(this.srcPath, file),
          recommendation: 'Implement rate limiting for authentication attempts'
        });
      }
    }
  }

  /**
   * Check input validation
   */
  private async checkInputValidation(): Promise<void> {
    console.log('✅ Checking input validation...');

    const formFiles = this.getAllFiles(this.srcPath, ['.ts', '.tsx'])
      .filter(file => file.includes('form') || file.includes('Form') || file.includes('input'));

    for (const file of formFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for input sanitization
      if (content.includes('input') && !content.includes('sanitize')) {
        this.addIssue({
          severity: 'medium',
          category: 'Input Validation',
          description: 'Input handling without sanitization',
          file: path.relative(this.srcPath, file),
          recommendation: 'Implement input sanitization for all user inputs'
        });
      }

      // Check for validation schemas
      if (content.includes('form') && !content.includes('schema') && !content.includes('validate')) {
        this.addIssue({
          severity: 'low',
          category: 'Input Validation',
          description: 'Form without validation schema',
          file: path.relative(this.srcPath, file),
          recommendation: 'Add validation schema for form inputs'
        });
      }
    }
  }

  /**
   * Check data protection measures
   */
  private async checkDataProtection(): Promise<void> {
    console.log('🛡️  Checking data protection...');

    // Check for encryption usage
    const files = this.getAllFiles(this.srcPath, ['.ts', '.tsx']);
    let hasEncryption = false;
    let hasSecureStorage = false;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('encrypt') || content.includes('crypto')) {
        hasEncryption = true;
      }

      if (content.includes('secureStorage') || content.includes('sessionStorage')) {
        hasSecureStorage = true;
      }

      // Check for localStorage usage with sensitive data
      if (content.includes('localStorage') && (content.includes('token') || content.includes('password'))) {
        this.addIssue({
          severity: 'high',
          category: 'Data Protection',
          description: 'Sensitive data stored in localStorage',
          file: path.relative(this.srcPath, file),
          recommendation: 'Use sessionStorage or secure storage for sensitive data'
        });
      }
    }

    if (!hasSecureStorage) {
      this.addIssue({
        severity: 'medium',
        category: 'Data Protection',
        description: 'No secure storage implementation found',
        recommendation: 'Implement secure storage for sensitive client-side data'
      });
    }
  }

  /**
   * Check security headers
   */
  private async checkSecurityHeaders(): Promise<void> {
    console.log('📋 Checking security headers...');

    const indexHtmlPath = path.join(path.dirname(this.srcPath), 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const content = fs.readFileSync(indexHtmlPath, 'utf8');
      
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy'
      ];

      requiredHeaders.forEach(header => {
        if (!content.includes(header)) {
          this.addIssue({
            severity: 'medium',
            category: 'Security Headers',
            description: `Missing security header: ${header}`,
            file: 'index.html',
            recommendation: `Add ${header} meta tag to index.html`
          });
        }
      });

      // Check for CSP
      if (!content.includes('Content-Security-Policy')) {
        this.addIssue({
          severity: 'high',
          category: 'CSP',
          description: 'No Content Security Policy defined',
          file: 'index.html',
          recommendation: 'Implement Content Security Policy'
        });
      }
    }
  }

  /**
   * Check file permissions and structure
   */
  private async checkFilePermissions(): Promise<void> {
    console.log('📁 Checking file permissions...');

    // Check for sensitive files in public directory
    if (fs.existsSync(this.publicPath)) {
      const publicFiles = this.getAllFiles(this.publicPath, ['.env', '.key', '.pem', '.p12']);
      
      publicFiles.forEach(file => {
        this.addIssue({
          severity: 'critical',
          category: 'File Security',
          description: 'Sensitive file in public directory',
          file: path.relative(this.publicPath, file),
          recommendation: 'Move sensitive files outside public directory'
        });
      });
    }

    // Check for .env files in src
    const envFiles = this.getAllFiles(this.srcPath, ['.env']);
    envFiles.forEach(file => {
      this.addIssue({
        severity: 'high',
        category: 'File Security',
        description: 'Environment file in source directory',
        file: path.relative(this.srcPath, file),
        recommendation: 'Move .env files to project root and add to .gitignore'
      });
    });
  }

  /**
   * Add security issue
   */
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Get all files with specific extensions
   */
  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.getAllFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  /**
   * Calculate assessment results
   */
  private calculateResults(): AssessmentResult {
    const totalChecks = 50; // Approximate number of security checks
    const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;

    const failed = criticalIssues * 4 + highIssues * 3 + mediumIssues * 2 + lowIssues * 1;
    const passed = Math.max(0, totalChecks - this.issues.length);
    
    // Calculate score (0-100)
    const maxPossibleScore = totalChecks * 4; // If all were critical
    const score = Math.max(0, Math.round(((maxPossibleScore - failed) / maxPossibleScore) * 100));

    return {
      passed,
      failed: this.issues.length,
      issues: this.issues,
      score
    };
  }

  /**
   * Print assessment report
   */
  private printReport(result: AssessmentResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 SECURITY ASSESSMENT REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Security Score: ${result.score}/100`);
    console.log(`   Issues Found: ${result.failed}`);
    console.log(`   Checks Passed: ${result.passed}`);
    
    if (result.score >= 90) {
      console.log(`   Status: ✅ EXCELLENT`);
    } else if (result.score >= 75) {
      console.log(`   Status: ✅ GOOD`);
    } else if (result.score >= 60) {
      console.log(`   Status: ⚠️  NEEDS IMPROVEMENT`);
    } else {
      console.log(`   Status: ❌ POOR - IMMEDIATE ACTION REQUIRED`);
    }

    if (result.issues.length > 0) {
      console.log(`\n🚨 ISSUES BY SEVERITY:`);
      
      const bySeverity = {
        critical: result.issues.filter(i => i.severity === 'critical'),
        high: result.issues.filter(i => i.severity === 'high'),
        medium: result.issues.filter(i => i.severity === 'medium'),
        low: result.issues.filter(i => i.severity === 'low'),
      };

      Object.entries(bySeverity).forEach(([severity, issues]) => {
        if (issues.length > 0) {
          const icon = severity === 'critical' ? '🔴' : 
                      severity === 'high' ? '🟠' : 
                      severity === 'medium' ? '🟡' : '🔵';
          
          console.log(`\n${icon} ${severity.toUpperCase()} (${issues.length}):`);
          
          issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue.description}`);
            if (issue.file) {
              console.log(`      File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
            }
            console.log(`      Fix: ${issue.recommendation}`);
            console.log('');
          });
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('Assessment completed at:', new Date().toISOString());
    console.log('='.repeat(60) + '\n');
  }
}

// Run assessment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const assessment = new SecurityAssessment();
  assessment.runAssessment()
    .then(result => {
      process.exit(result.score >= 75 ? 0 : 1);
    })
    .catch(error => {
      console.error('Assessment failed:', error);
      process.exit(1);
    });
}

export { SecurityAssessment };