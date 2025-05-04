export class SpeechSynthesisService {
    private static instance: SpeechSynthesisService;
    private synth: SpeechSynthesisUtterance;
    private isSpeaking: boolean = false;
    private queue: string[] = [];
    private voiceMap: Map<string, SpeechSynthesisVoice> = new Map();
    private currentVoice: string = "Spanish (Spain)"; // Voz por defecto

    private constructor() {
        this.synth = new SpeechSynthesisUtterance();
        this.synth.lang = "es-ES";
        this.synth.rate = 1.4; // Velocidad ligeramente más lenta que la normal
        this.synth.pitch = 10.0; // Tono más alto
        this.synth.volume = 1.0;
        
        // Configurar el evento de finalización
        this.synth.onend = () => {
            this.isSpeaking = false;
            this.processQueue(); 
        };
        
        // Cargar voces disponibles
        this.loadVoices();
        
        // Si las voces no están disponibles de inmediato, esperar a que se carguen
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
    }

    private loadVoices(): void {
        const voices = window.speechSynthesis.getVoices();
        voices.forEach(voice => {
            this.voiceMap.set(voice.name, voice);
        });
        
        // Buscar específicamente una voz femenina en español
        const femaleVoice = voices.find(v => 
            (v.name.includes("female") || v.name.includes("Female") || v.name.includes("Sabina") || v.name.includes("Monica")) && 
            (v.lang.includes("es") || v.name.includes("Spanish"))
        );
        
        if (femaleVoice) {
            this.synth.voice = femaleVoice;
            this.currentVoice = femaleVoice.name;
        } else {
            // Configurar voz en español como respaldo
            this.setVoice(this.currentVoice);
        }
    }

    public static getInstance(): SpeechSynthesisService {
        if (!SpeechSynthesisService.instance) {
            SpeechSynthesisService.instance = new SpeechSynthesisService();
        }
        return SpeechSynthesisService.instance;
    }

    public setVoice(voiceName: string): boolean {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName || v.name.includes("Spanish"));
        
        if (voice) {
            this.synth.voice = voice;
            this.currentVoice = voiceName;
            return true;
        }
        return false;
    }

    public speak(text: string, immediate: boolean = false): void {
        if (immediate) {
            this.stopSpeaking();
            this.queue = [];
        }
        
        this.queue.push(text);
        
        if (!this.isSpeaking) {
            this.processQueue();
        }
    }

    private processQueue(): void {
        if (this.queue.length > 0 && !this.isSpeaking) {
            const text = this.queue.shift();
            if (text) {
                this.isSpeaking = true;
                this.synth.text = text;
                window.speechSynthesis.speak(this.synth);
            }
        }
    }

    public stopSpeaking(): void {
        if (this.isSpeaking) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
        }
    }

    public pauseSpeaking(): void {
        if (this.isSpeaking) {
            window.speechSynthesis.pause();
        }
    }

    public resumeSpeaking(): void {
        if (this.isSpeaking) {
            window.speechSynthesis.resume();
        }
    }

    public getAvailableVoices(): string[] {
        return Array.from(this.voiceMap.keys());
    }

    public setRate(rate: number): void {
        if (rate >= 0.1 && rate <= 2.0) {
            this.synth.rate = rate;
        }
    }

    public setPitch(pitch: number): void {
        if (pitch >= 0.1 && pitch <= 2.0) {
            this.synth.pitch = pitch;
        }
    }

    public setVolume(volume: number): void {
        if (volume >= 0.0 && volume <= 1.0) {
            this.synth.volume = volume;
        }
    }
}