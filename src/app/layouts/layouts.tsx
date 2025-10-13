'use client'
import SidebarMenu from "@/widgets/sidebar";

import {usePathname} from "next/navigation";
import {SidebarProvider, SidebarTrigger} from "@/shared/ui/sidebar";
import { redirect } from 'next/navigation'
import {getMe} from "@/entities/user/api/getMe";
import {useMeQuery} from "@/entities/user/model/meQuery";
export  function AdminLayouts({children} : {children:React.ReactNode}) {
        const {data: user, isLoading} = useMeQuery()
    console.log(user)
        if (!isLoading && !user) {
            console.log(!isLoading && !user)
            redirect('/login') // абсолютный редирект на сервере
        }
return (

            <SidebarProvider>
                <SidebarMenu />
                <main className="w-full bg-[#eff6ff]">
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        )


}