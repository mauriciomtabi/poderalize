import { v4 as uuidv4 } from 'uuid';

/**
 * Hook para gerar UUIDs únicos de forma consistente
 * Substitui o Math.random() para garantir unicidade
 */
export const useUuid = () => {
  return {
    generateId: () => uuidv4(),
    generateShortId: () => uuidv4().substring(0, 8),
  };
};

export const generateId = () => uuidv4();
export const generateShortId = () => uuidv4().substring(0, 8);