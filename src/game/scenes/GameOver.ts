import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;
    title: Phaser.GameObjects.Text;
    rectangleClick: Phaser.GameObjects.Rectangle;
    music: Phaser.Sound.BaseSound;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.title = this.add.text(512, 460, 'Presiona cualquier lugar de la pantalla\n para continuar', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.rectangleClick = this.add.rectangle(512, 384, 1024, 768).setStrokeStyle(1, 0xffffff).setInteractive();
        this.rectangleClick.on('pointerdown', () => {
            this.changeScene();
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.rectangleClick.disableInteractive(); 
        this.rectangleClick.destroy();
        this.gameOverText.destroy();
        this.title.destroy();

        EventBus.emit('game-over');
    }
}
