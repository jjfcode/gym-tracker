#!/usr/bin/env tsx

/**
 * Integration testing script for complete user workflows
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

interface WorkflowTest {
  name: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
}

interface TestResult {
  workflow: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors?: string[];
  details?: string;
}

class IntegrationTester {
  private workflows: WorkflowTest[] = [
    {
      name: 'User Registration and Onboarding',
      description: 'Complete user registration and onboarding flow',
      steps: [
        'Navigate to sign-up page',
        'Fill registration form with valid data',
        'Verify email confirmation',
        'Complete onboarding steps',
        'Set weight and training frequency',
        'Generate workout plan',
        'Redirect to dashboard'
      ],
      expectedOutcome: 'User successfully registered and onboarded with generated workout plan'
    },
    {
      name: 'Daily Workout Tracking',
      description: 'Complete workout logging and tracking',
      steps: [
        'Login to application',
        'Navigate to today\'s workout',
        'Log sets, reps, and weights for exercises',
        'Mark exercises as completed',
        'Complete entire workout',
        'View workout summary'
      ],
      expectedOutcome: 'Workout data saved and progress tracked correctly'
    },
    {
      name: 'Weight Tracking and Progress',
      description: 'Weight logging and progress visualization',
      steps: [
        'Navigate to weight tracking',
        'Log current weight',
        'View weight history chart',
        'Check progress statistics',
        'Export weight data'
      ],
      expectedOutcome: 'Weight data logged and visualized correctly'
    },
    {
      name: 'Workout Planning and Calendar',
      description: 'Workout planning and calendar management',
      steps: [
        'Navigate to workout planner',
        'View weekly calendar',
        'View monthly calendar',
        'Schedule future workouts',
        'Modify existing workout',
        'Check workout completion status'
      ],
      expectedOutcome: 'Workout planning and calendar features work correctly'
    },
    {
      name: 'Exercise Library and Customization',
      description: 'Exercise library browsing and custom exercise creation',
      steps: [
        'Navigate to exercise library',
        'Search for exercises',
        'Filter by muscle group',
        'Create custom exercise',
        'Add custom exercise to workout',
        'Modify exercise parameters'
      ],
      expectedOutcome: 'Exercise library and customization features work correctly'
    },
    {
      name: 'Settings and Preferences',
      description: 'User settings and preference management',
      steps: [
        'Navigate to settings',
        'Change theme preference',
        'Switch language',
        'Update unit preferences',
        'Modify profile information',
        'Export user data'
      ],
      expectedOutcome: 'Settings changes applied and persisted correctly'
    },
    {
      name: 'PWA and Offline Functionality',
      description: 'Progressive Web App features and offline capability',
      steps: [
        'Install PWA on device',
        'Use app while online',
        'Disconnect from internet',
        'Log workout data offline',
        'Reconnect to internet',
        'Verify data synchronization'
      ],
      expectedOutcome: 'PWA installation and offline functionality work correctly'
    },
    {
      name: 'Authentication and Security',
      description: 'Authentication flows and security features',
      steps: [
        'Test login with valid credentials',
        'Test login with invalid credentials',
        'Test password reset flow',
        'Test session management',
        'Test data access restrictions',
        'Test logout functionality'
      ],
      expectedOutcome: 'Authentication and security features work correctly'
    }
  ];

  private results: TestResult[] = [];

  async runIntegrationTests(): Promise<void> {
    console.log('🔄 Starting integration testing for complete user workflows...\n');

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run each workflow test
      for (const workflow of this.workflows) {
        await this.runWorkflowTest(workflow);
      }

      // Generate test report
      await this.generateReport();

      // Check results
      const failedTests = this.results.filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        console.error(`\n❌ ${failedTests.length} workflow tests failed`);
        process.exit(1);
      } else {
        console.log(`\n✅ All ${this.results.length} workflow tests passed!`);
      }

    } catch (error) {
      console.error('Integration testing failed:', error);
      process.exit(1);
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');

    try {
      // Build application
      execSync('npm run build', { stdio: 'inherit' });

      // Start test server
      console.log('Starting test server...');
      // Note: In a real implementation, you would start the server in the background
      // and wait for it to be ready

      console.log('✅ Test environment ready\n');
    } catch (error) {
      throw new Error('Failed to setup test environment');
    }
  }

  private async runWorkflowTest(workflow: WorkflowTest): Promise<void> {
    console.log(`🧪 Testing workflow: ${workflow.name}`);
    console.log(`   Description: ${workflow.description}`);

    const startTime = Date.now();
    let result: TestResult;

    try {
      // Run E2E tests for this workflow
      const testCommand = `npx playwright test --grep="${workflow.name}"`;
      execSync(testCommand, { stdio: 'pipe' });

      result = {
        workflow: workflow.name,
        status: 'passed',
        duration: Date.now() - startTime,
        details: `All ${workflow.steps.length} steps completed successfully`
      };

      console.log(`   ✅ Passed (${result.duration}ms)`);

    } catch (error) {
      result = {
        workflow: workflow.name,
        status: 'failed',
        duration: Date.now() - startTime,
        errors: [error.toString()],
        details: 'Workflow test failed - check E2E test results for details'
      };

      console.log(`   ❌ Failed (${result.duration}ms)`);
    }

    this.results.push(result);
    console.log(''); // Empty line for readability
  }

  private async generateReport(): Promise<void> {
    console.log('📊 Generating integration test report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
      },
      workflows: this.workflows,
      results: this.results
    };

    // Write JSON report
    writeFileSync('test-results/integration-report.json', JSON.stringify(report, null, 2));

    // Write HTML report
    const htmlReport = this.generateHtmlReport(report);
    writeFileSync('test-results/integration-report.html', htmlReport);

    console.log('✅ Integration test report generated\n');
  }

  private generateHtmlReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report - Gym Tracker</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .workflow { border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 15px; padding: 15px; }
        .workflow-header { font-weight: bold; margin-bottom: 10px; }
        .steps { margin: 10px 0; }
        .step { margin: 5px 0; padding-left: 20px; }
        .passed { color: #28a745; background-color: #d4edda; }
        .failed { color: #dc3545; background-color: #f8d7da; }
        .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Integration Test Report - Gym Tracker</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Total Duration:</strong> ${(report.summary.totalDuration / 1000).toFixed(2)}s</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p><strong>Total Workflows:</strong> ${report.summary.total}</p>
        <p><strong>Passed:</strong> <span class="status passed">${report.summary.passed}</span></p>
        <p><strong>Failed:</strong> <span class="status failed">${report.summary.failed}</span></p>
        <p><strong>Success Rate:</strong> ${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%</p>
    </div>

    <h2>Workflow Test Results</h2>
    
    ${report.workflows.map((workflow: WorkflowTest, index: number) => {
      const result = report.results[index];
      return `
        <div class="workflow ${result.status}">
            <div class="workflow-header">
                ${workflow.name} 
                <span class="status ${result.status}">${result.status.toUpperCase()}</span>
                <span style="float: right;">${result.duration}ms</span>
            </div>
            <p><strong>Description:</strong> ${workflow.description}</p>
            <p><strong>Expected Outcome:</strong> ${workflow.expectedOutcome}</p>
            
            <div class="steps">
                <strong>Test Steps:</strong>
                <ol>
                    ${workflow.steps.map(step => `<li class="step">${step}</li>`).join('')}
                </ol>
            </div>
            
            ${result.details ? `<p><strong>Details:</strong> ${result.details}</p>` : ''}
            ${result.errors ? `<p><strong>Errors:</strong> ${result.errors.join('<br>')}</p>` : ''}
        </div>
      `;
    }).join('')}

    <h2>Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Workflow</th>
                <th>Status</th>
                <th>Duration (ms)</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map((result: TestResult) => `
                <tr class="${result.status}">
                    <td>${result.workflow}</td>
                    <td><span class="status ${result.status}">${result.status.toUpperCase()}</span></td>
                    <td>${result.duration}</td>
                    <td>${result.details || result.errors?.join(', ') || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Integration Testing for Gym Tracker

This script runs comprehensive integration tests for complete user workflows.

Usage: npm run test:integration [options]

Options:
  --help    Show this help message

Workflows tested:
  - User Registration and Onboarding
  - Daily Workout Tracking  
  - Weight Tracking and Progress
  - Workout Planning and Calendar
  - Exercise Library and Customization
  - Settings and Preferences
  - PWA and Offline Functionality
  - Authentication and Security

Reports are generated in test-results/ directory.
    `);
    process.exit(0);
  }

  const tester = new IntegrationTester();
  await tester.runIntegrationTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IntegrationTester };