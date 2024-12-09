import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Bubble, ObjectConfig } from "../objects/Bubble";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    private bubbles: Bubble[];
    private recognition: SpeechRecognition;
    private activeTimeout: number | null;
    private selectedBubble: Bubble | null;

    constructor() {
        super("Game");
        this.bubbles = [];
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "bg_jungle").setScale(1.6);

        this.add.image(812, 484, "monkey").setScale(0.7);

        /* this.statusText = this.add
            .text(400, 200, 'Presiona "Comenzar" para jugar', {
                fontSize: "24px",
                color: "#ffffff",
            })
            .setOrigin(0.5); */

        this.setupSpeechRecognition();
        this.createBubbles();

        /* this.startButton = this.add
            .text(400, 300, "Comenzar", {
                fontSize: "32px",
                color: "#00ff00",
                backgroundColor: "#333333",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                const audioContext = new AudioContext();
                audioContext.resume().then(() => {
                    console.log("AudioContext resumed");
                    console.log(audioContext.state);
                    this.startGame();
                });
            })
            .on("pointerover", () => this.startButton.setScale(1.1))
            .on("pointerout", () => this.startButton.setScale(1)); */

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    /* private async startGame(): Promise<void> {
        if (this.gameState === GameState.WAITING_TO_START) {
            try {
                // Intentar iniciar el reconocimiento de voz
                await this.setupSpeechRecognition();

                // Si el reconocimiento se inició correctamente
                this.gameState = GameState.PLAYING;
                this.startButton.setVisible(false);
                this.statusText.setVisible(false);

                // Crear las burbujas
                this.createBubbles();
            } catch (error) {
                console.error(
                    "Error al iniciar el reconocimiento de voz:",
                    error
                );
                this.statusText.setText(
                    "Error al iniciar el reconocimiento de voz.\nPor favor, verifica los permisos del micrófono."
                );
            }
        }
    } */

    private createBubbles(): void {
        const objectsConfig: ObjectConfig[] = [
            { name: "mesa", imageKey: "mesa" },
            { name: "cama", imageKey: "cama" },
        ];

        let cont = 1;
        objectsConfig.forEach((objConfig) => {
            const config = {
                ...objConfig,
                x: 300,
                y: cont * 250,
            };

            const bubble = new Bubble(this, config);
            this.bubbles.push(bubble);
            cont++;
        });
    }

    private setupSpeechRecognition(): void {
        if ("webkitSpeechRecognition" in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = "es-ES";

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.checkBubblePopByWord(transcript);
            };

            this.recognition.onend = () => {
                if (this.selectedBubble && !this.selectedBubble.isPopped) {
                    this.selectedBubble.returnToPosition();
                    this.selectedBubble = null;
                }
            };
        }
    }

    public onBubbleSelected(bubble: Bubble): void {
        // Si hay una burbuja seleccionada previamente, retornarla a su posición
        if (this.selectedBubble && this.selectedBubble !== bubble) {
            this.selectedBubble.returnToPosition();
        }

        this.selectedBubble = bubble;

        // Limpiar el timeout anterior si existe
        if (this.activeTimeout !== null) {
            clearTimeout(this.activeTimeout);
        }

        // Iniciar reconocimiento de voz
        if (this.recognition) {
            this.recognition.abort(); // Detener cualquier reconocimiento previo
            this.recognition.start();

            // Establecer un tiempo límite para la respuesta (5 segundos)
            this.activeTimeout = window.setTimeout(() => {
                if (this.recognition) {
                    this.recognition.stop();
                }
            }, 5000);
        }
    }

    private checkBubblePopByWord(word: string): void {
        if (
            this.selectedBubble &&
            word.includes(this.selectedBubble.getName())
        ) {
            this.selectedBubble.pop();
            this.selectedBubble = null;
        } else if (this.selectedBubble) {
            this.selectedBubble.returnToPosition();
            this.selectedBubble = null;
        }
    }

    cleanup(): void {
        this.bubbles.forEach((bubble) => bubble.destroy());
        this.bubbles = [];
        if (this.recognition) {
            this.recognition.stop();
        }
        if (this.activeTimeout !== null) {
            clearTimeout(this.activeTimeout);
        }
    }
}
