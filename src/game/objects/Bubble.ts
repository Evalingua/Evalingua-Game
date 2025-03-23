import { Scene } from "phaser";
import { NasalesGame } from "../scenes/NasalesGame";

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
    private floatingTween: Phaser.Tweens.Tween | null = null;
    public isPopped: boolean;

    constructor(scene: Scene, config: BubbleConfig) {
        this.scene = scene;
        this.name = config.name;
        this.imageKey = config.imageKey;
        this.isPopped = false;
        this.isSelected = false;
        this.initialPosition = { x: config.x, y: config.y };

        this.create(config.x, config.y);
        this.setupInteraction();
    }

    private create(x: number, y: number): void {
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
                const nasalesScene = this.scene as NasalesGame;
                if (!nasalesScene.isBubbleActive()) {
                    this.moveToCenter();
                }
            }
        };

        this.bubbleSprite.on("pointerdown", handleClick);
        this.objectSprite.on("pointerdown", handleClick);
    }

    public addFloatingAnimation(): void {
        if (!this.isSelected && !this.isPopped && this.bubbleSprite && this.objectSprite) {
        // Detener animación anterior si existe
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }
        
        this.floatingTween = this.scene.tweens.add({
            targets: [this.bubbleSprite, this.objectSprite],
            y: this.initialPosition.y - 50,
            duration: 2000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });
    }
    }

    public moveToCenter(): void {
        this.isSelected = true;
        const scene = this.scene as NasalesGame;
        scene.onBubbleSelected(this);

        // Detener la animación de flotación actual
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }

        const centerX = this.initialPosition.x;
        const centerY = this.scene.cameras.main.centerY;

        this.scene.tweens.add({
            targets: [this.objectSprite],
            x: centerX,
            y: centerY,
            scale: 0.5,
            duration: 500,
            ease: "Power2",
        });

        this.scene.tweens.add({
            targets: [this.bubbleSprite],
            x: centerX,
            y: centerY,
            scale: 1.5,
            duration: 500,
            ease: "Power2"
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
        });

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

        // Detener cualquier animación existente
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }

        // Animación de explosión de la burbuja
        this.scene.tweens.add({
            targets: this.bubbleSprite,
            scale: 1.2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.bubbleSprite.destroy();

                const randomX = Phaser.Math.Between(100, this.scene.cameras.main.width - 100);
                const randomY = Phaser.Math.Between(100, 200); // Parte superior

                // Retornar solo el objeto a su posición inicial
                this.scene.tweens.add({
                    targets: this.objectSprite,
                    x: randomX,
                    y: randomY,
                    scale: 0.5,
                    duration: 500,
                    ease: "Power2",
                    onComplete: () => {
                        // Notificar a NasalesGame que se completó este objeto
                        const nasalesScene = this.scene as NasalesGame;
                        nasalesScene.onBubblePopped(this);
                    }
                });
            },
        });
    }

    public destroy(): void {
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }
        
        this.bubbleSprite.destroy();
        this.objectSprite.destroy();
    }

    public getBubbleSprite(): Phaser.GameObjects.Sprite {
    return this.bubbleSprite;
}

    public getObjectSprite(): Phaser.GameObjects.Sprite {
        return this.objectSprite;
    }

    public getName(): string {
        return this.name;
    }

    public isActive(): boolean {
        return this.isSelected;
    }

    public getPosition(): Position {
        return this.initialPosition;
    }

    public setPosition(x?: number, y?: number): void {
        if (x !== undefined) {
            this.initialPosition.x = x;
        }

        if (y !== undefined) {
            this.initialPosition.y = y;
        }

        this.bubbleSprite.setPosition(this.initialPosition.x, this.initialPosition.y);
        this.objectSprite.setPosition(this.initialPosition.x, this.initialPosition.y);
    }
}