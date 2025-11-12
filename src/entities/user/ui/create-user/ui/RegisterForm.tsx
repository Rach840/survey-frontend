'use client'
import {useActionState, useEffect} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/shared/ui/card";
import {Input} from "@/shared/ui/input";
import {Button} from "@/shared/ui/button";
import Image from "next/image"
import {zodResolver} from "@hookform/resolvers/zod"
import {registerSchema, RegisterSchema} from "@/entities/user/ui/create-user/schema/register-schema";
import {Controller, useForm} from "react-hook-form";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/shared/ui/field";
import registerAction from "@/entities/user/api/registerAction";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

export default function RegisterForm() {
    const registerForm = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched",
    });
    const [registerState, registerFormAction] = useActionState(registerAction, {});
    useEffect(() => {
        if (registerState == 201) {
            toast.success('Пользователь создан')
        }else {
            toast.error('Произошла ошибка')
        }
    }, [registerState]);
    return (

                    <form action={registerFormAction} id="form-reg" className="bg-gray-50 space-y-6">
                        {/* Email/Login field */}
                        <FieldGroup className={""}>
                            <Controller
                                name="full_name"
                                control={registerForm.control}
                                render={({ field, fieldState }) => (
                                    <Field className={"col-span-1"} data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-reg-fullname">
                                            Введите фио
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-reg-fullname"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Введите ФИО"
                                            autoComplete="name"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="email"
                                control={registerForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-reg-email">
Введите электронную почту
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-reg-email"
                                            aria-invalid={fieldState.invalid}
                                            type={"email"}

                                            placeholder="example@mail.com"
                                            autoComplete="email"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <FieldGroup className={"grid grid-cols-2"}>
                            <Controller
                                name="password"
                                control={registerForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-reg-fullname">
                                            Введите пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-reg-fullname"
                                            type={'password'}
                                            aria-invalid={fieldState.invalid}
                                            placeholder=""
                                            autoComplete="off"

                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="password_confirm"
                                control={registerForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-reg-email">
                                            Повторите пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-reg-email"
                                            aria-invalid={fieldState.invalid}
                                            type={"password"}

                                            placeholder=""
                                            autoComplete="email"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <Field orientation="horizontal">

                            <Button variant={"form"} type="submit" className={"w-full"} form="form-reg">
                                Создать
                            </Button>
                        </Field>
                    </form>

    )
}