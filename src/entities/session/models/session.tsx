import { createContext, useContext, useState } from 'react';

export type SessionUser = { id: string; email: string; name?: string; role?: string } | null;

const Ctx = createContext<{ user: SessionUser; setUser: (u: SessionUser) => void } | null>(null);

export function SessionProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
    const [state, setState] = useState<SessionUser>(user);
    return <Ctx.Provider value={{ user: state, setUser: setState }}>{children}</Ctx.Provider>;
}

export function useSession() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
}