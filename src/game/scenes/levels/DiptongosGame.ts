
import { BubbleScene } from "../../templates/BubbleScene";

export class DiptongosGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "diptongos", fonemas || ["au", "ei"]);
    } 
}