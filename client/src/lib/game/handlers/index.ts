import { serverInformationHandler } from "./serverInformation";

import { worldChunkLoadHandler } from "./worldChunkLoad";
import { worldChunkUpdateHandler } from "./worldChunkUpdate";

import { playerKickHandler } from "./playerKick";
import { playerInformationHandler } from "./playerInformation";
import { playerJoinHandler } from "./playerJoin";
import { playerLeaveHandler } from "./playerLeave";
import { playerHealthHandler } from "./playerHealth";

import { pieceMoveHandler } from "./pieceMove";

export default [
    serverInformationHandler,
    worldChunkLoadHandler,
    worldChunkUpdateHandler,

    playerKickHandler,
    playerInformationHandler,
    playerJoinHandler,
    playerLeaveHandler,
    playerHealthHandler,
    pieceMoveHandler
];