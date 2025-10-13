import { Container, Graphics, Point, Rectangle } from "pixi.js";

import { squareSize } from "@/constants/squares";
import { Entity, EntityEvents } from "../entity/Entity";

type SquareGenerator = () => Point[];

type EntityListeners = {
    [K in keyof EntityEvents]: EntityEvents[K][];
};

export class MoveHints {
    entity: Entity;
    generateSquares: SquareGenerator;

    visible = false;

    private hintContainers: Container[] = [];
    private activeHoverOutlines: Container[] = [];

    private entityListeners: EntityListeners = {
        drag: [], drop: [], hold: [], move: []
    };

    constructor(
        entity: Entity,
        squareGenerator: SquareGenerator
    ) {
        this.entity = entity;
        this.generateSquares = squareGenerator;

        entity.on("hold", () => {
            this.render();
        });
    }

    clear() {
        for (const container of this.hintContainers)
            container.destroy();

        this.hintContainers = [];

        const listenerPairs = Object.entries(this.entityListeners);

        for (const [event, listeners] of listenerPairs) {
            for (const listener of listeners) {
                this.entity.off(event as keyof EntityEvents, listener);
            }
        }

        this.visible = false;
    }

    render() {
        console.log("rendered");

        if (this.visible) this.clear();

        for (const square of this.generateSquares()) {
            const container = new Container({
                x: square.x * squareSize,
                y: square.y * squareSize,
                hitArea: new Rectangle(
                    square.x * squareSize, square.y * squareSize,
                    squareSize, squareSize
                ),
                eventMode: "static"
            });

            container.addChild(new Graphics()
                .circle(squareSize / 2, squareSize / 2, 0.15 * squareSize)
                .fill("#ffffff25")
            );

            container.addChild(
                new Graphics({ label: "hover", visible: false })
                    .rect(0, 0, squareSize, squareSize)
                    .stroke({
                        width: 0.05 * squareSize,
                        color: "#ffffff",
                        alignment: 1
                    })
            );

            this.hintContainers.push(container);
            this.entity.client.viewport.addChild(container);
        }

        // When entity is dragged over hints
        const entityDragListener: EntityEvents["drag"] = point => {
            const hoverOutline = this.hintContainers
                .find(hint => hint.hitArea?.contains(point.x, point.y))
                ?.getChildByLabel("hover");

            for (const outline of this.activeHoverOutlines) {
                outline.visible = false;
            }

            this.activeHoverOutlines = [];

            if (hoverOutline) {
                hoverOutline.visible = true;
                this.activeHoverOutlines.push(hoverOutline);
            }
        };

        this.entityListeners.drag.push(entityDragListener);
        this.entity.on("drag", entityDragListener);

        // When entity is dropped
        const entityDropListener: EntityEvents["drop"] = () => {
            console.log("dropped");
            this.clear();
        };

        this.entityListeners.drop.push(entityDropListener);
        this.entity.on("drop", entityDropListener);

        this.visible = true;
    }
}