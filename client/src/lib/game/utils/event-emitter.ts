import EventEmitter from "eventemitter3";

type EventMap = Record<PropertyKey, (...args: any[]) => void>;

export class TypedEmitter<Events extends EventMap> extends EventEmitter {
    on<EventType extends keyof Events>(
        event: EventType,
        fn: Events[EventType]
    ) {
        return super.on(String(event), fn);
    }

    off<EventType extends keyof Events>(
        event: EventType,
        fn: Events[EventType]
    ) {
        return super.off(String(event), fn);
    }

    emit<EventType extends keyof Events>(
        event: EventType,
        ...args: Parameters<Events[EventType]>
    ) {
        return super.emit(String(event), ...args);
    }
}