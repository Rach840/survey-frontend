export type Questioner = { id: string; fullName: string; email: string };

export type User = {
    id: 8,
    full_name: string,
    email: string,
    role: "ADMIN" | "QUESTIONER",
    created_at: string,
    disabled_at: string | null;
}