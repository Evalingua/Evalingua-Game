export class SpeechRecognitionService {
    private static instance: SpeechRecognitionService;
    private recognition: SpeechRecognition | null = null;
    private isSupported: boolean;

    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: BlobPart[] = [];
    private audioStream: MediaStream | null = null;

    //Callbacks
    private onResultCallback: (transcript: string) => void = () => {};
    private onEndCallback: () => void = () => {};
    private onErrorCallback: (error: string) => void = () => {};
    private onAudioAvailableCallback: (audioBlob: Blob) => void = () => {};

    private constructor() {
        this.isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

        if (this.isSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = "es-ES";
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.onResultCallback(transcript);
            }

            this.recognition.onend = () => {
                this.stopMediaRecording();
                this.onEndCallback();
            }

            this.recognition.onerror = (event) => {
                this.stopMediaRecording();
                this.onErrorCallback(event.error);
            }
        }
    }

    public static getInstance(): SpeechRecognitionService {
        if (!SpeechRecognitionService.instance) {
            SpeechRecognitionService.instance = new SpeechRecognitionService();
        }
        return SpeechRecognitionService.instance;
    }

    public async startRecognition(): Promise<void> {
        if (!this.isSupported && !this.recognition) {
            this.onErrorCallback("Speech recognition is not supported in this browser");
            return;
        }

        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.startMediaRecording(this.audioStream);

            this.recognition?.abort();
            this.recognition?.start();
        } catch (error) {
            this.onErrorCallback(`Error starting recognition: ${error}`);
        }
    }

    public stopRecognition(): void {
        if (this.isSupported && this.recognition) {
            this.recognition.stop();
        }
    }

    private startMediaRecording(stream: MediaStream): void {
        this.audioChunks = [];

        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

            this.onAudioAvailableCallback(audioBlob);

            this.cleanupMediaResources();
        };

        this.mediaRecorder.start();
    }

    private stopMediaRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        } else {
            this.cleanupMediaResources();
        }
    }

    private cleanupMediaResources(): void {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => {
                track.stop();
            });
            this.audioStream = null;
        }
    }

    public forceStop(): void {
        this.stopRecognition();
        this.stopMediaRecording();
        this.cleanupMediaResources();
    }

    public onResult(callback: (transcript: string) => void): void {
        this.onResultCallback = callback;
    }

    public onEnd(callback: () => void): void {
        this.onEndCallback = callback;
    }

    public onError(callback: (error: string) => void): void {
        this.onErrorCallback = callback;
    }

    public onAudioAvailable(callback: (audioBlob: Blob) => void): void {
        this.onAudioAvailableCallback = callback;
    }

    public getIsSupported(): boolean {
        return this.isSupported;
    }

    public getAudioUrl(): string | null {
        if (this.audioChunks.length === 0) {
            return null;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        return URL.createObjectURL(audioBlob);
    }

    public downloadAudio(filename: string = 'grabacion.wav'): boolean {
        const audioUrl = this.getAudioUrl();
        
        if (!audioUrl) {
            return false;
        }
        
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = filename;
        link.click();
        
        return true;
    }
}