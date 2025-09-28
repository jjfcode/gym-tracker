/**
 * MCP Interactive Dashboard
 * Real-time monitoring of user interactions, performance, and app state
 */

interface UserAction {
  id: string;
  type: 'click' | 'form_submit' | 'navigation' | 'api_call' | 'error';
  timestamp: number;
  component: string;
  details: Record<string, any>;
  userId?: string;
  sessionId: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface DatabaseQuery {
  id: string;
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  rowCount?: number;
}

class MCPDashboard {
  private userActions: UserAction[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private databaseQueries: DatabaseQuery[] = [];
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalListeners();
    this.initializeDashboard();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 🎯 Real-time User Action Tracking
  trackUserAction(action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>) {
    const fullAction: UserAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.userActions.push(fullAction);
    this.logToConsole('👤 User Action', fullAction);
    this.updateDashboard();

    // Alert on critical actions
    if (action.type === 'error') {
      this.highlightError(fullAction);
    }
  }

  // 📊 Performance Monitoring
  trackPerformance(name: string, value: number, threshold: number = 1000) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      threshold,
      status: value > threshold ? 'critical' : value > threshold * 0.7 ? 'warning' : 'good'
    };

    this.performanceMetrics.push(metric);
    this.logToConsole('⚡ Performance', metric);
    this.updateDashboard();
  }

  // 🗄️ Database Query Monitoring
  trackDatabaseQuery(query: Omit<DatabaseQuery, 'id' | 'timestamp'>) {
    const fullQuery: DatabaseQuery = {
      ...query,
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now()
    };

    this.databaseQueries.push(fullQuery);
    this.logToConsole('🗄️ Database Query', fullQuery);
    this.updateDashboard();

    // Alert on slow queries
    if (fullQuery.duration > 2000) {
      console.warn('🐌 Slow Query Detected:', fullQuery);
    }
  }

  // 🎨 Visual Dashboard Creation
  private initializeDashboard() {
    // Create floating dashboard
    const dashboard = document.createElement('div');
    dashboard.id = 'mcp-dashboard';
    dashboard.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 12px;
        padding: 16px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-height: 80vh;
        overflow-y: auto;
        transition: all 0.3s ease;
      ">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #00ff88;">🚀 MCP Dashboard</h3>
          <button id="mcp-dashboard-toggle" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
          ">−</button>
        </div>
        
        <div id="mcp-dashboard-content">
          <div id="mcp-stats" style="margin-bottom: 16px;">
            <div style="color: #ffa500;">📊 Session: ${this.sessionId.substr(-8)}</div>
            <div id="action-count">👤 Actions: 0</div>
            <div id="performance-count">⚡ Metrics: 0</div>
            <div id="query-count">🗄️ Queries: 0</div>
          </div>
          
          <div id="mcp-recent-actions" style="margin-bottom: 16px;">
            <h4 style="margin: 8px 0; color: #00bfff;">Recent Actions</h4>
            <div id="actions-list" style="max-height: 200px; overflow-y: auto;"></div>
          </div>
          
          <div id="mcp-performance-alerts">
            <h4 style="margin: 8px 0; color: #ff6b6b;">Performance Alerts</h4>
            <div id="alerts-list" style="max-height: 150px; overflow-y: auto;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dashboard);

    // Toggle functionality
    const toggleBtn = document.getElementById('mcp-dashboard-toggle')!;
    const content = document.getElementById('mcp-dashboard-content')!;
    let collapsed = false;

    toggleBtn.addEventListener('click', () => {
      collapsed = !collapsed;
      content.style.display = collapsed ? 'none' : 'block';
      toggleBtn.textContent = collapsed ? '+' : '−';
    });
  }

