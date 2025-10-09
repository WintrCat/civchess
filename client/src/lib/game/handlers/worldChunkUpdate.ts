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

        const changes = { ...packet.changes, ...packet.runtimeChanges };

        for (const relPosIndex in changes) {
            const { x: relX, y: relY } = coordinateIndex(relPosIndex);
            const { x, y } = toGlobalPos(relX, relY);

            const localSquare = client.world.getLocalSquare(x, y);

            const change = changes[relPosIndex]!;

            localSquare?.update("id" in change
                ? { piece: change } : change
            );
        }
    }
});