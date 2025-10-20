import {z} from "zod";

export const surveySchema = z
    .object({
        title: z.string().trim().min(1, "Название — обязательное поле"),
        status: z.enum(["draft", "open", "closed", "archived"]),
        template_id: z.number(),
        invitationMode: z.enum(["admin", "bot"]),
        public_slug: z.string().trim().min(1, "Публичный slug обязателен"),
        participants: z.array(
            z.object({
                email: z.string().email("Некорректный email").optional(),
                full_name: z.string().min(1, "Введите Имя или Фамилию"),
            })
        ),
        max_participants: z.number(),
        starts_at: z.string().trim().optional(),
        ends_at: z.string().trim().optional(),
    })
    .refine(
        (d) => d.invitationMode === "admin" || d.participants.length === 0,
        {
            message:
                "Добавление участников вручную доступно только при ручном режиме. В иных режимах список участников должен быть пуст.",
            path: ["participants"],
        }
    )
    .refine(
        (d) => {
            if (!d.starts_at || !d.ends_at) return true
            const start = new Date(d.starts_at).getTime()
            const end = new Date(d.ends_at).getTime()
            if (Number.isNaN(start) || Number.isNaN(end)) {
                return false
            }
            return end >= start
        },
        {
            message: "Дата окончания не может быть раньше даты начала",
            path: ["ends_at"],
        }
    );

export type SurveyValues = z.infer<typeof surveySchema>;
export type SurveyInput  = z.input<typeof surveySchema>;   // status?, invitationMode?
export type SurveyOutput = z.output<typeof surveySchema>;