import {z} from "zod";

export const updateSchema = z
    .object({
        title: z.string().min(5,"Название анкеты должно быть не менее 5 символов").trim(),
            invitationMode: z.enum(["admin", "bot"]),
        status: z.enum(["draft", "open", "closed", "archived"]),
            max_participants: z.number().min(1, 'минимальное количество участников должно равняться 1'),
        starts_at: z.string().trim().optional(),
        ends_at: z.string().trim().optional(),
    })
export type UpdateSchema = z.infer<typeof updateSchema>;