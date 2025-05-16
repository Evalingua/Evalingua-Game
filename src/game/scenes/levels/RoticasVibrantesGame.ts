
import { BubbleScene } from "../../templates/BubbleScene";

export class RoticasVibrantesGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "roticas_vibrantes", fonemas || ["rr"]);
    }
}