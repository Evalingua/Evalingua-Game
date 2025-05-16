
import { BubbleScene } from "../../templates/BubbleScene";

export class OclusivasSonorasGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "oclusivas_sonoras", fonemas || ["b", "d", "g"]);
    }
}