import { getChunkCoordinates } from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getSurroundingChunks, getWorldChunkSize } from "../lib/chunks";
import { moveSquarePiece } from "../lib/chunks/squares";
import { getChunkBroadcaster } from "../lib/chunks/subscribers";
import { getPlayer, setPlayerPosition } from "../lib/players";
import { createPacketHandler, sendPacket } from "../packets";

export const playerMoveHandler = createPacketHandler({
    type: "playerMove",
    handle: async (packet, socket) => {
        const id = socket.data as SocketIdentity;

        // Validate that coordinates are legal for player
        const player = await getPlayer(id.worldCode, id.profile.userId);
        if (!player) throw new Error();

        const legalMoves = getLegalKingMoves(player.x, player.y,
            await getWorldChunkSize(id.worldCode)
        );

        if (!legalMoves.has(packet.x, packet.y))
            throw new Error("Illegal player movement.");

        // Update player data and move piece in runtime chunk
        await setPlayerPosition(id.worldCode,
            player.userId, packet.x, packet.y
        );

        await moveSquarePiece(id.worldCode,
            player.x, player.y,
            packet.x, packet.y,
        "runtime");

        // Broadcast move packet to chunk subscribers
        const { chunkX, chunkY } = getChunkCoordinates(packet.x, packet.y);

        sendPacket(socket, "pieceMove", {
            layer: "runtime",
            fromX: player.x,
            fromY: player.y,
            toX: packet.x,
            toY: packet.y
        }, sender => getChunkBroadcaster(
            sender, id.worldCode, chunkX, chunkY
        ));

        // Load any chunks that are now in render distance after move
        const {
            chunkX: oldChunkX,
            chunkY: oldChunkY
        } = getChunkCoordinates(player.x, player.y);

        if (oldChunkX != chunkX || oldChunkY != chunkY) {
            const newChunks = await getSurroundingChunks(
                id.worldCode, packet.x, packet.y, {
                    previousSquareX: player.x,
                    previousSquareY: player.y
                }
            );

            for await (const chunkData of newChunks) {
                sendPacket(socket, "worldChunkLoad", chunkData);
            }
        }
    }
});