import { createPacketHandler, sendPacket } from "../packets";

export const playerJoinHandler = createPacketHandler("playerJoin",
    (packet, socket) => {
        console.log(packet);
        
        sendPacket(socket, "serverInformation", {
            players: ["wintrcat"]
        });
    }
);