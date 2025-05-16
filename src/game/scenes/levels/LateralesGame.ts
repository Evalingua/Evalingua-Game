
import { BubbleScene } from "../../templates/BubbleScene";

export class LateralesGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "laterales", fonemas || ["l", "ll"]);
    }
}