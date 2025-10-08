import { apiFetch } from '@/shared/api/api-client';
import type { Questioner } from './types';
export const fetchUsers = () => apiFetch<Questioner[]>('/users');
export const fetchUser = (id: string) => apiFetch<Questioner>(`/users/${id}`);
