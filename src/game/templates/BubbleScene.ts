import { Bubble } from "../objects/Bubble";

export interface BubbleScene extends Phaser.Scene {
    isBubbleActive(): boolean;
    onBubbleSelected(bubble: Bubble): void;
    onBubblePopped(bubble: Bubble): void;
}