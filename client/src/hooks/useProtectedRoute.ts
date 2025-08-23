import { useEffect } from "react";
import { useNavigate } from "react-router";

import { authClient } from "@/lib/auth";

export function useProtectedRoute() {
    const navigate = useNavigate();

    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (isPending || session) return;
        navigate("/signin");
    }, [session, isPending]);
}