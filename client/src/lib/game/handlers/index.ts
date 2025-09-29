import { serverInformationHandler } from "./serverInformation";
import { worldChunkHandler } from "./worldChunk";
import { playerJoinHandler } from "./playerJoin";
import { playerLeaveHandler } from "./playerLeave";

export default [
    serverInformationHandler,
    worldChunkHandler,
    playerJoinHandler,
    playerLeaveHandler
];