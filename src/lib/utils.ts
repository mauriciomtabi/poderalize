import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length !== 14) return cnpj;
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function ensureUrlProtocol(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function getInstagramUrl(username: string): string {
  if (!username) return '';
  const trimmed = username.trim();
  // Check if it's already a URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Otherwise treat as username
  const cleaned = trimmed.replace(/^@/, '');
  return `https://instagram.com/${cleaned}`;
}

export function getFacebookUrl(urlOrUsername: string): string {
  if (!urlOrUsername) return '';
  const trimmed = urlOrUsername.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.includes('facebook.com/')) {
    return `https://${trimmed}`;
  }
  return `https://facebook.com/${trimmed}`;
}

/**
 * Compara se uma data é anterior ao dia atual (ignorando horas)
 */
export function isDateOverdue(date: Date | string): boolean {
  const dueDate = new Date(date);
  const today = new Date();
  
  // Zerar horas para comparar apenas datas
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

/**
 * Verifica se uma data é hoje
 */
export function isDateToday(date: Date | string): boolean {
  const dueDate = new Date(date);
  const today = new Date();
  
  // Zerar horas para comparar apenas datas
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dueDate.getTime() === today.getTime();
}

/**
 * Retorna a classe de cor apropriada para a data de vencimento
 */
export function getDueDateColorClass(date: Date | string, isCompleted: boolean = false): string {
  if (isCompleted) return "text-muted-foreground";
  if (isDateOverdue(date)) return "text-red-500";
  if (isDateToday(date)) return "text-orange-500";
  return "text-muted-foreground";
}
