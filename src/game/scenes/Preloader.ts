import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.audio('menu-sound', 'sounds/menu_sound.webm');
        this.load.audio('nasales-sound', 'sounds/nasales_level_sound.webm');

        this.load.image('logo', 'logo.png');
        this.load.image('bubble', 'object/bubble.png');

        this.load.image('araña', 'object/araña.png');
        this.load.image('arete', 'object/arete.png');
        this.load.image('bebe', 'object/bebe.png');
        this.load.image('boca', 'object/boca.png');
        this.load.image('boton', 'object/boton.png');
        this.load.image('cafe', 'object/cafe.png');
        this.load.image('cama', 'object/cama.png');
        this.load.image('casa', 'object/casa.png');
        this.load.image('chancho', 'object/chancho.png');
        this.load.image('codo', 'object/codo.png');
        this.load.image('collar', 'object/collar.png');
        this.load.image('dedo', 'object/dedo.png');
        this.load.image('falda', 'object/falda.png');
        this.load.image('foco', 'object/foco.png');
        this.load.image('gato', 'object/gato.png');
        this.load.image('guantes', 'object/guantes.png');
        this.load.image('huevo', 'object/huevo.png');
        this.load.image('jabon', 'object/jabon.png');
        this.load.image('jaula', 'object/jaula.png');
        this.load.image('lapiz', 'object/lapiz.png');
        this.load.image('leon', 'object/leon.png');
        this.load.image('luna', 'object/luna.png');
        this.load.image('mano', 'object/mano.png');
        this.load.image('mesa', 'object/mesa.png');
        this.load.image('nariz', 'object/nariz.png');
        this.load.image('ojo', 'object/ojo.png');
        this.load.image('pared', 'object/pared.png');
        this.load.image('pato', 'object/pato.png');
        this.load.image('payaso', 'object/payaso.png');
        this.load.image('peine', 'object/peine.png');
        this.load.image('pelota', 'object/pelota.png');
        this.load.image('pie', 'object/pie.png');
        this.load.image('piña', 'object/piña.png');
        this.load.image('polo', 'object/polo.png');
        this.load.image('raton', 'object/raton.png');
        this.load.image('reloj', 'object/reloj.png');
        this.load.image('soga', 'object/soga.png');
        this.load.image('sol', 'object/sol.png');
        this.load.image('tapa', 'object/tapa.png');
        this.load.image('taza', 'object/taza.png');
        this.load.image('torta', 'object/torta.png');
        this.load.image('vaso', 'object/vaso.png');
        this.load.image('vela', 'object/vela.png');
        this.load.image('zapato', 'object/zapato.png');

        this.load.spritesheet('orangeButton', 'orange_buttons.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monkeys', 'character/Monkey-Assets.png', { frameWidth: 42, frameHeight: 36 });
        this.load.spritesheet('hand_pointer', 'character/Hand-Sprite.png', { frameWidth: 64, frameHeight: 64 });
        //this.load.spritesheet('nutria', 'character/sprite-nutria2.png', { frameWidth: 125, frameHeight: 167 });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
