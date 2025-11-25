import { coordinateIndex } from "shared/lib/world-chunks";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { createPacketHandler } from "../SocketClient";

export const worldChunkUpdateHandler = createPacketHandler({
    type: "worldChunkUpdate",
    handle: (packet, client) => {
        const toGlobalPos = (relPosIndex: string) => {
            const { x: relX, y: relY } = coordinateIndex(relPosIndex);

            return {
                x: packet.x * chunkSquareCount + relX,
                y: packet.y * chunkSquareCount + relY
            }
        };

        for (const relPosIndex in packet.changes) {
            const { x, y } = toGlobalPos(relPosIndex);

            const localSquare = client.world.getLocalSquare(x, y);
            if (!localSquare) continue;

            const update = packet.changes[relPosIndex]!;

            if (update.type) localSquare.setType(update.type);
            if (update.piece) localSquare.setPiece(update.piece);
        }

        for (const relPosIndex in packet.runtimeChanges) {
            const { x, y } = toGlobalPos(relPosIndex);

            client.world.getLocalSquare(x, y)?.setPiece(
                packet.runtimeChanges[relPosIndex]!
            );
        }
    }
});