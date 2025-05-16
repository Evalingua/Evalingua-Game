
import { BubbleScene } from "../../templates/BubbleScene";

export class RoticasPercusivasGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "roticas_percusivas", fonemas || ["r"]);
    }
}