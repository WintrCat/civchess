import { toPlayerPiece } from "shared/types/world/pieces/Player";
import {
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingPositions
} from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { SocketIdentity } from "@/types/SocketIdentity";
import {
    getRenderDistance,
    getSurroundingChunks,
    getWorldChunkSize
} from "../lib/chunks";
import { moveSquarePiece } from "../lib/chunks/squares";
import {
    chunkSubscriptionRoom,
    getChunkBroadcaster,
    setChunkSubscription
} from "../lib/chunks/subscribers";
import { getPlayer, setPlayerPosition } from "../lib/players";
import { createPacketHandler, sendPacket } from "../packets";

export const playerMoveHandler = createPacketHandler({
    type: "playerMove",
    handle: async (packet, socket) => {
        const id = socket.data as SocketIdentity;

        // Validate that coordinates are legal for player
        const player = await getPlayer(id.worldCode, id.profile.userId);
        if (!player) throw new Error();

        const worldChunkSize = await getWorldChunkSize(id.worldCode);

        const legalMoves = getLegalKingMoves(
            player.x, player.y, worldChunkSize
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
        const { chunkX: oldChunkX, chunkY: oldChunkY } = (
            getChunkCoordinates(player.x, player.y)
        );

        const { chunkX, chunkY, relativeX, relativeY } = (
            getChunkCoordinates(packet.x, packet.y)
        );

        sendPacket(socket, "pieceMove", {
            layer: "runtime",
            fromX: player.x,
            fromY: player.y,
            toX: packet.x,
            toY: packet.y
        }, () => getChunkBroadcaster(
            socket, id.worldCode, oldChunkX, oldChunkY
        ));

        // Broadcast to those where the player is entering their view
        const newWatchers = getChunkBroadcaster(
            socket, id.worldCode, chunkX, chunkY
        ).except(
            chunkSubscriptionRoom(id.worldCode, oldChunkX, oldChunkY)
        );

        sendPacket(newWatchers, "worldChunkUpdate", {
            x: chunkX,
            y: chunkY,
            runtimeChanges: {
                [coordinateIndex(relativeX, relativeY)]: toPlayerPiece(
                    player, id.profile.name
                )
            }
        });

        if (oldChunkX != chunkX || oldChunkY != chunkY) {
            getSurroundingPositions(player.x, player.y, {
                includeCenter: true,
                radius: getRenderDistance(),
                max: worldChunkSize
            }).forEach(chunk => setChunkSubscription(
                socket, chunk.x, chunk.y, false
            ));

            // Load and subscribe to chunks that are now within view
            const newChunks = getSurroundingChunks(
                id.worldCode, packet.x, packet.y, {
                    previousSquareX: player.x,
                    previousSquareY: player.y
                }
            );
            
            for await (const chunkData of newChunks) {
                setChunkSubscription(socket, chunkData.x, chunkData.y, true);
                sendPacket(socket, "worldChunkLoad", chunkData);
            }
        }
    }
});