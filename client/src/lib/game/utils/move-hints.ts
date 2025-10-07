import { Container, Graphics, Point } from "pixi.js";

import { squareSize } from "@/constants/squares";
import { Entity, EntityEvents } from "../entity/Entity";
import { squareWorldPosition } from "./world-position";

export class MoveHints {
    entity: Entity;
    squareGenerator: () => Point[];

    visible = false;

    private hintContainers = new Set<Container>();

    private entityDragListener?: EntityEvents["drag"];
    private entityDropListener?: EntityEvents["drop"];

    constructor(
        entity: Entity,
        squareGenerator: () => Point[]
    ) {
        this.entity = entity;
        this.squareGenerator = squareGenerator;
    }

    clear() {
        for (const container of this.hintContainers)
            container.destroy();

        this.hintContainers.clear();

        if (this.entityDragListener)
            this.entity.off("drag", this.entityDragListener);

        if (this.entityDropListener)
            this.entity.off("drop", this.entityDropListener);

        this.entityDragListener = undefined;
        this.entityDropListener = undefined;

        this.visible = false;
    }

    render() {
        this.clear();

        const squares = this.squareGenerator();

        // Remove hints when piece is dropped
        const dropListener: EntityEvents["drop"] = (from, to, cancel) => {
            this.clear();

            if (!squares.some(square => square.equals(to))) cancel?.();
        };

        this.entityDropListener = dropListener;
        this.entity.on("drop", dropListener);

        // Generate move hint objects
        for (const square of squares) {
            const moveHintContainer = new Container();

            const squareCorner = new Point(
                square.x * squareSize,
                square.y * squareSize
            );
            const squarePosition = squareWorldPosition(square.x, square.y);

            // Square container with correct hover area
            const moveHintSquare = new Graphics()
                .rect(squareCorner.x, squareCorner.y, squareSize, squareSize)
                .fill("#00000000");
            moveHintSquare.eventMode = "static";
            moveHintSquare.zIndex = 1;
            moveHintContainer.addChild(moveHintSquare);

            // Move Hint circle
            moveHintContainer.addChild(new Graphics()
                .circle(squarePosition.x, squarePosition.y, 0.15 * squareSize)
                .fill("#ffffff25")
            );

            // Inset outline when square is hovered with piece
            const hoverOutline = new Graphics()
                .rect(
                    squareCorner.x, squareCorner.y,
                    squareSize, squareSize
                )
                .stroke({
                    width: 0.05 * squareSize,
                    color: "#ffffff",
                    alignment: 1
                });

            // Outline hovered move hint squares
            const dragListener: EntityEvents["drag"] = point => {
                if (moveHintSquare.containsPoint(point)) {
                    moveHintContainer.addChild(hoverOutline);
                } else {
                    moveHintContainer.removeChild(hoverOutline);
                }
            };

            this.entityDragListener = dragListener;
            this.entity.on("drag", dragListener);          

            // Move when a hint is clicked
            moveHintSquare.on("pointerdown", () => {
                this.entity.setPosition(square.x, square.y);

                this.entity.emit("drop",
                    this.entity.position,
                    new Point(square.x, square.y)
                );
            });
            
            this.entity.client.viewport.addChild(moveHintContainer);
            this.hintContainers.add(moveHintContainer);
        }

        this.visible = true;
    }
}