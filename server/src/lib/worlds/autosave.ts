import { getRedisClient, getRedisSubClient } from "@/database/redis";
import { config } from "../config";
import { saveWorld } from "./server";

const autosaveScheduleChannel = "scheduleAutosave";
const autosaveClearChannel = "clearAutosave";

const autosaveInterval = config.autosaveInterval * 1000;

const autosaveSchedules: Record<string, NodeJS.Timeout> = {};

export function autosaveLockKey(worldCode: string) {
    return `${worldCode}:autosave-lock`;
}

export function attachAutosaveService() {
    const callClient = getRedisClient();
    const subClient = getRedisSubClient();

    subClient.subscribe(autosaveScheduleChannel);

    subClient.on("message", (channel, worldCode) => {
        if (channel == autosaveScheduleChannel) {
            autosaveSchedules[worldCode] = setInterval(async () => {
                const lockAttempt = await callClient.call(
                    "SET",
                    autosaveLockKey(worldCode),
                    "1",
                    "NX",
                    "PX",
                    autosaveInterval
                ) as "OK" | null;
                if (lockAttempt == null) return;

                await saveWorld(worldCode);
            }, autosaveInterval + 1000);
        }

        if (channel == autosaveClearChannel) {
            clearInterval(autosaveSchedules[worldCode]);
            delete autosaveSchedules[worldCode];
        }
    });
}

export function scheduleAutosaver(worldCode: string, enabled: boolean) {
    const channel = enabled
        ? autosaveScheduleChannel
        : autosaveClearChannel;

    getRedisClient().publish(channel, worldCode);
}