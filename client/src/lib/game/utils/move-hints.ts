import { Container, Graphics, Point } from "pixi.js";

import { squareSize } from "@/constants/squares";
import { Entity, EntityEvents } from "../entity/Entity";
import { InitialisedGameClient } from "../Client";
import { toWorldPosition } from "./square-position";

export class MoveHints {
    client: InitialisedGameClient;
    entity: Entity;
    squares: Point[];

    visible = false;

    private hintContainers = new Set<Container>();

    private entityDragListeners = new Set<EntityEvents["drag"]>();
    private entityDropListeners = new Set<EntityEvents["drop"]>();

    constructor(
        client: InitialisedGameClient,
        entity: Entity,
        squares: Point[]
    ) {
        this.client = client;
        this.entity = entity;
        this.squares = squares;
    }

    hide() {
        for (const container of this.hintContainers)
            container.destroy();

        this.hintContainers.clear();

        this.entityDragListeners.forEach(
            listener => this.entity.off("drag", listener)
        );

        this.entityDropListeners.forEach(
            listener => this.entity.off("drop", listener)
        );

        this.entityDragListeners.clear();
        this.entityDropListeners.clear();

        this.visible = false;
    }

    show() {
        for (const square of this.squares) {
            const moveHintContainer = new Container();

            const squareCorner = new Point(
                square.x * squareSize,
                square.y * squareSize
            );
            const squarePosition = toWorldPosition(square.x, square.y);

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

            this.entityDragListeners.add(dragListener);
            this.entity.on("drag", dragListener);

            // Remove hints when piece is dropped
            const dropListener: EntityEvents["drop"] = (newX, newY) => {
                if (newX != square.x || newY != square.y) return;
                this.hide();
            };

            this.entityDropListeners.add(dropListener);
            this.entity.on("drop", dropListener);            

            // Move when a hint is clicked
            moveHintSquare.on("pointerdown", () => {
                this.entity.setPosition(square.x, square.y);
                this.entity.emit("drop", square.x, square.y);
                
                this.hide();
            });
            
            this.client.viewport.addChild(moveHintContainer);
            this.hintContainers.add(moveHintContainer);
        }

        this.visible = true;
    }
}