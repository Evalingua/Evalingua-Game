
import { BubbleScene } from "../../templates/BubbleScene";

export class FricativasGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "fricativas", fonemas || ["f", "s"]);
    }
}