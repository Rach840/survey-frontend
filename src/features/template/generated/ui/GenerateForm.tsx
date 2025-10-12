'use client'
import * as React from "react";
import { useMemo, useState } from "react";
import {Controller, useForm} from "react-hook-form";
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
    schema: DynamicFormDef;            // входная схема (из параметров)
    initialValues?: Record<string, any>; // опциональные стартовые значения (поверх дефолтов)
    onSubmit?: (values: any) => void;    // колбэк сабмита
};

export function GeneratedForm({ schema, initialValues, onSubmit: onSubmitProp }: GeneratedFormProps) {
    const [submitted, setSubmitted] = useState<Record<string, any> | null>(null);

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
        setSubmitted(values as Record<string, any>);
        onSubmitProp?.(values);
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">{schema.title}</CardTitle>
                </CardHeader>
                <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {schema.sections.map((section) => (
                                <section key={section.id} className="space-y-4">
                                    <h3 className="text-lg font-semibold">{section.title}</h3>

                                    {section.fields.map((f) => (
                                        <Controller
                                            key={f.id}
                                            name={name as any}
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldContent>
                                                        <FieldLabel htmlFor={field.name}>
                                                            {f.label}
                                                            {f.required && <span className="text-red-600"> *</span>}
                                                        </FieldLabel>

                                                            {f.type === "text" ? (
                                                                <Input aria-invalid={fieldState.invalid}  {...f} />
                                                            ) : f.type === "number" ? (
                                                                <Input aria-invalid={fieldState.invalid}   {...f} />
                                                            ) : f.type === "date" ? (
                                                                <Input aria-invalid={fieldState.invalid} {...f} />
                                                            ) : f.type === "select" ? (
                                                                <Select
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    value={field.value ?? ""}
                                                                    onValueChange={(e) => field.onChange(e)}
                                                                >
                                                                    <SelectTrigger
                                                                        id="form-rhf-select-language"
                                                                        aria-invalid={fieldState.invalid}
                                                                        onBlur={field.onBlur}
                                                                        className="min-w-[120px]"
                                                                    >
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="item-aligned">
                                                                        <SelectItem value="" disabled>
                                                                            Выберите…
                                                                        </SelectItem>
                                                                        {f.options?.map((opt) => (
                                                                            <SelectItem key={opt.value} value={opt.value}>    {opt.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                            ) : f.type === "checkbox" ? (
                                                                    <Checkbox
                                                                        id="form-rhf-checkbox-responses"
                                                                        name={field.name}
                                                                        checked={!!field.value}
                                                                        onBlur={field.onBlur}
                                                                        onCheckedChange={(e) => field.onChange(e)}
                                                                        disabled
                                                                    />

                                                            ) : (
                                                                <Input {...f} />
                                                            )}
                                                    </FieldContent>
                                                </Field>

                                            )}
                                        />
                                    ))}
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
