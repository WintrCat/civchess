import { maxBy } from "es-toolkit";

import { UserRole } from "shared/constants/UserRole";

const defaultMaximumWorldCount = 10;

const maximumWorldCounts: Record<UserRole, number> = {
    [UserRole.ADMIN]: Infinity,
    [UserRole.CREATOR]: Infinity,
    [UserRole.STAFF]: Infinity
};

export function getMaximumWorldCount(roles: UserRole[]) {
    const highestRole = maxBy(roles, role => maximumWorldCounts[role]);
    
    return highestRole
        ? maximumWorldCounts[highestRole]
        : defaultMaximumWorldCount;
}