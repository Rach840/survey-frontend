'use client'
import SidebarMenu from "@/widgets/sidebar";

import {usePathname} from "next/navigation";
import {SidebarProvider, SidebarTrigger} from "@/shared/ui/sidebar";

export function SidebarLayouts({children} : {children:React.ReactNode}) {
    const pathname = usePathname()
    console.log(pathname)
    if (pathname == '/login' || pathname == '/register') {
        return (
            <main className="w-full">

                {children}
            </main>
        )
    }else {
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

}