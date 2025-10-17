import LoginForm from "@/pages/login-page/LoginForm";


export default async function LoginPage() {



        return (
        <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center relative z-10  p-4 relative overflow-hidden">
            <div className="absolute top-24 right-32 w-32 h-32 rounded-full z-20 bg-gradient-to-br from-[#a5b4fc] to-[#c4b5fd] opacity-60" />
            <div className="absolute bottom-32 left-32 w-48 h-48 rounded-full z-20 bg-gradient-to-br from-[#a5b4fc] to-[#c4b5fd] opacity-40" />

            <div className="w-full relative z-30 max-w-6xl">
                <h1 className="text-4xl font-bold text-[#1f2937] text-center mb-12">Добро пожаловать в Анкетирование</h1>
                <LoginForm />
            </div>
        </div>
    )
}