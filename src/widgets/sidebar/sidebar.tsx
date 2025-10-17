import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/shared/ui/sidebar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/shared/ui/dropdown-menu";
import {ChevronUp, User2} from "lucide-react";
import {items} from "@/widgets/sidebar/links";
import Image from 'next/image'
import {useMeQuery} from "@/entities/user/model/meQuery";
import {Button} from "@/shared";
import {useSignOut} from "@/features/auth/sign-out/model";

export function AppSidebar() {
    const { data: user, isLoading } = useMeQuery()
    const {mutate: signOut} = useSignOut()
    return (
            <Sidebar>
                <SidebarHeader >
                    <div className="p-6 flex items-center gap-3 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="rounded-xl"
                            />
                        </div>
                        <span className="font-semibold text-lg text-gray-900">Анкетирование</span>
                    </div>
                </SidebarHeader>
                <SidebarContent >
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton size="lg" className='text-xl' asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size='lg' className='text-xl'>
                                        <User2 className='!size-8' /> {isLoading ? "Загрузка" : user?.full_name}
                                        <ChevronUp className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-full"
                                >

                                    <DropdownMenuItem>
                                        <Button onClick={signOut} >
                                            <span>Выйти</span>
                                        </Button>

                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
    )
}