import { DemoGame } from "./scenes/levels/DemoGame";
import { NasalesGame } from "./scenes/levels/NasalesGame";
import { OclusivasSordasGame } from "./scenes/levels/OclusivasSordasGame";

interface SegmentComponentMap {
    [key: string]: typeof Phaser.Scene;
}

export const SegmentScenes: SegmentComponentMap = {
    "nasales": NasalesGame,
    'oclusivas_sordas': OclusivasSordasGame,
    'demo': DemoGame
}