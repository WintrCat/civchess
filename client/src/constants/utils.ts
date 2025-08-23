import { SquareType } from "shared/constants/SquareType";
import { UserRole } from "shared/constants/UserRole";

export const userRoleDisplays = {
    [UserRole.ADMIN]: {
        name: "WINTRCAT",
        color: "#3b5cff70"
    },
    [UserRole.STAFF]: {
        name: "EVENT STAFF",
        color: "#3fd65870"
    },
    [UserRole.CREATOR]: {
        name: "CONTENT CREATOR",
        color: "#ff5f5f70"
    }
};

export const biomeNames = {
    [SquareType.GRASSLAND]: "Grassland",
    [SquareType.DESERT]: "Desert",
    [SquareType.OCEAN]: "Ocean"
};