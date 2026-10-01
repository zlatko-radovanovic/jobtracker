export type ApplicationStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'APPLIED', label: 'Prijavljeno' },
  { value: 'INTERVIEW', label: 'Intervju' },
  { value: 'OFFER', label: 'Ponuda' },
  { value: 'REJECTED', label: 'Odbijeno' },
];

export function statusLabel(status: ApplicationStatus): string {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Company {
  id: number;
  name: string;
  website: string | null;
  city: string | null;
}

export interface CompanyRequest {
  name: string;
  website: string | null;
  city: string | null;
}

export interface JobApplication {
  id: number;
  position: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO datum, npr. 2026-01-15
  salary: number | null;
  notes: string | null;
  companyId: number;
  companyName: string;
}

export interface ApplicationRequest {
  position: string;
  companyId: number;
  status: ApplicationStatus;
  appliedDate: string;
  salary: number | null;
  notes: string | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
