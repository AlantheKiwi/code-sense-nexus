
interface StoredCredentials {
  repoUrl: string;
  githubToken: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'typescript-fixer-github-credentials',
  REMEMBER_PREFERENCE: 'typescript-fixer-remember-credentials'
} as const;

const EXPIRATION_DAYS = 30;

export class CredentialsStorage {
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static shouldRememberCredentials(): boolean {
    if (!this.isStorageAvailable()) return false;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBER_PREFERENCE) === 'true';
    } catch {
      return false;
    }
  }

  static setRememberPreference(remember: boolean): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_PREFERENCE, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_PREFERENCE);
        this.clearCredentials();
      }
    } catch {
      // Silently fail
    }
  }

  static saveCredentials(repoUrl: string, githubToken: string): void {
    if (!this.isStorageAvailable() || !this.shouldRememberCredentials()) return;
    
    try {
      const credentials: StoredCredentials = {
        repoUrl,
        githubToken,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    } catch {
      // Silently fail
    }
  }

  static getStoredCredentials(): { repoUrl: string; githubToken: string } | null {
    if (!this.isStorageAvailable() || !this.shouldRememberCredentials()) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (!stored) return null;

      const credentials: StoredCredentials = JSON.parse(stored);
      
      // Check if credentials have expired
      const daysSinceStored = (Date.now() - credentials.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceStored > EXPIRATION_DAYS) {
        this.clearCredentials();
        return null;
      }

      return {
        repoUrl: credentials.repoUrl,
        githubToken: credentials.githubToken
      };
    } catch {
      return null;
    }
  }

  static clearCredentials(): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    } catch {
      // Silently fail
    }
  }

  static clearAll(): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_PREFERENCE);
    } catch {
      // Silently fail
    }
  }
}
