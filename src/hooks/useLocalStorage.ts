import { useState, useEffect } from 'react';
import { localStorageService, StorageData } from '@/services/localStorage';

/**
 * Hook personalizado para gerenciar estado com persistência automática no localStorage
 */
export function useLocalStorage<K extends keyof StorageData>(
  key: K,
  defaultValue: StorageData[K]
): [StorageData[K], (value: StorageData[K]) => void, boolean] {
  const [isLoading, setIsLoading] = useState(true);
  const [storedValue, setStoredValue] = useState<StorageData[K]>(defaultValue);

  // Carrega dados iniciais do localStorage
  useEffect(() => {
    try {
      const item = localStorageService.load(key);
      if (item !== null) {
        setStoredValue(item);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Função para atualizar o valor
  const setValue = (value: StorageData[K]) => {
    try {
      setStoredValue(value);
      localStorageService.save(key, value);
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}