import { create } from "zustand"

interface UserState{
    username:string | null,
    email:string | null,
    setUser: (username: string, email: string) => void
    clearUser: () => void
}

export const useUser = create<UserState>((set) => ({
    username: null,
    email: null,
    setUser: (username, email) => set({ username, email }),
    clearUser: () => set({username:null, email:null})
}))