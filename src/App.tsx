import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { EventBus } from "./game/EventBus";
import QrScannerComponent from "./components/qrscanner";
import { ConfigResponse } from "./types/config.type";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [gameSettings, setGameSettings] = useState<ConfigResponse[] | null>(null);

    const currentScene = (scene_instance: Phaser.Scene) => {
        if (phaserRef.current) {
            phaserRef.current.scene = scene_instance;
        }
    };

    const launchFullScreen = (element: HTMLElement) => {
        
        return () => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        };
    }

    useEffect(() => {
        // Escucha el evento 'auth-success' emitido por QrScannerComponent
        EventBus.on('auth-success', (data: { settings: ConfigResponse[]}) => {
            setLoading(false); // Cambia loading a false cuando la autenticación es exitosa
            setGameSettings(data.settings); // Guarda los settings del juego
        });

        return () => {
            EventBus.off('auth-success'); // Limpia el listener al desmontar el componente
        };
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[100vh]">
                <QrScannerComponent />
            </div>
        )
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} gameSettings={gameSettings}/>
            <button onClick={launchFullScreen(document.documentElement)}>Max</button>
        </div>
    );
}

export default App;
