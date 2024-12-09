import { Scene } from "phaser";
import { Game } from "../scenes/Game";


export interface BubbleConfig {
    name: string;
    imageKey: string;
    x: number;
    y: number;
}

export interface ObjectConfig {
    name: string;
    imageKey: string;
}

export interface Position {
    x: number;
    y: number;
}

export class Bubble {
    private scene: Scene;
    private bubbleSprite: Phaser.GameObjects.Sprite;
    private objectSprite: Phaser.GameObjects.Sprite;
    private readonly name: string;
    private readonly imageKey: string;
    private initialPosition: Position;
    private isSelected: boolean;
    public isPopped: boolean;

    constructor(scene: Scene, config: BubbleConfig) {
        this.scene = scene;
        this.name = config.name;
        this.imageKey = config.imageKey;
        this.isPopped = false;
        this.isSelected = false;
        this.initialPosition = { x: config.x, y: config.y };

        this.create(config.x, config.y);
        this.addFloatingAnimation();
        this.setupInteraction();
    }

    private create(x: number, y: number): void {
        // Crear la burbuja
        this.objectSprite = this.scene.add.sprite(x, y, this.imageKey);
        this.objectSprite.setScale(0.3);
        this.objectSprite.setVisible(true);

        this.bubbleSprite = this.scene.add.sprite(x, y, "bubble");
        this.bubbleSprite.setScale(0.8);
    }

    private setupInteraction(): void {
        this.bubbleSprite.setInteractive();
        this.objectSprite.setInteractive();

        const handleClick = () => {
            if (!this.isPopped && !this.isSelected) {
                this.moveToCenter();
            }
        };

        this.bubbleSprite.on("pointerdown", handleClick);
        this.objectSprite.on("pointerdown", handleClick);
    }

    private addFloatingAnimation(): void {
        if (!this.isSelected) {
            this.scene.tweens.add({
                targets: [this.bubbleSprite, this.objectSprite],
                y: this.bubbleSprite.y - 50,
                duration: 2000,
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
            });
        }
    }

    public moveToCenter(): void {
        this.isSelected = true;

        // Detener la animación de flotación actual
        this.scene.tweens.killTweensOf([this.bubbleSprite, this.objectSprite]);

        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;

        this.scene.tweens.add({
            targets: [this.objectSprite],
            x: centerX,
            y: centerY,
            scale: 0.5,
            duration: 500,
            ease: "Power2",
        });
        // Animar el movimiento al centro
        this.scene.tweens.add({
            targets: [this.bubbleSprite],
            x: centerX,
            y: centerY,
            scale: 1.5,
            duration: 500,
            ease: "Power2",
            onComplete: () => {
                // Notificar a la escena que esta burbuja está seleccionada
                const scene = this.scene as Game;
                scene.onBubbleSelected(this);
            },
        });
    }

    public returnToPosition(): void {
        this.isSelected = false;

        this.scene.tweens.add({
            targets: [this.objectSprite],
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            scale: 0.3,
            duration: 500,
            ease: "Power2",
        })

        this.scene.tweens.add({
            targets: [this.bubbleSprite],
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            duration: 500,
            scale: 0.8,
            ease: "Power2",
            onComplete: () => {
                this.addFloatingAnimation();
            },
        });
    }

    public pop(): void {
        if (this.isPopped) return;

        this.isPopped = true;

        // Animación de explosión de la burbuja
        this.scene.tweens.add({
            targets: this.bubbleSprite,
            scale: 1.2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.bubbleSprite.destroy();

                // Retornar solo el objeto a su posición inicial
                this.scene.tweens.add({
                    targets: this.objectSprite,
                    x: this.initialPosition.x,
                    y: this.initialPosition.y,
                    scale: 1.5,
                    duration: 500,
                    ease: "Power2",
                });
            },
        });
    }

    public destroy(): void {
        this.bubbleSprite.destroy();
        this.objectSprite.destroy();
    }

    public getName(): string {
        return this.name;
    }

    public isActive(): boolean {
        return this.isSelected;
    }
}