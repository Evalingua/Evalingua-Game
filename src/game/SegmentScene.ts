import { AfricadasGame } from "./scenes/levels/AfricadasGame";
import { DemoGame } from "./scenes/levels/DemoGame";
import { DiptongosGame } from "./scenes/levels/DiptongosGame";
import { FricativasGame } from "./scenes/levels/FricativasGame";
import { LateralesGame } from "./scenes/levels/LateralesGame";
import { NasalesGame } from "./scenes/levels/NasalesGame";
import { OclusivasSordasGame } from "./scenes/levels/OclusivasSordasGame";
import { RoticasPercusivasGame } from "./scenes/levels/RoticasPercusivasGame";
import { RoticasVibrantesGame } from "./scenes/levels/RoticasVibrantesGame";

interface SegmentComponentMap {
    [key: string]: typeof Phaser.Scene;
}

export const SegmentScenes: SegmentComponentMap = {
    "nasales": NasalesGame,
    'oclusivas_sordas': OclusivasSordasGame,
    'oclusivas_sonoras': OclusivasSordasGame,
    'fricativas': FricativasGame,
    'africadas': AfricadasGame,
    'diptongos': DiptongosGame,
    'laterales': LateralesGame,
    'roticas_percusivas': RoticasPercusivasGame,
    'roticas_vibrantes': RoticasVibrantesGame,
    'demo': DemoGame,
    'demo2': DemoGame,
}