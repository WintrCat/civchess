import { coordinateIndex } from "shared/types/world/OnlineWorld";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { createPacketHandler } from "../SocketClient";

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

            const update = changes[relPosIndex];

            localSquare?.update(!update || "id" in update
                ? { piece: update } : changes
            );
        }
    }
});