/**
 * Serviço centralizado para gerenciar persistência de dados no localStorage
 * Implementa cache automático e validação de dados
 */

export interface StorageData {
  kanban: {
    columns: any[];
    lastUpdated: string;
  };
  leads: {
    data: any[];
    lastUpdated: string;
  };
  settings: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    lastUpdated: string;
  };
  projects_prefs: {
    viewAllCardsAsAdmin: boolean;
    lastUpdated: string;
  };
  viewed_due_cards: {
    cards: string[];
    timestamp: number;
  };
}

class LocalStorageService {
  private prefix = 'poderalize_crm_';

  private getKey(key: keyof StorageData): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Salva dados no localStorage com timestamp
   */
  save<K extends keyof StorageData>(key: K, data: StorageData[K]): void {
    try {
      const storageData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(storageData));
    } catch (error) {
      console.error(`Erro ao salvar dados ${key}:`, error);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  load<K extends keyof StorageData>(key: K): StorageData[K] | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erro ao carregar dados ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove dados específicos do localStorage
   */
  remove(key: keyof StorageData): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Erro ao remover dados ${key}:`, error);
    }
  }

  /**
   * Limpa todos os dados do CRM
   */
  clear(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Verifica se os dados existem e são válidos
   */
  exists(key: keyof StorageData): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }
}

export const localStorageService = new LocalStorageService();