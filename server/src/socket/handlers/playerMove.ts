import { SquareType } from "shared/constants/SquareType";
import { PieceType } from "shared/constants/PieceType";
import { PieceMovePacket } from "shared/types/packets/clientbound/PieceMovePacket";
import { toPlayerPiece } from "shared/types/world/pieces/Player";
import { coordinateIndex, getChunkCoordinates } from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import {
    getSurroundingChunkPoints,
    getSurroundingChunks,
    getWorldChunkSize
} from "../lib/chunks";
import { getSquare, moveSquarePiece } from "../lib/chunks/squares";
import {
    chunkSubscriptionRoom,
    getChunkBroadcaster,
    setChunkSubscription
} from "../lib/chunks/subscribers";
import {
    emitPlayerDeath,
    getPlayer,
    getPlayerPath,
    getPlayerSocket
} from "../lib/players";
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

        // Validate move cooldown
        if (Date.now() < (player.moveCooldownExpiresAt || 0))
            return acknowledge({ cancelled: true });

        const playerUpdate = getRedisClient().createTransaction();
        const playerPath = getPlayerPath(player.userId);

        // Refresh move cooldown based on player's biome
        const toSquare = await getSquare(id.worldCode, packet.x, packet.y);
        if (!toSquare) return acknowledge({ cancelled: true });
        
        const cooldownExpiresAt = Date.now() + moveCooldowns[toSquare.type];

        await playerUpdate.json.set(id.worldCode,
            `${playerPath}.moveCooldownExpiresAt`,
            cooldownExpiresAt
        );

        // Prepare to broadcast move and maybe damage packet
        const { chunkX: fromChunkX, chunkY: fromChunkY } = (
            getChunkCoordinates(player.x, player.y)
        );

        const { chunkX, chunkY, relativeX, relativeY } = (
            getChunkCoordinates(packet.x, packet.y)
        );

        const fromChunkRoom = chunkSubscriptionRoom(
            id.worldCode, fromChunkX, fromChunkY
        );

        const movement: PieceMovePacket = {
            fromX: player.x,
            fromY: player.y,
            toX: packet.x,
            toY: packet.y
        };

        // Deal damage and reject move if moving to other player's square
        const toRuntimeSquare = await getSquare(
            id.worldCode, packet.x, packet.y, "runtime"
        );

        if (toRuntimeSquare?.id == PieceType.PLAYER) {
            const newHealth = await getRedisClient().json.incr(
                id.worldCode,
                `${getPlayerPath(toRuntimeSquare.userId)}.health`,
                -1
            );

            const victimSocket = await getPlayerSocket(toRuntimeSquare.userId);
            if (!victimSocket) return acknowledge({ cancelled: true });

            sendPacket("playerHealth", { newHealth }, victimSocket);

            if (newHealth > 0) {
                await playerUpdate.exec();
                
                sendPacket("pieceMove", { ...movement, attack: true },
                    socket.broadcast.to(fromChunkRoom)
                );

                return acknowledge({
                    cancelled: true,
                    attack: true,
                    cooldownExpiresAt
                });
            } else {
                emitPlayerDeath(toRuntimeSquare.userId);
            }
        }

        // Update player location and move piece to square
        await playerUpdate.json.set(id.worldCode,
            `${playerPath}.x`, packet.x
        );

        await playerUpdate.json.set(id.worldCode,
            `${playerPath}.y`, packet.y
        );

        await playerUpdate.exec();

        await moveSquarePiece(id.worldCode,
            player.x, player.y,
            packet.x, packet.y,
        "runtime");

        // Broadcast move packet to chunk subscribers
        sendPacket("pieceMove", movement,
            socket.broadcast.to(fromChunkRoom)
        );

        // Broadcast to those where the player is entering their view
        sendPacket("worldChunkUpdate", {
            x: chunkX,
            y: chunkY,
            runtimeChanges: {
                [coordinateIndex(relativeX, relativeY)]: toPlayerPiece(
                    player, id.profile.name
                )
            }
        }, getChunkBroadcaster(
            socket, id.worldCode, chunkX, chunkY
        ).except(fromChunkRoom));

        // Diff chunks and load new ones, discarding old ones
        if (fromChunkX != chunkX || fromChunkY != chunkY) {
            const discardedChunks = getSurroundingChunkPoints({
                chunkX: fromChunkX,
                chunkY: fromChunkY,
                worldChunkSize: worldChunkSize,
                worldCode: id.worldCode,
                differenceFrom: {
                    prevChunkX: chunkX,
                    prevChunkY: chunkY
                }
            });

            for (const discardedChunk of discardedChunks) {
                setChunkSubscription(socket,
                    discardedChunk.x, discardedChunk.y, false
                );
            }

            const newChunks = getSurroundingChunks({
                chunkX, chunkY, worldChunkSize,
                worldCode: id.worldCode,
                differenceFrom: {
                    prevChunkX: fromChunkX,
                    prevChunkY: fromChunkY
                }
            });
            
            for await (const chunkData of newChunks) {
                setChunkSubscription(socket, chunkData.x, chunkData.y, true);
                sendPacket("worldChunkLoad", chunkData, socket);
            }
        }

        acknowledge({ cancelled: false, cooldownExpiresAt });
    }
});