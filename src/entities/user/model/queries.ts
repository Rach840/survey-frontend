import { queryOptions, useQuery } from '@tanstack/react-query';
import * as api from '../api';
import { userKeys } from './keys';

export const usersListOptions = (filters?: unknown) =>
    queryOptions({
        queryKey: userKeys.list(filters),
        queryFn: () => api.fetchUsers(), // filters → в queryFn по мере надобности
    });

export const userByIdOptions = (id: string) =>
    queryOptions({
        queryKey: userKeys.byId(id),
        queryFn: () => api.fetchUser(id),
        enabled: !!id,
    });

export const useUsers = (filters?: unknown) => useQuery(usersListOptions(filters));
export const useUser = (id: string) => useQuery(userByIdOptions(id));