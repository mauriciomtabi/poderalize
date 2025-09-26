export type UserRole = 'admin' | 'colaborador' | 'pending';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by?: string;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}