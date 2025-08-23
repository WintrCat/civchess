import { UserRole } from "@/constants/UserRole";

export interface PublicProfile {
    name: string;
    createdAt: string;
    roles: UserRole[];
}