export const userKeys = {
    all: ['user'] as const,
    list: (filters?: unknown) => [...userKeys.all, 'list', filters ?? {}] as const,
    byId: (id: string) => [...userKeys.all, 'byId', id] as const,
};