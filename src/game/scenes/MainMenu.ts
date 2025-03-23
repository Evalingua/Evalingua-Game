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

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');
        
        this.music = this.sound.add('menu-sound', { loop: true, volume: 0.1 });
        this.music.play(); 
        
        this.logo = this.add.image(512, 300, 'logo').setDepth(100);
        
        this.title = this.add.text(512, 460, 'Presiona cualquier lugar de la pantalla\n para iniciar la evaluación', {
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
        this.music.stop();

        LevelManager.getInstance().startFirstLevel();
    }
}
