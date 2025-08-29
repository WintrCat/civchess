import { World, WorldMetadata } from "shared/types/game/World";

export function getWorldMetadata(world: World): WorldMetadata {
    return {
        code: world.code,
        name: world.name,
        createdAt: world.createdAt,
        pinned: world.pinned,
        server: {
            lastOnlineAt: world.server.lastOnlineAt,
            maxPlayers: world.server.maxPlayers,
            online: true
        }
    };
}