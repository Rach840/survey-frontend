'use client'
import {useActionState, useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/shared/ui/card";
import {Input} from "@/shared/ui/input";
import {Button} from "@/shared/ui/button";
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import {registerSchema, RegisterSchema} from "@/pages/register-page/schema";
import {Controller, useForm} from "react-hook-form";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/shared/ui/field";
import Link from "next/link";
import {registerAction} from "@/pages/register-page/api/registerAction";
import {useRouter} from "next/navigation";
export  function RegisterForm() {
    const router = useRouter()
    const registerForm = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched",
    });
    const [registerState, registerFormAction] = useActionState(registerAction, {});
    useEffect(() => {
        if (registerState == 201) {
            setTimeout(()=> {
                router.replace("/login")
            },2000)

        }
    }, [registerState, router]);
    return (
        <div className="max-w-md mx-auto">
            <Card className="bg-[#ffffff] rounded-3xl shadow-xl border-0">
                <CardHeader className="items-center justify-center text-center pb-2">
                    {/* Icon */}
                    <div className="w-16 h-16  mx-auto bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="Login icon"
                            width={64}
                            height={64}
                            className="rounded-2xl "
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-[#1f2937]">Вход в систему</CardTitle>
                    <CardDescription className="text-[#6b7280]">Введите ваши учетные данные</CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={registerFormAction} id="form-reg" className=" space-y-6">
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
                        {/* Register link */}
                        <p className="text-center text-sm text-[#6b7280]">
                            Есть аккаунт? {" "}
                            <Link href="/login" className="text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                                Войти
                            </Link>
                        </p>
                    </form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">

                        <Button variant={"form"} type="submit" form="form-reg">
                            Зарегистрироваться
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}