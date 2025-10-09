import { coordinateIndex } from "shared/types/world/OnlineWorld";

import { createPacketHandler } from "../SocketClient";
import { chunkSquareCount } from "shared/lib/world-chunks";

export const worldChunkUpdateHandler = createPacketHandler({
    type: "worldChunkUpdate",
    handle: (packet, client) => {
        const toGlobalPos = (relX: number, relY: number) => ({
            x: packet.x * chunkSquareCount + relX,
            y: packet.y * chunkSquareCount + relY
        });

        for (const relPos in packet.changes) {
            const { x: relX, y: relY } = coordinateIndex(relPos);
            const { x, y } = toGlobalPos(relX, relY);

            const update = packet.changes[relPos]!;

            const localSquare = client.world.getLocalSquare(x, y);
            if (!localSquare) continue;

            localSquare.piece?.despawn();

            client.world.setLocalSquare(x, y, {
                ...localSquare,
                ...update,
                piece: update.piece && client.world
                    .pieceToEntity(x, y, update.piece)
                    .spawn()
            });

            // CHANGE SQUARE TYPE IN ACTUAL SPRITE
        }

        for (const relPos in packet.runtimeChanges) {
            const { x: relX, y: relY } = coordinateIndex(relPos);
            const { x, y } = toGlobalPos(relX, relY);

            const localSquare = client.world.getLocalSquare(x, y);
            if (!localSquare) continue;

            localSquare.piece = client.world
                .pieceToEntity(x, y, packet.runtimeChanges[relPos]!)
                .spawn();
        }
    }
});