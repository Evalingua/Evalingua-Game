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

    useEffect(() => {
        // Escucha el evento 'auth-success' emitido por QrScannerComponent
        EventBus.on('auth-success', (data: { settings: ConfigResponse[]}) => {
            setLoading(false); // Cambia loading a false cuando la autenticación es exitosa
            setGameSettings(data.settings); // Guarda los settings del juego
        });

        EventBus.on('game-over', () => {
            // Opcional: destruye o reinicia tu juego Phaser
            if (phaserRef.current) {
                phaserRef.current.game?.destroy(true);
                phaserRef.current.scene = null;
                phaserRef.current.game = null;
                phaserRef.current = null;
            }
            setLoading(true);
            setGameSettings(null);
        });

        return () => {
            EventBus.off('auth-success');
            EventBus.off('game-over');
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
        </div>
    );
}

export default App;
