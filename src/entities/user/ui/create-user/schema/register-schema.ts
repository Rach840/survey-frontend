import {z} from "zod";

export const registerSchema = z
    .object({
        full_name: z.string('ФИО обязательное поле').min(1, ),
        email: z.email("Электронная почта обязательна").min(1),
        password: z.string().min(1),

        password_confirm: z.string(),
    })
    .refine((s) => s.password === s.password_confirm, {
        path: ["password_confirm"],
        message: "Пароли не совпадают",
    });

export type RegisterSchema = z.infer<typeof registerSchema>;