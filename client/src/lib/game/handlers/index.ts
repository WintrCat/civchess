import { serverInformationHandler } from "./serverInformation";
import { worldChunkLoadHandler } from "./worldChunkLoad";
import { playerJoinHandler } from "./playerJoin";
import { playerLeaveHandler } from "./playerLeave";
import { playerSpawnHandler } from "./playerSpawn";

export default [
    serverInformationHandler,
    worldChunkLoadHandler,
    playerJoinHandler,
    playerLeaveHandler,
    playerSpawnHandler
];