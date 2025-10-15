interface EnvConfig {
  env?: string;
  production?: boolean;
  backendBaseUrl?: string;
  noticiasApiUrl?: string;
}

declare global {
  interface Window {
    env: EnvConfig;
  }
}

export const environment = {
  env: window?.env?.env ?? 'local',
  production: window?.env?.production || false,
  apiUrl: 'https://localhost:7174',
  noticiasApiUrl:
    window?.env?.noticiasApiUrl ??
    'https://api.zenvus.com.br/v1',

};
