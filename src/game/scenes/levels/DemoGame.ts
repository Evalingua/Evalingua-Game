import { EventBus } from "../../EventBus";
import { Scene } from "phaser";
import { Bubble, ObjectConfig } from "../../objects/Bubble";
import { SpeechSynthesisService } from "../../../services/SpeechSynthesisService";
import { SpeechRecognitionService } from "../../../services/SpeechRecognitionService";
import { Configuration, MapConfig } from "../../config/Configuration";
import { LevelManager } from "../../LevelManager";

export class DemoGame extends Scene{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    animal: Phaser.GameObjects.Sprite;
    button: Phaser.GameObjects.Sprite;
    handPointer: Phaser.GameObjects.Sprite;
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
    private synthesisService: SpeechSynthesisService;
    private recognitionService: SpeechRecognitionService;
    private currentBubbleIndex: number = -1;
    private bubbleQueue: ObjectConfig[] = [];
    private currentAttempts: number = 0;
    private maxAttempts: number = 3;
    private audioToProcess: { filename: string, success: boolean, palabra: string, posicion: string } | null = null;
    private levelConfiguration: MapConfig;

    // Responsivo
    private baseWidth  = 1024;
    private baseHeight = 768;
    private bubbleXRatio   = 312 / this.baseWidth;
    private bubbleYShow     = 384 / this.baseHeight;
    private animalXRatio   = 660 / this.baseWidth;
    private animalYRatio   = 400 / this.baseHeight;
    
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
        this.background = this.add.image(0, 0, this.levelConfiguration.levelConfig.bg_image).setOrigin(0).setScale(1);
        this.music = this.sound.add(this.levelConfiguration.levelConfig.bg_music, { loop: true, volume: 0.1 });
        this.music.play();
        
        this.setupAnimalAnimations();
        this.animal.play("idle");
        
        this.setupSpeechRecognitionHandlers();
        
        this.createBubblesForCurrentFonema();

        this.handPointer = this.add.sprite(0, 0, "hand_pointer").setScale(2).setOrigin(0).setDepth(100);
        this.handPointer.setVisible(false);
        this.anims.create({
            key: "handPointerAnimation",
            frames: this.anims.generateFrameNumbers("hand_pointer", { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1,
            yoyo: true
        });

        this.scale.on('resize', this.onResize, this);
        const { width, height } = this.scale.gameSize;
        this.onResize({ width, height });
        
        EventBus.emit("current-scene-ready", this);
    }

    private setupAnimalAnimations(): void {
        const fonemaConfig = this.levelConfiguration.fonemasConfig[this.currentFonema || "m"];
        if (!fonemaConfig) return;
        const { key, animation } = fonemaConfig.animal;
        this.animal = this.add.sprite(0, 0, key)
        .setScale(fonemaConfig.animal.scale || 1);
        animation.forEach(anim => {
        this.anims.create({
            key: anim.key,
            frames: this.anims.generateFrameNumbers(key, {
            start: anim.frames.start,
            end: anim.frames.end
            }),
            frameRate: anim.frameRate,
            repeat: anim.repeat || 0,
            yoyo: anim.yoyo || false
        });
        });
    }
    
    private createBubblesForCurrentFonema(): void {
        this.bubbles.forEach(b => b.destroy());
        this.bubbles = [];
        this.bubbleQueue = this.getObjectsForFonema(this.currentFonema);
        this.currentBubbleIndex = -1;
        this.showNextBubble();
    }

    private showNextBubble(): void {
        this.currentBubbleIndex++;
        this.animal.play("idle");
        this.resetAttempts();

        if (this.currentBubbleIndex < this.bubbleQueue.length) {
        const objConfig = this.bubbleQueue[this.currentBubbleIndex];
        const bubble = new Bubble(this, {
            ...objConfig,
            x: this.bubbleXRatio * this.scale.gameSize.width, 
            y: this.bubbleYShow * this.scale.gameSize.height + 500
        });
        this.bubbles.push(bubble);

        // Entrada animada
        this.tweens.add({
            targets: [bubble.getBubbleSprite(), bubble.getObjectSprite()],
            y: this.bubbleYShow * this.scale.gameSize.height,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                bubble.setPosition(
                    this.bubbleXRatio * this.scale.gameSize.width,
                    this.bubbleYShow * this.scale.gameSize.height
                );
                this.synthesisService.speak('Mira, ¿qué es eso?');
                this.handPointer.setVisible(true);
                this.handPointer.play("handPointerAnimation");
                bubble.addFloatingAnimation();
            }
        });
        } else {
        this.checkLevelProgression();
        }
    }
    
