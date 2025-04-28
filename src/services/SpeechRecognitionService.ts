import RSRecognition from 'react-speech-recognition';

export class SpeechRecognitionService {
    private static instance: SpeechRecognitionService;
    private nativeRecognition: SpeechRecognition | null = null;
    private useReactLib: boolean;

    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: BlobPart[] = [];
    private audioStream: MediaStream | null = null;

    // Callbacks
    private onResultCallback: (transcript: string) => void = () => {};
    private onEndCallback: () => void = () => {};
    private onErrorCallback: (error: string) => void = () => {};
    private onAudioAvailableCallback: (audioBlob: Blob) => void = () => {};

    private constructor() {
        const hasNative = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        const hasReact = typeof RSRecognition !== 'undefined';
        this.useReactLib = !hasNative && hasReact;

        if (hasNative) {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.nativeRecognition = new SR();
            this.nativeRecognition!.continuous = false;
            this.nativeRecognition!.lang = 'es-ES';
            this.nativeRecognition!.interimResults = false;

            this.nativeRecognition!.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.onResultCallback(transcript);
            };
            this.nativeRecognition!.onend = () => {
                this.stopMediaRecording();
                this.onEndCallback();
            };
            this.nativeRecognition!.onerror = (event) => {
                this.stopMediaRecording();
                this.onErrorCallback(event.error);
            };
        }
    }

    public static getInstance(): SpeechRecognitionService {
        if (!SpeechRecognitionService.instance) {
            SpeechRecognitionService.instance = new SpeechRecognitionService();
            console.log('SpeechRecognitionService instance created');
        }
        return SpeechRecognitionService.instance;
    }

    /**
     * Starts recognition either via react-speech-recognition or native API
     */
    public async startRecognition(): Promise<void> {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }});
            console.log('Audio stream obtained:', this.audioStream);
            await new Promise(res => setTimeout(res, 300));
            this.startMediaRecording(this.audioStream);

            if (this.useReactLib) {
                // Hook into react-speech-recognition
                RSRecognition.startListening({
                    continuous: false,
                    language: 'es-ES'
                });
                // Note: result & error handling via useSpeechRecognition hook in component
            } else if (this.nativeRecognition) {
                //this.nativeRecognition.abort();
                this.nativeRecognition.start();
            } else {
                this.onErrorCallback('Speech recognition not supported');
            }
        } catch (err) {
            this.onErrorCallback(`Error starting recognition: ${err}`);
        }
    }

    public stopRecognition(): void {
        if (this.useReactLib) {
            RSRecognition.stopListening();
            this.onEndCallback();
        } else if (this.nativeRecognition) {
            this.nativeRecognition.stop();
        }
    }

    private startMediaRecording(stream: MediaStream) {
        this.audioChunks = [];
        console.log('Starting media recording...');
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = e => { if (e.data.size) this.audioChunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.onAudioAvailableCallback(blob);
            this.cleanupMediaResources();
        };
        this.mediaRecorder.start();
    }

    private stopMediaRecording() {
        console.log('Stopping media recording...');
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        } else {
            this.cleanupMediaResources();
        }
    }

    private cleanupMediaResources() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(t => t.stop());
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
        if (this.useReactLib) {
            // Components using useSpeechRecognition should forward transcripts
        }
    }
    public onEnd(callback: () => void): void { this.onEndCallback = callback; }
    public onError(callback: (error: string) => void): void { this.onErrorCallback = callback; }
    public onAudioAvailable(callback: (blob: Blob) => void): void { this.onAudioAvailableCallback = callback; }

    public getIsSupported(): boolean {
        return this.useReactLib || !!this.nativeRecognition;
    }

    public getAudioUrl(): string | null {
        if (!this.audioChunks.length) return null;
        const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }

    public downloadAudio(filename = 'grabacion.wav'): boolean {
        const url = this.getAudioUrl();
        if (!url) return false;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        return true;
    }
}