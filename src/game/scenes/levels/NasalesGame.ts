
import { BubbleScene } from "../../templates/BubbleScene";

export class NasalesGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "nasales", fonemas || ["m", "n", "ñ"]);
    }
}