    private getObjectsForFonema(fonema: string | null): ObjectConfig[] {
        if (!fonema) return [];

        const fonemaConfig = this.levelConfiguration.fonemasConfig[fonema];
        if (!fonemaConfig) return [];

        return fonemaConfig.words.map(word => ({
            name: word.name,
            imageKey: word.imageKey,
            posicionFonema: word.posicionFonema
        }));
    }

    private onResize(gameSize: { width: number; height: number }) {
        const { width, height } = gameSize;
        const scaleX = width  / this.baseWidth;
        const scaleY = height / this.baseHeight;
        const coverScale = Math.max(scaleX, scaleY);
        console.log("CoverScale", coverScale);

        // Fondo
        this.background
            .setDisplaySize(width, height)       // fuerza ancho = canvas width y alto = canvas height
            .setPosition(0, 0);                  // origen al borde superior-izquierdo

        // Si además quieres mantener el origen en 0,0:
        this.background.setOrigin(0);

        // Animal
        this.animal
        .setPosition(width * this.animalXRatio, height * this.animalYRatio)

        // Reposicionar burbujas existentes
        this.bubbles.forEach(bubble => {
        bubble.setPosition(
            width * this.bubbleXRatio,
            height * this.bubbleYShow
        );})

        // Reposicionar handPointer
        this.handPointer
        .setPosition(width * this.bubbleXRatio, height * this.bubbleYShow);
    }
    
    private setupSpeechRecognitionHandlers(): void {

        this.recognitionService.onResult((transcript: string) => {
            this.checkBubblePopByWord(transcript);
        });

        this.recognitionService.onAudioAvailable((audioBlob: Blob) => {
            if (this.audioToProcess) {
                this.audioToProcess = null;
                console.log("Audio descargado available", audioBlob);
            }
        });

        this.recognitionService.onEnd(() => {
            if (this.selectedBubble && !this.selectedBubble.isPopped) {
                this.handleFailedAttempt();
            }

            this._isBubbleActive = false;
        });

        this.recognitionService.onError((error: string) => {
            console.error("Error en reconocimiento de voz:", error);
            if(this.selectedBubble) {
                this.handleFailedAttempt();
            }
            this._isBubbleActive = false;
            this.animal.play("idle");
        })
    }

    private handleFailedAttempt(): void {
        if(!this.selectedBubble) return;

        this.currentAttempts++;
        this.music.resume();
        this.handPointer.setVisible(true);
        this.animal.play("idle");
        this.handPointer.play("handPointerAnimation");
        
        if (this.currentAttempts >= this.maxAttempts) {
            this.selectedBubble.pop();
            this.selectedBubble = null;
            this.handPointer.setVisible(false);
            this.handPointer.stop();

            this.synthesisService.speak("Vamos a la siguiente");
        } else {
            this.synthesisService.speak(`Se llama ${this.selectedBubble!.getName()}, repite`);
            this.selectedBubble.returnToPosition();
            this.selectedBubble = null;
        }
    }

    private resetAttempts(): void {
        this.currentAttempts = 0;
        this.audioToProcess = null;
    }

    
    public onBubbleSelected(bubble: Bubble): void {
        if (this._isBubbleActive) return;
        
        this._isBubbleActive = true;
        
        if (this.selectedBubble && this.selectedBubble !== bubble) {
            this.selectedBubble.returnToPosition();
        }

        this.selectedBubble = bubble;
        this.handPointer.setVisible(false);
        this.handPointer.stop();
        
        this.animal.play("stand");
        this.animal.once('animationcomplete-stand', () => {
            this.animal.play("doubt");
        });

        this.music.pause();
        this.synthesisService.stopSpeaking();
        
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
            this.selectedBubble.pop();
            this.selectedBubble = null;
            this._isBubbleActive = false
            this.recognitionService.stopRecognition();
            this.handPointer.setVisible(false);
            this.handPointer.stop();
            
            this.time.delayedCall(2000, () => {
                this.synthesisService.speak("Muy bien!");
            });
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
                    this.button = this.add.sprite(this.bubbleXRatio * this.scale.gameSize.width, this.bubbleYShow * this.scale.gameSize.height, 'orangeButton').setScale(8);
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