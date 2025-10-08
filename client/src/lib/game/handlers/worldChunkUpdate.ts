import { coordinateIndex } from "shared/types/world/OnlineWorld";

import { createPacketHandler } from "../SocketClient";
import { chunkSquareCount } from "shared/lib/world-chunks";

export const worldChunkUpdateHandler = createPacketHandler({
    type: "worldChunkUpdate",
    handle: (packet, client) => {
        for (const changes of [packet.changes, packet.runtimeChanges]) {
            for (const relPosition in changes) {
                const { x: relX, y: relY } = coordinateIndex(relPosition);

                const squareX = packet.x * chunkSquareCount + relX;
                const squareY = packet.y * chunkSquareCount + relY;

                client.world.setLocalSquare(
                    squareX, squareY,
                    client.world.pieceToEntity(
                        squareX, squareY, changes[relPosition]!
                    ),
                    changes == packet.changes ? "persistent" : "runtime"
                );
            }
        }
    }
});