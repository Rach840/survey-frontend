import {z} from "zod";


export type FieldType = "text" | "number" | "date" | "select" | "checkbox";


export type FormFieldDef = {
    id: string;
    code: string;      // ключ поля
    type: FieldType;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[]; // для select
};

export type FormSectionDef = {
    id: string;
    code: string;      // ключ секции
    title: string;
    repeatable?: boolean; // зарезервировано (массивы секций можно добавить позже)
    fields: FormFieldDef[];
};

export type DynamicFormDef = {
    title: string;
    sections: FormSectionDef[];
};

// -------- Утилиты: схема валидации и значения по умолчанию --------
export function buildZodShape(formDef: DynamicFormDef) {
    const sectionShapes: Record<string, z.ZodTypeAny> = {};

    for (const section of formDef.sections) {
        const fieldShape: Record<string, z.ZodTypeAny> = {};

        for (const field of section.fields) {
            let zField: z.ZodTypeAny;
            switch (field.type) {
                case "text":
                    zField = z.string();
                    break;
                case "number":
                    zField = z
                        .union([z.number(), z.string()])
                        .transform((v) => (typeof v === "string" ? (v.trim() === "" ? undefined : Number(v)) : v))
                        .refine((v) => v === undefined || !Number.isNaN(v as number), { message: "Введите число" });
                    break;
                case "date":
                    zField = z
                        .string()
                        .regex(new RegExp("^\\d{4}-\\d{2}-\\d{2}$"), { message: "Формат ГГГГ-ММ-ДД" });
                    break;
                case "select":
                    zField = z.string();
                    break;
                case "checkbox":
                    zField = z.boolean().optional().transform((v) => !!v);
                    break;
                default:
                    zField = z.string();
            }

            if (field.required && field.type !== "checkbox") {
                // чекбоксы чаще всего не обязательные; при надобности можно добавить required
                zField = zField.refine((v: unknown) => v !== undefined && v !== "" && v !== null, {
                    message: "Обязательное поле",
                });
            }

            fieldShape[field.code] = zField;
        }

        sectionShapes[section.code] = z.object(fieldShape);
    }

    return z.object(sectionShapes);
}

export function buildDefaultValues(formDef: DynamicFormDef) {
    const defaults: Record<string, Record<string, unknown>> = {};
    for (const section of formDef.sections) {
        defaults[section.code] = {};
        for (const field of section.fields) {
            switch (field.type) {
                case "checkbox":
                    defaults[section.code][field.code] = false;
                    break;
                default:
                    defaults[section.code][field.code] = "";
            }
        }
    }
    return defaults;
}
