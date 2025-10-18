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
    })
    .refine(
        (d) => d.invitationMode === "admin" || d.participants.length === 0,
        {
            message:
                "Добавление участников вручную доступно только при ручном режиме. В иных режимах список участников должен быть пуст.",
            path: ["participants"],
        }
    );

export type SurveyValues = z.infer<typeof surveySchema>;
export type SurveyInput  = z.input<typeof surveySchema>;   // status?, invitationMode?
export type SurveyOutput = z.output<typeof surveySchema>;