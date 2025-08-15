import { ServiceConfig, Language, Direction } from '../types';

class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  getServiceConfig(): ServiceConfig {
    return {
      apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://localhost:5001',
      signalRHubUrl: process.env.REACT_APP_SIGNALR_HUB_URL || 'https://localhost:5001/JobSignalRHub',
      useMockData: process.env.REACT_APP_USE_MOCK_DATA !== 'false'
    };
  }

  getDefaultLanguage(): Language {
    const lang = process.env.REACT_APP_DEFAULT_LANGUAGE;
    return (lang === 'en' || lang === 'he') ? lang : 'en';
  }

  getDefaultDirection(): Direction {
    const dir = process.env.REACT_APP_DEFAULT_DIRECTION;
    return (dir === 'ltr' || dir === 'rtl') ? dir : 'ltr';
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}

export const configService = ConfigService.getInstance();
