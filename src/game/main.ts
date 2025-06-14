import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { ConfigResponse } from '../types/config.type';
import { SegmentScenes } from './SegmentScene';
import { LevelTransition } from './scenes/levels/LevelTransition';

const StartGame = (parent: string, gameSettings: ConfigResponse[] | null) => {
    const baseScenes = [Boot, Preloader, MainMenu, GameOver, LevelTransition];

    const dynamicScenes = gameSettings ? gameSettings.map( setting => {
        const BaseScene = SegmentScenes[setting.segmento];

        if (!BaseScene) return null;

        return class DynamicScene extends BaseScene {
            constructor() {
                super(setting.segmento, setting.fonemas);
            }
        }
    })
    .filter( scene => scene !== null) : [];

    const config: Phaser.Types.Core.GameConfig = {
        type: AUTO,
        backgroundColor: '#028af8',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: parent,
            width: 1024,
            height: 768
        },
        scene: [
            ...baseScenes,
            ...dynamicScenes
        ],
        pixelArt: true
    }

    return new Game(config);
}

export default StartGame;
