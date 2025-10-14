'use client'
import * as React from "react";
import { useMemo, useState } from "react";
import {Controller, useForm, type FieldPath} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared";
import { Input } from "@/shared";

import {buildDefaultValues, buildZodShape, DynamicFormDef} from "@/features/template/generated/model";
import {
    Checkbox,
    Field,
    FieldContent,
    FieldLabel,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared";

export type GeneratedFormProps = {
    schema: DynamicFormDef; // входная схема (из параметров)
    initialValues?: Record<string, unknown>; // опциональные стартовые значения (поверх дефолтов)
    onSubmit?: (values: Record<string, unknown>) => void; // колбэк сабмита
};

export function GeneratedForm({ schema, initialValues, onSubmit: onSubmitProp }: GeneratedFormProps) {
    const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

    const FormSchema = useMemo(() => buildZodShape(schema), [schema]);
    type FormValues = z.infer<typeof FormSchema>;

    const defaultVals = useMemo(() => {
        const base = buildDefaultValues(schema);
        return { ...base, ...initialValues } as FormValues;
    }, [schema, initialValues]);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: defaultVals,
        mode: "onBlur",
    });

    function onSubmit(values: FormValues) {
        const payload = values as Record<string, unknown>;
        setSubmitted(payload);
        onSubmitProp?.(payload);
    }

    return (
        <div className="mx-auto max-w-2xl ">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">{schema.title}</CardTitle>
                </CardHeader>
                <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {schema.sections.map((section) => (
                                <section key={section.id} className="space-y-4">
                                    <h3 className="text-lg font-semibold">{section.title}</h3>

                                    {section.fields.map((f) => {
                                        const fieldName = `${section.code}.${f.code}`
                                        return (
                                            <Controller
                                                key={f.id}
                                                name={fieldName as FieldPath<FormValues>}
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldContent>
                                                            <FieldLabel htmlFor={fieldName}>
                                                                {f.label}
                                                                {f.required && <span className="text-red-600"> *</span>}
                                                            </FieldLabel>

                                                            {f.type === "text" ? (
                                                                <Input
                                                                    id={fieldName}
                                                                    aria-invalid={fieldState.invalid}
                                                                    value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
                                                                    onChange={field.onChange}
                                                                    onBlur={field.onBlur}
                                                                    placeholder={f.placeholder}
                                                                    type="text"
                                                                />
                                                            ) : f.type === "number" ? (
                                                                <Input
                                                                    id={fieldName}
                                                                    aria-invalid={fieldState.invalid}
                                                                    value={typeof field.value === "number" ? field.value : String(field.value ?? "")}
                                                                    onChange={field.onChange}
                                                                    onBlur={field.onBlur}
                                                                    placeholder={f.placeholder}
                                                                    type="number"
                                                                />
                                                            ) : f.type === "date" ? (
                                                                <Input
                                                                    id={fieldName}
                                                                    aria-invalid={fieldState.invalid}
                                                                    value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
                                                                    onChange={field.onChange}
                                                                    onBlur={field.onBlur}
                                                                    type="date"
                                                                />
                                                            ) : f.type === "select" ? (
                                                                <Select
                                                                    value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
                                                                    onValueChange={(value) => field.onChange(value)}
                                                                >
                                                                    <SelectTrigger
                                                                        id={fieldName}
                                                                        aria-invalid={fieldState.invalid}
                                                                        onBlur={field.onBlur}
                                                                        className="min-w-[120px]"
                                                                    >
                                                                        <SelectValue placeholder="Выберите…" />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="item-aligned">
                                                                        <SelectItem value="" disabled>
                                                                            Выберите…
                                                                        </SelectItem>
                                                                        {f.options?.map((opt) => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                            ) : f.type === "checkbox" ? (
                                                                <Checkbox
                                                                    id={fieldName}
                                                                    name={fieldName}
                                                                    checked={!!field.value}
                                                                    onBlur={field.onBlur}
                                                                    onCheckedChange={(checked) => field.onChange(!!checked)}
                                                                />

                                                            ) : (
                                                                <Input
                                                                    id={fieldName}
                                                                    aria-invalid={fieldState.invalid}
                                                                    value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
                                                                    onChange={field.onChange}
                                                                    onBlur={field.onBlur}
                                                                />
                                                            )}
                                                            {fieldState.error ? (
                                                                <p className="text-sm text-red-600">{fieldState.error.message}</p>
                                                            ) : null}
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />
                                        )
                                    })}
                                </section>
                            ))}

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit">Отправить</Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        form.reset(buildDefaultValues(schema) as FormValues);
                                        setSubmitted(null);
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </div>
                        </form>

                </CardContent>
                {submitted && (
                    <CardFooter className="block">
                        <div className="text-sm text-muted-foreground mb-2">Отправленные данные</div>
                        <pre className="rounded-xl bg-muted p-4 text-sm overflow-auto">
              {JSON.stringify(submitted, null, 2)}
            </pre>
                    </CardFooter>
                )}
            </Card>

        </div>
    );
}
