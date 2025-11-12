
import RegisterForm from "@/entities/user/ui/create-user/ui/RegisterForm";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/shared";

export default function RegisterDialog({children}:{children:React.ReactNode}) {
    return (

    <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Создание нового анкетирующего</DialogTitle>

                    <RegisterForm />

            </DialogHeader>
        </DialogContent>
    </Dialog>
    )
}