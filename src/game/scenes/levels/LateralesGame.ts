import { EventBus } from "../../EventBus";
import { Scene } from "phaser";
import { Bubble, ObjectConfig } from "../../objects/Bubble";
import { LevelManager } from "../../LevelManager";
import { SpeechSynthesisService } from "../../../services/SpeechSynthesisService";
import { SpeechRecognitionService } from "../../../services/SpeechRecognitionService";
import { AudioStorageService } from "../../../services/AudioStorageService";
import { BackendService } from "../../../services/BackendService";
import { AudioRequest, ResultadoRequest, ResultadoResponse } from "../../../types/backend.type";
import AuthService from "../../../services/AuthService";
import { toast } from "react-toastify";
import { Configuration, MapConfig } from "../../config/Configuration";
import { BubbleScene } from "../../templates/BubbleScene";

export class LateralesGame extends Scene implements BubbleScene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    animal: Phaser.GameObjects.Sprite;
    button: Phaser.GameObjects.Sprite;
    music: Phaser.Sound.BaseSound;
    protected segmento: string;
    protected fonemas: string[];
    private evaluacionId: string;
    private username: string;
    private bubbles: Bubble[] = [];
    private recognition: SpeechRecognition;
    private activeTimeout: number | null = null;
    private selectedBubble: Bubble | null = null;
    private _isBubbleActive: boolean = false;
    private levelManager: LevelManager;
    private currentFonema: string | null = null;
    private poppedBubbles: number = 0;
    private synthesisService: SpeechSynthesisService;
    private recognitionService: SpeechRecognitionService;
    private backendService: BackendService;
    private resultado: ResultadoResponse | null = null;
    private currentBubbleIndex: number = -1;
    private bubbleQueue: ObjectConfig[] = [];
    private currentAttempts: number = 0;
    private maxAttempts: number = 3;
    private lastAudioBlob: Blob | null = null;
    private audioToProcess: { filename: string, success: boolean, palabra: string, posicion: string } | null = null;
    private levelConfiguration: MapConfig;

    private baseWidth  = 1024;
    private baseHeight = 768;
    private bubbleXRatio   = 312 / this.baseWidth;
    private bubbleYShow     = 384 / this.baseHeight;
    private animalXRatio   = 660 / this.baseWidth;
    private animalYRatio   = 400 / this.baseHeight;
    
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "laterales");
        this.segmento = segmento || "laterales";
        this.fonemas = fonemas || [];
        this.levelManager = LevelManager.getInstance();
        this.synthesisService = SpeechSynthesisService.getInstance();
        this.recognitionService = SpeechRecognitionService.getInstance();
        const auth = AuthService.getInstance();
        this.evaluacionId = auth.getEvaluacionId();
        this.username = auth.getUserName();
        this.backendService = new BackendService();
        this.levelConfiguration = Configuration[this.segmento];
    }

    create() {
        console.log(`Cargando nivel para segmento ${this.segmento} con fonemas:`, this.fonemas);
        
        // Obtener información actualizada del LevelManager
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

        this.scale.on('resize', this.onResize, this);
        const { width, height } = this.scale.gameSize;
        this.onResize({ width, height });
        
        EventBus.emit("current-scene-ready", this);
    }

    private async createNewAudio(filename: string, url: string, palabra: string, posicion: string): Promise<void> {
        const audioRequest: AudioRequest = {
            audioPath: filename,
            audioUrl: url,
            resultadoId: this.resultado?.id || 0,
            palabra: palabra,
            posicion: posicion
        };
        
        this.backendService.createAudio(audioRequest).then((response) => {
            console.log("Audio creado:", response);
        }).catch((error) => {
            console.error("Error creando audio:", error);
        });
    }

    private async createNewResultado(): Promise<void> {
        const resultadoRequest: ResultadoRequest = {
            evaluacionId: this.evaluacionId,
            fonema: this.currentFonema || "",
            username: this.username,
            totalResultados: this.bubbleQueue.length
        };
        this.backendService.createResultado(resultadoRequest).then((response) => {
            console.log("Resultado creado:", response);
            this.resultado = response.data;
        }).catch((error) => {
            console.error("Error creando resultado:", error);
        });
    }

    private setupAnimalAnimations(): void {
        const fonemaConfig = this.levelConfiguration.fonemasConfig[this.currentFonema || "m"];
        if (!fonemaConfig) return;

        const { key, animation } = fonemaConfig.animal;
        this.animal = this.add.sprite(0, 0, key).setScale(fonemaConfig.animal.scale || 1);
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
        this.bubbles.forEach(bubble => bubble.destroy());
        this.bubbles = [];
        this.bubbleQueue = this.getObjectsForFonema(this.currentFonema);
        this.currentBubbleIndex = -1;
        this.createNewResultado().then(() => {
            console.log("Resultado creado correctamente");
            this.showNextBubble();
        }
        ).catch((error) => {
            console.error("Error creando resultado:", error);
            toast.error("Error creando resultado, por favor intenta de nuevo");
        });
    }

    private showNextBubble(): void {
        this.currentBubbleIndex++;
        this.animal.play("idle");

        this.resetAttempts();
        
        if (this.currentBubbleIndex < this.bubbleQueue.length) {
            const objConfig = this.bubbleQueue[this.currentBubbleIndex];
            const config = {
                ...objConfig,
                x: this.bubbleXRatio * this.scale.gameSize.width, 
                y: this.bubbleYShow * this.scale.gameSize.height + 500  
            };
            
            const bubble = new Bubble(this, config);
            this.bubbles.push(bubble);
            
            // Animar la entrada de la burbuja
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
                    this.synthesisService.speak('Mira, ¿que es eso?');
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

        this.background
            .setDisplaySize(width, height)
            .setPosition(0, 0);
        this.background.setOrigin(0);

        this.animal
        .setPosition(width * this.animalXRatio, height * this.animalYRatio)

        this.bubbles.forEach(bubble => {
        bubble.setPosition(
            width * this.bubbleXRatio,
            height * this.bubbleYShow
        );})
    }
    
    private setupSpeechRecognitionHandlers(): void {

        this.recognitionService.onResult((transcript: string) => {
            this.checkBubblePopByWord(transcript);
        });

        this.recognitionService.onAudioAvailable((audioBlob: Blob) => {
            if (this.audioToProcess) {
                this.lastAudioBlob = audioBlob;
                const { filename, palabra, posicion } = this.audioToProcess;

                AudioStorageService.uploadAudio(audioBlob, filename).then((response) => {
                    console.log("Audio subido correctamente");
                    this.createNewAudio(`evalingua/${filename}`, response, palabra, posicion).then(() => {
                        console.log("Audio creado correctamente");
                    }).catch((error) => {
                        console.error("Error creando audio:", error);
                    });
                }).catch((error) => {
                    console.error("Error al subir el audio:", error);
                });
                this.audioToProcess = null;
                console.log("Audio descargado available");
            }
        });

        this.recognitionService.onEnd(() => {
            if (this.selectedBubble && !this.selectedBubble.isPopped) {
                this.handleFailedAttempt();
            }

            this._isBubbleActive = false;
            this.animal.play("idle");
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
        
        if (this.currentAttempts >= this.maxAttempts) {
            this.processAudio(false);
            this.selectedBubble.pop();
            this.selectedBubble = null;

            this.synthesisService.speak("Vamos a la siguiente");
        } else {
            this.synthesisService.speak(`Se llama ${this.selectedBubble!.getName()}, repite`);
            this.selectedBubble.returnToPosition();
            this.selectedBubble = null;
        }
    }

    private processAudio(success: boolean): void {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
        const fileName = `${this.evaluacionId}/${this.segmento}/${this.currentFonema}/${this.selectedBubble?.getName()}_${currentTime}.wav`;
        
        console.log(`Procesando audio: ${fileName}`);
        this.audioToProcess = { 
            filename: fileName, 
            success,
            palabra: this.selectedBubble?.getName() || "",
            posicion: this.selectedBubble?.getPosicionFonema() || ""
        };
        console.log(this.lastAudioBlob);

        if(this.lastAudioBlob) {
            console.log("Audio procesado y descargado");
            AudioStorageService.uploadAudio(this.lastAudioBlob, fileName).then((response) => {
                console.log("Audio subido correctamente");
                this.createNewAudio(`evalingua/${fileName}`, response, this.audioToProcess?.palabra || "", this.audioToProcess?.posicion || "").then(() => {
                    console.log("Audio creado correctamente");
                }).catch((error) => {
                    console.error("Error creando audio:", error);
                });
            }).catch((error) => {
                console.error("Error al subir el audio:", error);
            });
        }
    }

    private resetAttempts(): void {
        this.currentAttempts = 0;
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
            this.processAudio(true);

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
            this.music.resume();
            this.animal.play("celebrate");
            
            this.time.delayedCall(800, () => {
                this.showNextBubble();
            });
        }
    }
    
    private checkLevelProgression(): void {
        if (this.poppedBubbles >= this.bubbleQueue.length) {
            this.synthesisService.speak("¡Muy bien! reventaste todas las burbujas");
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
                    this.button.play("shine");
                    this.animal.play("celebrate");
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