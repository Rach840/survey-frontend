import {QueryObserverResult, RefetchOptions} from "@tanstack/query-core";
import {motion} from "motion/react";
import {fadeTransition, fadeUpVariants} from "@/shared/ui/page-transition";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircleIcon, ArrowLeft, RefreshCcw} from "lucide-react";
import {Button} from "@/shared";
import {useRouter} from "next/navigation";

export default function ErrorFetch({refetch}: { refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<never, Error>>}) {
    const router = useRouter()
    return (
        <div className='min-h-screen   px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
            <motion.div
                initial='hidden'
                animate='show'
                variants={fadeUpVariants}
                transition={fadeTransition}
            >

                <Alert className={'flex space-x-1 space-y-2'}  variant="destructive">

                    <AlertCircleIcon className={'!w-13 !h-13'} />
                    <div className=" space-y-1.5">
                        <AlertTitle className={'text-2xl'}>Не удалось загрузить данные </AlertTitle>
                        <AlertDescription className={'space-y-4'}>
                            <p>Попробуйте обновить страницу или повторите попытку позже.</p>
                            <div className='flex gap-3'>
                                <Button onClick={() => refetch()} variant='form' className='gap-2'>
                                    <RefreshCcw className='h-4 w-4' />
                                    Повторить запрос
                                </Button>

                                <Button variant='ghost' onClick={router.back} className='gap-2'>
                                    <ArrowLeft className='h-4 w-4' />
                                    Назад
                                </Button>
                            </div>
                        </AlertDescription>
                    </div>



                </Alert>

            </motion.div>
        </div>
    )
}