import { GameOver } from "./scenes/GameOver";
import { NasalesGame } from "./scenes/NasalesGame";

interface SegmentComponentMap {
    [key: string]: typeof Phaser.Scene;
}

export const SegmentScenes: SegmentComponentMap = {
    "Nasales": NasalesGame,
    "Oclusivas Sordas": GameOver
}