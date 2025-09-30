export function getNearestSpawnLocation(
    worldCode: string,
    originX: number,
    originY: number
) {
    // find nearest safe square to spawn, or maybe return origin square
    // if it is not obstructed anyway. BFS with exponential distances
    // to find this and return { x: number, y: number } location.
}