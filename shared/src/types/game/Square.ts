import { SquareType } from "@/constants/SquareType";
import { Piece } from "./Piece";

export interface Square {
    type: SquareType;
    piece?: Piece;
}