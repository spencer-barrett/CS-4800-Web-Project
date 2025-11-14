"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/clientApp";

type WithAuthOptions = {
    redirectTo?: string;
    allowWhen?: (user: User | null) => boolean;
    Loading?: React.ComponentType;
};

export function withAuth<P extends { user: User }>(
    Wrapped: React.ComponentType<P>,
    opts: WithAuthOptions = {}
) {
    const {
        redirectTo = "/login",
        allowWhen = (u) => !!u,
        Loading = () => <div className="p-6 text-center">Checking session…</div>,
    } = opts;

    function Guard(props: Omit<P, "user">) {
        const [user, setUser] = useState<User | null | undefined>(undefined);
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            const unsub = onAuthStateChanged(auth, (u) => setUser(u));
            return () => unsub();
        }, []);

        useEffect(() => {
            if (user === undefined) return; // still checking
            if (!allowWhen(user)) {
                const next = encodeURIComponent(pathname || "/");
                if (pathname !== redirectTo) {
                    router.replace(`${redirectTo}?next=${next}`);
                }
            }
        }, [user, pathname, router]);

        if (user === undefined) return <Loading />;
        if (!allowWhen(user)) return null;

        return <Wrapped {...(props as P)} user={user as User} />;
    }

    Guard.displayName = `withAuth(${Wrapped.displayName || Wrapped.name || "Component"})`;
    return Guard;
}
