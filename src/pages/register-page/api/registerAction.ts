import {registerSchema} from "@/pages/register-page/schema";
import {toast} from "sonner";
import {useRouter} from "next/router";

export async function registerAction(
    _: unknown,
    formData: FormData){
    console.log(process.env.API_URL)
    try {
        const data = registerSchema.parse(Object.fromEntries(formData.entries()));
        const r = await fetch(`http://localhost:8080/api/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!r.ok) throw new Error('register failed')
        toast.success("Пользователь создан")

        return r.status
    }catch (e) {
        toast.error("Произошла ошибка")
     return e
    }




}