import { EventBus } from "../../EventBus";
import { Scene } from "phaser";
import { Bubble, ObjectConfig } from "../../objects/Bubble";
import { SpeechSynthesisService } from "../../../services/SpeechSynthesisService";
import { SpeechRecognitionService } from "../../../services/SpeechRecognitionService";
import { Configuration, MapConfig } from "../../config/Configuration";
import { LevelManager } from "../../LevelManager";
import { BubbleScene } from "../../templates/BubbleScene";

export class DemoGame extends Scene implements BubbleScene{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    animal: Phaser.GameObjects.Sprite;
    button: Phaser.GameObjects.Sprite;
    music: Phaser.Sound.BaseSound;
    protected segmento: string;
    protected fonemas: string[];
    private bubbles: Bubble[] = [];
    private levelManager: LevelManager;
    private recognition: SpeechRecognition;
    private activeTimeout: number | null = null;
    private selectedBubble: Bubble | null = null;
    private _isBubbleActive: boolean = false;
    private currentFonema: string | null = null;
    private poppedBubbles: number = 0;
    private statusText: Phaser.GameObjects.Text;
    private fonemaText: Phaser.GameObjects.Text;
    private synthesisService: SpeechSynthesisService;
    private recognitionService: SpeechRecognitionService;
    private currentBubbleIndex: number = -1;
    private bubbleQueue: ObjectConfig[] = [];
    private currentAttempts: number = 0;
    private maxAttempts: number = 3;
    private attemptsText: Phaser.GameObjects.Text;
    private lastAudioBlob: Blob | null = null;
    private audioToProcess: { filename: string, success: boolean, palabra: string, posicion: string } | null = null;
    private levelConfiguration: MapConfig;
    
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "demo");
        this.segmento = segmento || "demo";
        this.fonemas = fonemas || [];
        this.synthesisService = SpeechSynthesisService.getInstance();
        this.recognitionService = SpeechRecognitionService.getInstance();
        this.levelManager = LevelManager.getInstance();
        this.levelConfiguration = Configuration["nasales"];
    }

    create() {
        console.log(`Cargando nivel para segmento ${this.segmento} con fonemas:`, this.fonemas);
        
        const currentLevel = this.levelManager.getCurrentLevel();
        this.currentFonema = this.levelManager.getCurrentFonema();
        
        if (!currentLevel || !this.currentFonema) {
            console.error("No hay nivel o fonema actual disponible");
            return;
        }

        // Configurar cámara y fondo
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        this.background = this.add.image(512, 384, this.levelConfiguration.levelConfig.bg_image).setScale(1.6);
        this.music = this.sound.add(this.levelConfiguration.levelConfig.bg_music, { loop: true, volume: 0.1 });
        this.music.play();
        
        // Configurar interfaz de usuario
        this.fonemaText = this.add.text(20, 20, `Fonema actual: ${this.currentFonema}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        this.statusText = this.add.text(20, 60, "Selecciona una burbuja con este fonema", {
            fontSize: '20px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.attemptsText = this.add.text(20, 100, "", {
            fontSize: '18px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setVisible(false);
        
        this.setupAnimalAnimations();
        this.animal.play("idle");
        
        this.setupSpeechRecognitionHandlers();
        
        this.createBubblesForCurrentFonema();

        this.time.delayedCall(200, () => {
            this.synthesisService.speak(`A reventar las burbujas, tocala para empezar`);
        }); 
        
        EventBus.emit("current-scene-ready", this);
    }

    private setupAnimalAnimations(): void {
        const fonemaConfig = this.levelConfiguration.fonemasConfig[this.currentFonema || "m"];
        if (!fonemaConfig) return;

        const { key, animation } = fonemaConfig.animal;
        this.animal = this.add.sprite(660, 400, key).setScale(fonemaConfig.animal.scale || 1);
        animation.forEach(anim => {
            this.anims.create({
                key: anim.key,
                frames: this.anims.generateFrameNumbers(key, { start: anim.frames.start, end: anim.frames.end }),
                frameRate: anim.frameRate,
                repeat: anim.repeat || 0,
                yoyo: anim.yoyo || false
            });
        });
    }
    
    private createBubblesForCurrentFonema(): void {
        // Limpiar burbujas existentes
        this.bubbles.forEach(bubble => bubble.destroy());
        this.bubbles = [];
        
        // Preparar la cola de burbujas
        this.bubbleQueue = this.getObjectsForFonema(this.currentFonema);
        this.currentBubbleIndex = -1;

        this.showNextBubble();
    }

    private showNextBubble(): void {
        this.currentBubbleIndex++;
        this.animal.play("idle");

        this.resetAttempts();
        
        // Verificar si hay más burbujas para mostrar
        if (this.currentBubbleIndex < this.bubbleQueue.length) {
            const objConfig = this.bubbleQueue[this.currentBubbleIndex];
            const config = {
                ...objConfig,
                x: 312, // Centrado horizontalmente
                y: 800  // Posición inicial fuera de la pantalla (inferior)
            };
            
            const bubble = new Bubble(this, config);
            this.bubbles.push(bubble);
            
            // Animar la entrada de la burbuja
            this.tweens.add({
                targets: [bubble.getBubbleSprite(), bubble.getObjectSprite()],
                y: 384,
                duration: 1000,
                ease: 'Power1',
                onComplete: () => {
                    bubble.setPosition(312, 384);
                    // Iniciar la animación de flotado una vez posicionada
                    this.synthesisService.speak('¿Como se llama esto?');
                    bubble.addFloatingAnimation();
                }
            });
        } else {
            // No hay más burbujas, verificar si todas han sido reventadas
            this.checkLevelProgression();
        }
    }
    
    private getObjectsForFonema(fonema: string | null): ObjectConfig[] {
        if (!fonema) return [];

        const fonemaConfig = this.levelConfiguration.fonemasConfig[fonema];
        console.log("FonemaConfig", fonemaConfig);
        if (!fonemaConfig) return [];

        return fonemaConfig.words.map(word => ({
            name: word.name,
            imageKey: word.imageKey,
            posicionFonema: word.posicionFonema
        }));
    }
    
    private setupSpeechRecognitionHandlers(): void {
        if (!this.recognitionService.getIsSupported()) {
            console.error("El reconocimiento de voz no está soportado en este navegador");
            this.statusText.setText("Reconocimiento de voz no soportado");
            this.animal.play("idle");
            return;
        }

        this.recognitionService.onResult((transcript: string) => {
            this.checkBubblePopByWord(transcript);
        });

        this.recognitionService.onAudioAvailable((audioBlob: Blob) => {
            if (this.audioToProcess) {
                this.lastAudioBlob = audioBlob;
                this.audioToProcess = null;
                console.log("Audio descargado available");
            }
        });

        this.recognitionService.onEnd(() => {
            if (this.selectedBubble && !this.selectedBubble.isPopped) {
                this.handleFailedAttempt();
            }

            this._isBubbleActive = false;
            //this.animal.play("idle");
            this.statusText.setText("Selecciona una burbuja con este fonema");
        });

        this.recognitionService.onError((error: string) => {
            console.error("Error en reconocimiento de voz:", error);
            if(this.selectedBubble) {
                this.handleFailedAttempt();
            }
            this._isBubbleActive = false;
            this.animal.play("idle");
            this.statusText.setText("Error en reconocimiento de voz");
        })
    }

    private handleFailedAttempt(): void {
        if(!this.selectedBubble) return;

        this.currentAttempts++;
        this.music.resume();
        
        if (this.currentAttempts >= this.maxAttempts) {
            this.statusText.setText("Continuemos con la siguiente")
            this.selectedBubble.pop();
            this.selectedBubble = null;

            this.synthesisService.speak("Vamos a la siguiente");
        } else {
            const intentosRestantes = this.maxAttempts - this.currentAttempts;
            this.statusText.setText(`Inténtalo de nuevo, te quedan ${intentosRestantes} intentos`);
            this.attemptsText.setText(`Intentos restantes: ${intentosRestantes}`).setVisible(true);
            this.selectedBubble.returnToPosition();
            this.selectedBubble = null;

            if(this.currentAttempts === 1) { 
                this.synthesisService.speak("Vamos, tu puedes");
            } else {
                this.synthesisService.speak("Un intento más");
            }
        }
    }

    private resetAttempts(): void {
        this.currentAttempts = 0;
        this.attemptsText.setVisible(false);
        this.lastAudioBlob = null;
        this.audioToProcess = null;
    }

    
    public onBubbleSelected(bubble: Bubble): void {
        if (this._isBubbleActive) return;
        
        this._isBubbleActive = true;
        
        if (this.selectedBubble && this.selectedBubble !== bubble) {
            this.selectedBubble.returnToPosition();
        }

        this.selectedBubble = bubble;

        if (this.currentAttempts > 0) {
            const intentosRestantes = this.maxAttempts - this.currentAttempts;
            this.attemptsText.setText(`Intentos restantes: ${intentosRestantes}`).setVisible(true);
        } else {
            this.attemptsText.setVisible(false);
        }
        
        this.statusText.setText(`Dí una palabra con "${this.currentFonema}" como: ${bubble.getName()}`);
        
        this.animal.play("stand");
        this.animal.once('animationcomplete-stand', () => {
            this.animal.play("doubt");
        });

        this.music.pause();
        
        // Limpiar el timeout anterior si existe
        if (this.activeTimeout !== null) {
            clearTimeout(this.activeTimeout);
        }
        
        // Iniciar reconocimiento de voz
        this.recognitionService.startRecognition();

        // Establecer un timeout para finalizar el reconocimiento
        this.activeTimeout = window.setTimeout(() => {
            this.recognitionService.stopRecognition();
        }, 5000);
    }
    
    private checkBubblePopByWord(word: string): void {
        if (!this.selectedBubble) return;
        
        if (word.includes(this.selectedBubble.getName())) {
            this.statusText.setText("¡Correcto!");
            this.attemptsText.setVisible(false);

            this.selectedBubble.pop();
            this.selectedBubble = null;
            this._isBubbleActive = false
            
            this.synthesisService.speak("Muy bien!");
        } else {
            this.handleFailedAttempt();
        }
    }
    
    public onBubblePopped(bubble: Bubble): void {
        if (bubble.isPopped) {
            this.poppedBubbles++;
            this.animal.play("celebrate");

            this.music.resume();
            
            this.time.delayedCall(1200, () => {
                this.showNextBubble();
            });
        }
    }
    
    private checkLevelProgression(): void {
        if (this.poppedBubbles >= this.bubbleQueue.length) {
            this.synthesisService.speak("¡Muy bien! Has reventado todas las burbujas");
            this.time.delayedCall(500, () => {
                const hasNextFonema = this.levelManager.goToNextFonema();
                if (hasNextFonema) {
                    this.button = this.add.sprite(900, 384, 'orangeButton').setScale(3);
                    this.anims.create({
                        key: "shine",
                        frames: this.anims.generateFrameNumbers("orangeButton", { start: 90, end: 92 }),
                        frameRate: 5,
                        repeat: -1
                    });
                    this.animal.play("celebrate");
                    this.button.play("shine");
                    this.button.setInteractive();
                    this.button.on("pointerdown", () => {
                        this.cleanup();
                        this.scene.restart();
                    });
                } else {
                    this.levelManager.goToNextLevel();
                }
            });
        }
    }
    
    public isBubbleActive(): boolean {
        return this._isBubbleActive;
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

        this.button.destroy();
        this.poppedBubbles = 0;
        this._isBubbleActive = false;
        this.selectedBubble = null;
        this.synthesisService.stopSpeaking();
        this.resetAttempts();
        this.music.stop();
        this.music.destroy();
    }
    
    shutdown(): void {
        this.cleanup();
    }
}