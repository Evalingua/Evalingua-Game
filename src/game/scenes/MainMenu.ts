import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { LevelManager } from '../LevelManager';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    rectangleClick: GameObjects.Rectangle;
    music: Phaser.Sound.BaseSound;

    private baseWidth  = 1024;
    private baseHeight = 768;
    private logoXRatio = 512  / 1024; 
    private logoYRatio = 300  / 768;
    private titleXRatio= 512  / 1024;
    private titleYRatio= 460  / 768;

    constructor ()
    {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(0, 0, 'background')
        .setOrigin(0)
        .setScale(1);

        this.music = this.sound.add('menu-sound', { loop: true, volume: 0.1 });
        this.music.play();

        this.logo = this.add.image(0, 0, 'logo').setDepth(100);
        this.title = this.add.text(0, 0,
            'Presiona cualquier lugar de la pantalla\npara iniciar la evaluación',
        {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }
        ).setOrigin(0.5).setDepth(100);

        this.rectangleClick = this.add.rectangle(0, 0, this.baseWidth, this.baseHeight)
        .setOrigin(0)
        .setStrokeStyle(1, 0xffffff)
        .setInteractive();
        this.rectangleClick.on('pointerdown', () => this.changeScene());

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
        this.logo
        .setPosition(width * this.logoXRatio, height * this.logoYRatio)
        .setScale(coverScale);

        // Reposicionar texto
        this.title
        .setPosition(width * this.titleXRatio, height * this.titleYRatio)
        .setScale(coverScale);

        // Ajustar el área interactiva al canvas completo
        this.rectangleClick
        .setSize(width, height)
        .setPosition(0, 0);
    }
    
    changeScene ()
    {

        this.rectangleClick.disableInteractive(); 
        this.rectangleClick.destroy();
        this.music.stop();

        LevelManager.getInstance().startFirstLevel();
    }
}
