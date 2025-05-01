import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognizer: SpeechSDK.SpeechRecognizer | null = null;
  private audioConfig: SpeechSDK.AudioConfig | null = null;
  private audioStream: MediaStream | null = null;
  private recognizing = false;
  private audioChunks: BlobPart[] = [];
  private mediaRecorder: MediaRecorder | null = null;

  // Callbacks
  private onResultCallback: (text: string) => void = () => {};
  private onErrorCallback: (err: string) => void = () => {};
  private onEndCallback: () => void = () => {};
  private onAudioAvailableCallback: (blob: Blob) => void = () => {};

  private constructor() {}

  public static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }

  public async startRecognition(): Promise<void> {
    try {
      if (this.recognizing) {
        return;
      }
      
      this.recognizing = true;
      
      // 1. Configurar micrófono
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // 2. Configurar grabación para guardar el audio
      this.audioChunks = [];
      const options = { mimeType: 'audio/webm' };
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.mediaRecorder.start(500);
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log(`Recibido chunk de audio: ${e.data.size} bytes`);
          this.audioChunks.push(e.data);
        }
      };
      
      // 3. Configurar reconocimiento desde micrófono DIRECTAMENTE
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        import.meta.env.VITE_API_KEY_AZURE,
        import.meta.env.VITE_API_LOCATION_AZURE        
      );
      
      // Configuraciones importantes
      speechConfig.speechRecognitionLanguage = "es-ES";
      speechConfig.enableDictation(); // Mejor para reconocimiento continuo
      speechConfig.enableAudioLogging(); // Para diagnóstico
      speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;
      
      // Usar micrófono directamente en lugar de stream
      this.audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, this.audioConfig);
      
      // 4. Configurar eventos
      this.recognizer.recognizing = (_s, e) => {
        console.log(`Reconociendo en tiempo real: ${e.result.text}`);
      };
      
      this.recognizer.recognized = (_s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const jsonResult = e.result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
          console.log("Respuesta detallada:", jsonResult);
          
          if (e.result.text && e.result.text.trim().length > 0) {
            this.onResultCallback(e.result.text.toLowerCase().trim());
          } else {
            console.log("Texto vacío reconocido");
          }
        } else {
          console.log("Reconocimiento con reason diferente:", SpeechSDK.ResultReason[e.result.reason]);
        }
      };
      
      this.recognizer.canceled = (_s, e) => {
        this.onErrorCallback(`Error: ${e.errorDetails}, Reason: ${SpeechSDK.CancellationReason[e.reason]}`);
        this.stopRecognition();
      };
      
      this.recognizer.sessionStarted = (_s, e) => {
        console.log(`Sesión iniciada: ${e.sessionId}`);
      };
      
      this.recognizer.sessionStopped = (_s, e) => {
        console.log(`Sesión finalizada: ${e.sessionId}`);
        this.onEndCallback();
      };
      
      // 5. Iniciar reconocimiento
      await new Promise<void>((resolve, reject) => {
        this.recognizer?.startContinuousRecognitionAsync(
          () => {
            resolve();
          },
          (err) => {
            reject(err);
          }
        );
      });
      
    } catch (err: any) {
      console.error("Error iniciando reconocimiento:", err);
      this.onErrorCallback(err.message);
      this.recognizing = false;
    }
  }

  public async stopRecognition(): Promise<void> {
    if (!this.recognizing) return;
    
    console.log("Deteniendo reconocimiento...");
    this.recognizing = false;
    
    try {
      // 1. Detener la grabación
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
        const blob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.onAudioAvailableCallback(blob);
      }
      
      // 2. Detener el reconocimiento
      if (this.recognizer) {
        await new Promise<void>((resolve, reject) => {
          this.recognizer?.stopContinuousRecognitionAsync(
            () => {
              resolve();
            },
            (error) => {
              reject(error);
            }
          );
        });
      }
    } catch (err) {
      console.error("Error al detener:", err);
    } finally {
      // 3. Limpiar recursos
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      this.recognizer = null;
      this.audioConfig = null;
      this.mediaRecorder = null;
      this.onEndCallback();
    }
  }

  public isRecognizing(): boolean {
    return this.recognizing;
  }

  // Métodos para registrar callbacks
  public onResult(cb: (text: string) => void) { this.onResultCallback = cb; }
  public onError(cb: (err: string) => void) { this.onErrorCallback = cb; }
  public onEnd(cb: () => void) { this.onEndCallback = cb; }
  public onAudioAvailable(cb: (blob: Blob) => void) { this.onAudioAvailableCallback = cb; }
}