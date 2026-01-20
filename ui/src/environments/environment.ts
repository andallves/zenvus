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
  apiUrl: 'https://zenvus-api-ex3maipw6q-uc.a.run.app',
  noticiasApiUrl: window?.env?.noticiasApiUrl ?? 'https://api.zenvus.com.br/v1',
};
