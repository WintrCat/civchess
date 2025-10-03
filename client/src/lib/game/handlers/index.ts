import { serverInformationHandler } from "./serverInformation";
import { worldChunkHandler } from "./worldChunk";
import { playerJoinHandler } from "./playerJoin";
import { playerLeaveHandler } from "./playerLeave";
import { playerSpawnHandler } from "./playerSpawn";

export default [
    serverInformationHandler,
    worldChunkHandler,
    playerJoinHandler,
    playerLeaveHandler,
    playerSpawnHandler
];