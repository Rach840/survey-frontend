'use client'
import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/shared/ui/card";
import {Eye, EyeOff, LogIn,Lock, User} from "lucide-react";
import {Input} from "@/shared/ui/input";
import {Button} from "@/shared/ui/button";
import Image from "next/image"
export  function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Login attempt:", { email, password })
    }

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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email/Login field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                                Логин или Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af] z-10" />
                                <Input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Введите логин или email"
                                    className="pl-10 pr-4 py-3 bg-[#f9fafb] border-[#e5e7eb] rounded-xl text-[#374151] placeholder:text-[#9ca3af] h-auto"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
                                Пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af] z-10" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Введите пароль"
                                    className="pl-10 pr-12 py-3 bg-[#f9fafb] border-[#e5e7eb] rounded-xl text-[#374151] placeholder:text-[#9ca3af] h-auto"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password link */}
                        <div className="text-right">
                            <a href="#" className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                                Забыли пароль?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#2563eb] to-[#a855f7] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all h-auto hover:from-[#2563eb] hover:to-[#a855f7] hover:opacity-90"
                        >
                            <LogIn className="w-5 h-5" />
                            Войти в систему
                        </Button>

                        {/* Register link */}
                        <p className="text-center text-sm text-[#6b7280]">
                            Нет аккаунта?{" "}
                            <a href="#" className="text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                                Зарегистрироваться
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}