import AppLayout from "@/app/providers/(app)/layout";


export default function PublicLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (

        <AppLayout>
            {children}
        </AppLayout>

    );
}
