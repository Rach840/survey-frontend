'use client'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/shared/ui/card";
import {Input} from "@/shared/ui/input";
import {Button} from "@/shared/ui/button";
import Image from "next/image"
import Link from "next/link";
import {useSignIn} from "@/features/auth/sign-in/model";
import {Controller, useForm} from "react-hook-form";
import {loginSchema, LoginSchema} from "@/pages/login-page/schema/login-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/shared";

export default  function LoginForm() {

    const {mutate} = useSignIn()
    const loginForm = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
    });

    
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
                    <form action={()=> mutate(loginForm.getValues())} id="form-reg" className=" space-y-6">
                        {/* Email/Login field */}
                        <FieldGroup className={""}>
                            <Controller
                                name="email"
                                control={loginForm.control}
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
                            <Controller
                                name="password"
                                control={loginForm.control}
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
                            Войти
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}