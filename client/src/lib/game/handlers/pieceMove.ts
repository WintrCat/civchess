import { createPacketHandler } from "../SocketClient";

export const pieceMoveHandler = createPacketHandler({
    type: "pieceMove",
    handle: (packet, client) => {
        console.log("piece move packet received!");
        console.log(packet);
    }
});