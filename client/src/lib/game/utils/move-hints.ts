import {
    Container,
    FederatedPointerEvent,
    Graphics,
    Point,
    Rectangle
} from "pixi.js";

import { halfSquare, squareSize } from "../constants/squares";
import { Layer } from "../constants/Layer";
import { Entity, EntityEvents } from "../entity/Entity";

type SquareGenerator = () => Iterable<Point>;

export class MoveHints {
    entity: Entity;
    generateSquares: SquareGenerator;

    visible = false;
    squares: Point[] = [];

    private alreadyDropped = false;

    private hintContainers: Container[] = [];
    private activeHoverOutlines: Container[] = [];

    private entityListeners: Partial<EntityEvents> = {};
    private viewportClickListener?: (event: FederatedPointerEvent) => void;

    constructor(
        entity: Entity,
        squareGenerator: SquareGenerator
    ) {
        this.entity = entity;
        this.generateSquares = squareGenerator;
    
        // Show when entity is held
        this.entityListeners.hold = () => {
            if (!this.visible) this.show();
        };

        this.entity.on("hold", this.entityListeners.hold);

        // Hide when entity dropped and was put down since hints shown
        this.entityListeners.drop = () => {
            if (!this.alreadyDropped) {
                this.alreadyDropped = true;
                return;
            }

            if (this.visible) this.hide();
        };

        this.entity.on("drop", this.entityListeners.drop);

        // When entity is dropped on another square
        this.entityListeners.move = () => this.hide();

        this.entity.on("move", this.entityListeners.move);

        // When entity is dragged over hints
        this.entityListeners.drag = point => {
            const hoverOutline = this.getHoveredHint(point)
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

        this.entity.on("drag", this.entityListeners.drag);
    }

    private getHoveredHint(mouseWorldPoint: Point) {
        return this.hintContainers.find(hint => {
            const localPoint = hint.toLocal(
                mouseWorldPoint,
                this.entity.client.viewport
            );

            return hint.hitArea?.contains(localPoint.x, localPoint.y);
        });
    }

    detach() {
        this.hide();

        for (const event in this.entityListeners) {
            const eventType = event as keyof EntityEvents;
            this.entity.off(eventType, this.entityListeners[eventType]!);
        }
    }

    hide() {
        for (const container of this.hintContainers) {
            container.destroy();
        }

        this.entity.client.viewport.off("click",
            this.viewportClickListener
        );

        this.hintContainers = [];

        this.alreadyDropped = false;
        this.visible = false;
    }

    show() {
        if (this.visible) this.hide();

        const client = this.entity.client;
        const viewport = client.viewport;

        this.squares = [];

        for (const point of this.generateSquares()) {
            this.squares.push(point);

            const square = client.world.getLocalSquare(point.x, point.y);

            const container = new Container({
                x: point.x * squareSize,
                y: point.y * squareSize,
                zIndex: Layer.MOVE_HINTS,
                hitArea: new Rectangle(0, 0, squareSize, squareSize),
                eventMode: "static"
            });

            container.addChild(square?.entity
                ? new Graphics()
                    .circle(halfSquare, halfSquare, halfSquare)
                    .stroke({
                        alignment: 1,
                        width: 0.1 * squareSize,
                        color: "#ffffff25"
                    })
                : new Graphics()
                    .circle(halfSquare, halfSquare, 0.15 * squareSize)
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

            // When a move hint is clicked
            container.on("pointerdown", () => {
                this.entity.emit("drop", new Point(
                    point.x * squareSize,
                    point.y * squareSize
                ));

                const fromPosition = this.entity.position.clone();

                this.entity.setPosition(point, { animate: true });

                this.entity.emit("move", fromPosition, point,
                    () => this.entity.setPosition(fromPosition, {
                        cancellation: true
                    })
                );
                
                this.hide();
            });

            this.hintContainers.push(container);
            viewport.addChild(container);
        }

        // Hide hints when anywhere else is clicked
        this.viewportClickListener = event => {
            const worldPosition = viewport.toWorld(event.global);

            if (this.getHoveredHint(worldPosition)) return;

            if (this.entity.sprite.containsPoint(
                this.entity.sprite.toLocal(worldPosition, viewport)
            )) return;

            this.hide();
        };

        viewport.on("click", this.viewportClickListener);

        this.visible = true;
    }
}