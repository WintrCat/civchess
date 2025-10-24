import { coordinateIndex, chunkSquareCount } from "shared/lib/world-chunks";
import { LocalChunk } from "../world/LocalChunk";
import { LocalSquare } from "../world/LocalSquare";
import { createPacketHandler } from "../SocketClient";

export const worldChunkLoadHandler = createPacketHandler({
    type: "worldChunkLoad",
    handle: (packet, client) => {
        const squares = packet.chunk.squares.map((row, relY) => (
            row.map((square, relX) => {
                const x = packet.x * chunkSquareCount + relX;
                const y = packet.y * chunkSquareCount + relY;

                const persistentEntity = square.piece && client.world
                    .pieceToEntity(x, y, square.piece);

                const runtimePiece = packet.runtimeChunk[
                    coordinateIndex(relX, relY)
                ];

                const runtimeEntity = runtimePiece && (
                    client.world.isLocalPlayer(runtimePiece)
                        ? client.world.localPlayer
                        : client.world.pieceToEntity(x, y, runtimePiece)
                );

                const entity = (persistentEntity || runtimeEntity)?.spawn();

                return new LocalSquare(client, x, y, square.type, entity);
            })
        ));

        client.world.setLocalChunk(packet.x, packet.y,
            new LocalChunk(client.world, squares)
        );
    }
});