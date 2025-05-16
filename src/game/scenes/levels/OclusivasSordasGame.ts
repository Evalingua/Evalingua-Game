
import { BubbleScene } from "../../templates/BubbleScene";

export class OclusivasSordasGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "oclusivas_sordas", fonemas || ["p", "k"]);
    }
}