  private updateDashboard() {
    // Update counts
    document.getElementById('action-count')!.textContent = `👤 Actions: ${this.userActions.length}`;
    document.getElementById('performance-count')!.textContent = `⚡ Metrics: ${this.performanceMetrics.length}`;
    document.getElementById('query-count')!.textContent = `🗄️ Queries: ${this.databaseQueries.length}`;

    // Update recent actions (last 5)
    const actionsList = document.getElementById('actions-list')!;
    const recentActions = this.userActions.slice(-5).reverse();
    actionsList.innerHTML = recentActions.map(action => `
      <div style="
        padding: 8px;
        margin: 4px 0;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        border-left: 3px solid ${this.getActionColor(action.type)};
      ">
        <div style="display: flex; justify-content: space-between;">
          <span>${this.getActionIcon(action.type)} ${action.component}</span>
          <span style="color: #888;">${new Date(action.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="font-size: 11px; color: #ccc; margin-top: 4px;">
          ${action.type} - ${Object.keys(action.details).length} details
        </div>
      </div>
    `).join('');

    // Update performance alerts
    const alertsList = document.getElementById('alerts-list')!;
    const criticalMetrics = this.performanceMetrics.filter(m => m.status === 'critical').slice(-3);
    alertsList.innerHTML = criticalMetrics.map(metric => `
      <div style="
        padding: 8px;
        margin: 4px 0;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 4px;
        border-left: 3px solid #ff6b6b;
      ">
        <div>${metric.name}: ${metric.value}ms</div>
        <div style="font-size: 11px; color: #ff6b6b;">
          Exceeded threshold: ${metric.threshold}ms
        </div>
      </div>
    `).join('');
  }

  private getActionColor(type: UserAction['type']): string {
    const colors = {
      click: '#00bfff',
      form_submit: '#00ff88',
      navigation: '#ffa500',
      api_call: '#9966ff',
      error: '#ff6b6b'
    };
    return colors[type] || '#666';
  }

  private getActionIcon(type: UserAction['type']): string {
    const icons = {
      click: '🖱️',
      form_submit: '📝',
      navigation: '🧭',
      api_call: '🔄',
      error: '❌'
    };
    return icons[type] || '📋';
  }

  private highlightError(action: UserAction) {
    console.group('🚨 ERROR DETECTED');
    console.error('Component:', action.component);
    console.error('Details:', action.details);
    console.error('Timestamp:', new Date(action.timestamp).toISOString());
    console.trace('Stack trace');
    console.groupEnd();
  }

  private logToConsole(category: string, data: any) {
    console.groupCollapsed(`${category} - ${new Date().toLocaleTimeString()}`);
    console.table(data);
    console.groupEnd();
  }

  private setupGlobalListeners() {
    // Track all clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const component = target.closest('[data-component]')?.getAttribute('data-component') || 
                      target.tagName.toLowerCase();
      
      this.trackUserAction({
        type: 'click',
        component,
        details: {
          tagName: target.tagName,
          className: target.className,
          textContent: target.textContent?.substring(0, 50) || '',
          position: { x: event.clientX, y: event.clientY }
        }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        data[key] = typeof value === 'string' ? value.substring(0, 100) : '[File]';
      }

      this.trackUserAction({
        type: 'form_submit',
        component: form.getAttribute('data-component') || 'form',
        details: { formData: data, action: form.action }
      });
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackUserAction({
        type: 'navigation',
        component: 'browser',
        details: { url: window.location.href, type: 'popstate' }
      });
    });
  }

  // 🎯 Public API for components to use
  public api = {
    trackClick: (component: string, details: Record<string, any> = {}) => {
      this.trackUserAction({ type: 'click', component, details });
    },
    
    trackFormSubmit: (component: string, details: Record<string, any> = {}) => {
      this.trackUserAction({ type: 'form_submit', component, details });
    },
    
    trackNavigation: (component: string, details: Record<string, any> = {}) => {
      this.trackUserAction({ type: 'navigation', component, details });
    },
    
    trackError: (component: string, error: Error, context: Record<string, any> = {}) => {
      this.trackUserAction({
        type: 'error',
        component,
        details: {
          message: error.message,
          stack: error.stack,
          ...context
        }
      });
    },
    
    trackPerformance: (name: string, startTime: number, endTime?: number) => {
      const duration = endTime ? endTime - startTime : performance.now() - startTime;
      this.trackPerformance(name, duration);
    },
    
    trackQuery: (query: Omit<DatabaseQuery, 'id' | 'timestamp'>) => {
      this.trackDatabaseQuery(query);
    }
  };

  // 📋 Export data for analysis
  exportData() {
    return {
      sessionId: this.sessionId,
      userActions: this.userActions,
      performanceMetrics: this.performanceMetrics,
      databaseQueries: this.databaseQueries,
      exportTime: new Date().toISOString()
    };
  }
}

// Initialize global MCP dashboard
const mcpDashboard = new MCPDashboard();

// Export to global scope
declare global {
  interface Window {
    mcpDashboard: MCPDashboard;
  }
}

window.mcpDashboard = mcpDashboard;

export { MCPDashboard, mcpDashboard };
export type { UserAction, PerformanceMetric, DatabaseQuery };