import { SquareType } from "shared/constants/SquareType";
import { toPlayerPiece } from "shared/types/world/pieces/Player";
import {
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingPositions
} from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import {
    getRenderDistance,
    getSurroundingChunks,
    getWorldChunkSize
} from "../lib/chunks";
import { getSquare, moveSquarePiece } from "../lib/chunks/squares";
import {
    chunkSubscriptionRoom,
    getChunkBroadcaster,
    setChunkSubscription
} from "../lib/chunks/subscribers";
import { getPlayer, updatePlayer } from "../lib/players";
import { createPacketHandler, sendPacket } from "../packets";

const moveCooldowns: Record<SquareType, number> = {
    [SquareType.GRASSLAND]: 800,
    [SquareType.DESERT]: 1200,
    [SquareType.OCEAN]: 2000
};

export const playerMoveHandler = createPacketHandler({
    type: "playerMove",
    handle: async (packet, socket, acknowledge) => {
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

        // Validate player movement cooldown
        if (Date.now() < (player.moveCooldownExpiresAt || 0))
            return acknowledge({ success: false });

        // Extend movement cooldown
        const toSquare = await getSquare(id.worldCode, packet.x, packet.y);
        if (!toSquare) return acknowledge({ success: false });

        // Update player location, cooldown, and move piece to square
        const playerUpdate = getRedisClient().asPipeline();

        const cooldownExpiresAt = Date.now() + moveCooldowns[toSquare.type];

        await updatePlayer(
            id.worldCode,
            player.userId, "moveCooldownExpiresAt",
            cooldownExpiresAt,
            playerUpdate
        )

        await updatePlayer(
            id.worldCode,
            player.userId, "x", packet.x,
            playerUpdate
        );

        await updatePlayer(
            id.worldCode,
            player.userId, "y", packet.y,
            playerUpdate
        );

        await playerUpdate.exec();

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

        // Load and subscribe to chunks that are now within view
        if (oldChunkX != chunkX || oldChunkY != chunkY) {
            getSurroundingPositions(player.x, player.y, {
                includeCenter: true,
                radius: getRenderDistance(),
                max: worldChunkSize
            }).forEach(chunk => setChunkSubscription(
                socket, chunk.x, chunk.y, false
            ));

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

        // Return movement response to client
        acknowledge({ success: true, cooldownExpiresAt });
    }
});