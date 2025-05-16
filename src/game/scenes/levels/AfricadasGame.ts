import { BubbleScene } from "../../templates/BubbleScene";

export class AfricadasGame extends BubbleScene {
    constructor(segmento?: string, fonemas?: string[]) {
        super(
            segmento || "africadas",
            fonemas || ["ch"],
        );
    }
}