import { serverInformationHandler } from "./serverInformation";
import { worldChunkLoadHandler } from "./worldChunkLoad";
import { worldChunkUpdateHandler } from "./worldChunkUpdate";
import { playerJoinHandler } from "./playerJoin";
import { playerLeaveHandler } from "./playerLeave";
import { playerSpawnHandler } from "./playerSpawn";

export default [
    serverInformationHandler,
    worldChunkLoadHandler,
    worldChunkUpdateHandler,
    playerJoinHandler,
    playerLeaveHandler,
    playerSpawnHandler
];