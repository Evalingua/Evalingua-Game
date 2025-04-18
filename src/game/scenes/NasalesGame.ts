import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Bubble, ObjectConfig } from "../objects/Bubble";
import { LevelManager } from "../LevelManager";
import { SpeechSynthesisService } from "../../services/SpeechSynthesisService";
import { SpeechRecognitionService } from "../../services/SpeechRecognitionService";
import { AudioStorageService } from "../../services/AudioStorageService";
import AuthService from "../../services/AuthService";

interface FonemaConfig {
  words: { name: string, imageKey: string }[];
  animal: {
    key: string;
    scale?: number;
    animation: { key: string, frameRate: number, frames: { start: number, end: number }, repeat?: number, yoyo?: boolean }[];
  };
}

export class NasalesGame extends Scene {
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
    private audioToProcess: { filename: string, success: boolean } | null = null;
    private fonemaConfig: Record<string, FonemaConfig> = {
        "m": {
            words: [
                { name: "mesa", imageKey: "mesa" },
                { name: "cama", imageKey: "cama" }
            ],
            animal: {
                key: "monkeys",
                scale: 10,
                animation: [
                    { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                    { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                    { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                    { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                ]
            }
        },
        "n": {
            words: [
                { name: "botón", imageKey: "boton" },
                { name: "mano", imageKey: "mano" },
                { name: "nariz", imageKey: "nariz" }
            ],
            animal: {
                key: "nutria",
                animation: [
                    { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                    { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                    { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                    { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                ]
            }
        },
        "ñ": {
            words: [
                { name: "uña", imageKey: "uña" },
                { name: "piña", imageKey: "piña" }
            ],
            animal: {
                key: "ñu",
                animation: [
                    { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                    { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                    { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                    { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                ]
            }
        }
    }
    
    constructor(segmento?: string, fonemas?: string[]) {
        super(segmento || "Nasales");
        this.segmento = segmento || "nasales";
        this.fonemas = fonemas || [];
        this.levelManager = LevelManager.getInstance();
        this.synthesisService = SpeechSynthesisService.getInstance();
        this.recognitionService = SpeechRecognitionService.getInstance();
        const auth = AuthService.getInstance();
        this.evaluacionId = auth.getEvaluacionId();
        this.username = auth.getUserName();
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
        this.background = this.add.image(512, 384, "bg_jungle").setScale(1.6);
        this.music = this.sound.add("nasales-sound", { loop: true, volume: 0.1 });
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
        
        // Configurar mono animado
        this.setupAnimalAnimations();
        this.animal.play("idle");
        
        // Configurar reconocimiento de voz
        this.setupSpeechRecognitionHandlers();
        
        // Crear burbujas basadas en el fonema actual
        this.createBubblesForCurrentFonema();

        this.time.delayedCall(200, () => {
            this.synthesisService.speak(`A reventar las burbujas, tocala para empezar`);
        }); 
        
        // Notificar que la escena está lista
        EventBus.emit("current-scene-ready", this);
    }

    private setupAnimalAnimations(): void {
        const fonemaConfig = this.fonemaConfig[this.currentFonema || "m"];
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
        
        // Mostrar la primera burbuja
        this.showNextBubble();
    }

    private showNextBubble(): void {
        this.currentBubbleIndex++;

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
        
        switch (fonema) {
            case "m":
                return [
                    { name: "mesa", imageKey: "mesa" },
                    { name: "cama", imageKey: "cama" }
                ];
            case "n":
                return [
                    { name: "botón", imageKey: "boton" },
                    { name: "mano", imageKey: "mano" },
                    { name: "nariz", imageKey: "nariz" }
                ];
            case "ñ":
                return [
                    { name: "uña", imageKey: "uña" },
                    { name: "piña", imageKey: "piña" }
                ];
            default:
                return [];
        }
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
                const { filename } = this.audioToProcess;
                //this.recognitionService.downloadAudio(filename);
                AudioStorageService.uploadAudio(audioBlob, filename);
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
            this.processAudio(false);
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

    private processAudio(success: boolean): void {
        // En modo de desarrollo, simplemente descargamos el archivo
        // En producción, aquí iría la lógica para enviar al servicio
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
        const fileName = `/${this.segmento}/${this.currentFonema}/${this.selectedBubble?.getName()}_${currentTime}.wav`;
        
        console.log(`Procesando audio: ${fileName}`);
        // En este ejemplo solo descargamos el archivo
        this.audioToProcess = { filename: fileName, success };

        console.log(this.lastAudioBlob);

        if(this.lastAudioBlob) {
            this.recognitionService.downloadAudio(fileName);
            this.audioToProcess = null;
            console.log("Audio procesado y descargado");
        }
         
        // Aquí iría el código para enviar el audio al servicio
        // sendAudioToService(this.lastAudioBlob, fileName, success);
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
            this.animal.play("celebrate");

            this.processAudio(true);

            this.selectedBubble.pop();
            this.selectedBubble = null;
            this._isBubbleActive = false
            
            this.synthesisService.speak("Muy bien!");
        } else {
            this.handleFailedAttempt();
        }
    }
    
    // Método para ser llamado desde Bubble cuando se revienta una burbuja
    public onBubblePopped(bubble: Bubble): void {
        if (bubble.isPopped) {
            this.poppedBubbles++;
            this.music.resume();
            
            // Esperar un momento y mostrar la siguiente burbuja
            this.time.delayedCall(800, () => {
                this.showNextBubble();
            });
        }
    }
    
    private checkLevelProgression(): void {
        // Esperar un momento para mostrar la celebración
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
    
    // Exponer el estado de actividad de la burbuja para otras clases
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