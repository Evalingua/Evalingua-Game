import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;
    rectangleClick: Phaser.GameObjects.Rectangle;
    music: Phaser.Sound.BaseSound;
    handPointer: Phaser.GameObjects.Sprite;

    private baseWidth  = 1024;
    private baseHeight = 768;
    private logoXRatio = 312  / 1024; 
    private logoYRatio = 300  / 768;
    private bubbleXRatio= 460  / 1024;
    private bubbleYShow= 500  / 768;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xffff10);

        this.handPointer = this.add.sprite(0, 0, "hand_pointer").setScale(2).setOrigin(0).setDepth(100);
        this.handPointer.setVisible(true);
        this.anims.create({
            key: "handPointerAnimation",
            frames: this.anims.generateFrameNumbers("hand_pointer", { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1,
            yoyo: true
        });
        this.handPointer.play("handPointerAnimation");

        this.background = this.add.image(0, 0, 'background');
        this.background.setOrigin(0);
        this.background.setScale(1);
        this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(0, 0, 'Buen juego', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setDepth(100);

        this.rectangleClick = this.add.rectangle(0, 0, this.baseWidth, this.baseHeight)
            .setStrokeStyle(1, 0xffffff)
            .setOrigin(0)
            .setInteractive();
        this.rectangleClick.on('pointerdown', () => {
            this.changeScene();
        });

        this.scale.on('resize', this.onResize, this);

        const { width, height } = this.scale.gameSize;
        this.onResize({ width, height });
        
        EventBus.emit('current-scene-ready', this);
    }

    private onResize(gameSize: { width: number; height: number }) {
        const { width, height } = gameSize;

        // Escala tipo "cover" para el fondo
        const scaleX = width  / this.baseWidth;
        const scaleY = height / this.baseHeight;
        const coverScale = Math.max(scaleX, scaleY);

        this.background
        .setScale(coverScale)
        .setPosition(
            (width  - this.baseWidth  * coverScale) * 0.5,
            (height - this.baseHeight * coverScale) * 0.5
        );

        // Reposicionar logo
        this.gameOverText
        .setPosition(width * this.logoXRatio, height * this.logoYRatio)
        .setScale(coverScale);

        // Ajustar el área interactiva al canvas completo
        this.rectangleClick
        .setSize(width, height)
        .setPosition(0, 0);

        this.handPointer
        .setPosition(width * this.bubbleXRatio, height * this.bubbleYShow);
    }

    changeScene ()
    {
        this.rectangleClick.disableInteractive(); 
        this.rectangleClick.destroy();
        this.gameOverText.destroy();

        EventBus.emit('game-over');
    }
}
