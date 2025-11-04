import {Card, CardDescription, CardHeader, CardTitle} from "@/shared";
import {AlertCircle} from "lucide-react";

export function TokenMissingNotice() {
    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
            <Card className='w-full'>
                <CardHeader className='flex items-start gap-2'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <div>
                        <CardTitle>Токен не найден</CardTitle>
                        <CardDescription>
                            Ссылка не содержит токен доступа. Убедитесь, что вы перешли по полной ссылке из приглашения.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}
