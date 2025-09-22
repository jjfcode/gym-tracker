#!/usr/bin/env tsx

/**
 * Cross-browser and cross-device testing script
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

interface TestConfig {
  browsers: string[];
  devices: string[];
  testSuites: string[];
  parallel?: boolean;
  headless?: boolean;
}

interface TestResult {
  browser: string;
  device?: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors?: string[];
}

class CrossBrowserTester {
  private config: TestConfig;
  private results: TestResult[] = [];

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runAllTests(): Promise<void> {
    console.log('🌐 Starting cross-browser testing...\n');

    try {
      // Install browsers if needed
      await this.installBrowsers();

      // Run tests for each browser/device combination
      for (const browser of this.config.browsers) {
        for (const suite of this.config.testSuites) {
          if (this.config.devices.length > 0) {
            for (const device of this.config.devices) {
              await this.runTest(browser, suite, device);
            }
          } else {
            await this.runTest(browser, suite);
          }
        }
      }

      // Generate test report
      await this.generateReport();

      // Check if all tests passed
      const failedTests = this.results.filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        console.error(`\n❌ ${failedTests.length} tests failed`);
        process.exit(1);
      } else {
        console.log(`\n✅ All ${this.results.length} tests passed!`);
      }

    } catch (error) {
      console.error('Cross-browser testing failed:', error);
      process.exit(1);
    }
  }

  private async installBrowsers(): Promise<void> {
    console.log('📦 Installing browsers...');
    
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      console.log('✅ Browsers installed\n');
    } catch (error) {
      throw new Error('Failed to install browsers');
    }
  }

  private async runTest(browser: string, suite: string, device?: string): Promise<void> {
    const testName = device ? `${browser} (${device}) - ${suite}` : `${browser} - ${suite}`;
    console.log(`🧪 Running: ${testName}`);

    const startTime = Date.now();
    let result: TestResult;

    try {
      // Build Playwright command
      let command = `npx playwright test --project=${browser}`;
      
      if (suite !== 'all') {
        command += ` --grep="${suite}"`;
      }
      
      if (this.config.headless) {
        command += ' --headed=false';
      }

      if (device) {
        // Add device emulation if supported
        command += ` --config=playwright.config.${device}.ts`;
      }

      execSync(command, { stdio: 'pipe' });

      result = {
        browser,
        device,
        suite,
        status: 'passed',
        duration: Date.now() - startTime
      };

      console.log(`   ✅ Passed (${result.duration}ms)`);

    } catch (error) {
      result = {
        browser,
        device,
        suite,
        status: 'failed',
        duration: Date.now() - startTime,
        errors: [error.toString()]
      };

      console.log(`   ❌ Failed (${result.duration}ms)`);
    }

    this.results.push(result);
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Generating test report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        skipped: this.results.filter(r => r.status === 'skipped').length,
      },
      results: this.results,
      config: this.config
    };

    // Write JSON report
    writeFileSync('test-results/cross-browser-report.json', JSON.stringify(report, null, 2));

    // Write HTML report
    const htmlReport = this.generateHtmlReport(report);
    writeFileSync('test-results/cross-browser-report.html', htmlReport);

    console.log('✅ Test report generated in test-results/');
  }

  private generateHtmlReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cross-Browser Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .status-passed { background-color: #d4edda; }
        .status-failed { background-color: #f8d7da; }
        .status-skipped { background-color: #fff3cd; }
    </style>
</head>
<body>
    <h1>Cross-Browser Test Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${report.summary.total}</p>
        <p class="passed"><strong>Passed:</strong> ${report.summary.passed}</p>
        <p class="failed"><strong>Failed:</strong> ${report.summary.failed}</p>
        <p class="skipped"><strong>Skipped:</strong> ${report.summary.skipped}</p>
    </div>

    <h2>Test Results</h2>
    <table>
        <thead>
            <tr>
                <th>Browser</th>
                <th>Device</th>
                <th>Test Suite</th>
                <th>Status</th>
                <th>Duration (ms)</th>
                <th>Errors</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map((result: TestResult) => `
                <tr class="status-${result.status}">
                    <td>${result.browser}</td>
                    <td>${result.device || '-'}</td>
                    <td>${result.suite}</td>
                    <td>${result.status}</td>
                    <td>${result.duration}</td>
                    <td>${result.errors ? result.errors.join('<br>') : '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;
  }
}

// Predefined test configurations
const TEST_CONFIGS = {
  basic: {
    browsers: ['chromium', 'firefox', 'webkit'],
    devices: [],
    testSuites: ['auth', 'dashboard', 'workouts'],
    headless: true
  },
  comprehensive: {
    browsers: ['chromium', 'firefox', 'webkit'],
    devices: ['mobile', 'tablet'],
    testSuites: ['auth', 'dashboard', 'workouts', 'progress', 'settings'],
    headless: true
  },
  mobile: {
    browsers: ['chromium'],
    devices: ['iPhone 12', 'Pixel 5', 'iPad'],
    testSuites: ['all'],
    headless: true
  }
};

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const configName = args[0] || 'basic';
  
  if (!TEST_CONFIGS[configName as keyof typeof TEST_CONFIGS]) {
    console.log(`
Available test configurations:
  basic         - Basic cross-browser testing (Chrome, Firefox, Safari)
  comprehensive - Full cross-browser and device testing
  mobile        - Mobile device testing

Usage: npm run test:cross-browser [config]
Example: npm run test:cross-browser comprehensive
    `);
    process.exit(1);
  }

  const config = TEST_CONFIGS[configName as keyof typeof TEST_CONFIGS];
  const tester = new CrossBrowserTester(config);
  
  await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CrossBrowserTester };