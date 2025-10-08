
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/api-client';
import { userKeys } from '@/entities/user/model/keys';

export function useUpdateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; name: string }) =>
            apiFetch(`/users/${payload.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: payload.name }),
            }),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: userKeys.byId(vars.id) });
            const prev = qc.getQueryData(userKeys.byId(vars.id));
            qc.setQueryData(userKeys.byId(vars.id), (old: any) => ({ ...(old ?? {}), name: vars.name }));
            return { prev };
        },
        onError: (_e, v, ctx) => {
            if (ctx?.prev) qc.setQueryData(userKeys.byId(v.id), ctx.prev);
        },
        onSettled: (_d, _e, v) => {
            qc.invalidateQueries({ queryKey: userKeys.byId(v.id) });
            qc.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}
