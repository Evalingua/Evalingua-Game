import { useEffect, useState } from "react";

let recognition: SpeechRecognition = new webkitSpeechRecognition();

if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
}

const useSpeechRecognition = () => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!recognition) return;

        try {
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                console.log("onresult event: ", event);
                setText(event.results[0][0].transcript);
                recognition.stop();
                setIsListening(false);
            };
        } catch (error) {
            console.error("Error al iniciar el reconocimiento de voz:", error);
        }
    }, []);

    const startListening = () => {
        setText("");
        setIsListening(true);
        recognition.start();
    }

    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    }

    return { text, isListening, startListening, stopListening, hasRecognitionSupport: !!recognition };
}

export default useSpeechRecognition;
