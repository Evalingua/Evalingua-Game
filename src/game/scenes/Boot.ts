import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/background/bg.webp');
        this.load.image('bg_jungle', 'assets/background/Jungle.png');
        this.load.image('bg_desert', 'assets/background/Desert.webp');
        this.load.image('bg_beach', 'assets/background/Beach.webp');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
