/**
 * Application configuration with environment variable validation
 */

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
  features: {
    devtools: boolean;
    debug: boolean;
  };
  analytics?: {
    id?: string;
  };
  sentry?: {
    dsn?: string;
  };
}

class ConfigValidator {
  private static validateRequired(value: string | undefined, name: string): string {
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }

  private static validateUrl(value: string, name: string): string {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error(`Invalid URL format for ${name}: ${value}`);
    }
  }

  static validate(): AppConfig {
    // Required variables
    const supabaseUrl = this.validateRequired(
      import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_URL'
    );
    
    const supabaseAnonKey = this.validateRequired(
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      'VITE_SUPABASE_ANON_KEY'
    );

    // Validate Supabase URL format
    this.validateUrl(supabaseUrl, 'VITE_SUPABASE_URL');

    // Optional variables with defaults
    const appName = import.meta.env.VITE_APP_NAME || 'Gym Tracker';
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    const appEnv = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development') as AppConfig['app']['environment'];

    // Feature flags
    const enableDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' || import.meta.env.DEV;
    const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV;

    // Optional analytics and monitoring
    const analyticsId = import.meta.env.VITE_ANALYTICS_ID;
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    return {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      },
      app: {
        name: appName,
        version: appVersion,
        environment: appEnv,
      },
      features: {
        devtools: enableDevtools,
        debug: enableDebug,
      },
      ...(analyticsId && { analytics: { id: analyticsId } }),
      ...(sentryDsn && { sentry: { dsn: sentryDsn } }),
    };
  }
}

// Validate configuration on module load
let config: AppConfig;

try {
  config = ConfigValidator.validate();
  
  // Log configuration in development
  if (config.features.debug) {
    console.log('🔧 App Configuration:', {
      ...config,
      supabase: {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey.substring(0, 10) + '...',
      },
    });
  }
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  throw error;
}

export { config };
export type { AppConfig };