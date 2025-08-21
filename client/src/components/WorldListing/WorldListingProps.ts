import { WorldMetadata } from "shared/types/World";

export interface WorldListingProps {
    world: WorldMetadata;
    showDates?: boolean;
    showToolbar?: boolean;
    online?: boolean;
}