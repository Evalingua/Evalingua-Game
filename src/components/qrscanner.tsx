import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import { Config, ConfigResponse } from "../types/config.type";
import { jwtDecode } from "jwt-decode";
import { EventBus } from "../game/EventBus";
import { toast } from "react-toastify";

const QrScannerComponent = () => {
  
  const [scan, setScan] = useState<Config>({} as Config);

  // Función que se ejecuta al detectar un QR
  const handleScan = (result:IDetectedBarcode[]) => {
    if (result) {
        console.log(JSON.parse(result[0].rawValue));
        setScan(JSON.parse(result[0].rawValue))
    }
  };

  const handleDemoLevel = () => {
    const settings: ConfigResponse[] = [
      {segmento: "demo", fonemas: ["m"]},
      {segmento: "demo2", fonemas: ["ñ"]}
    ];
    launchFullScreen(document.documentElement)();

    EventBus.emit('auth-success', { settings });
  }

  useEffect(() => {
    const code = scan.idEvaluacion;
    const settings = scan.settings;

    if (Object.keys(scan).length === 0) {
      return; // Sale del useEffect si 'scan' está vacío
    }

    if (code) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/game-config/get-config/${code}`)
            .then(response => response.json())
            .then(data => {
                const { token } = data.data;

                // Decodificar el token para obtener el username
                const decodedToken = jwtDecode<{ sub: string, evaluacion: string }>(token);
                const username = decodedToken.sub;
                const evaluacion = decodedToken.evaluacion;

                console.log('Token:', token);
                console.log('Username:', username);
                console.log('Evaluacion:', evaluacion);

                // Emitir un evento con el token, configId y username
                localStorage.setItem('token', token);
                launchFullScreen(document.documentElement)();
                EventBus.emit('auth-success', { token, username, settings });
            })
            .catch(error => {
                toast('Error al obtener los datos necesarios', { type: 'error' });
                console.error('Error al obtener token y configId:', error);
            });
    } else {
        toast('Código de autenticación no encontrado.', { type: 'error' });
        console.error('Código de autenticación no encontrado.');
    }
  }, [scan]);

  const launchFullScreen = (element: HTMLElement) => {
      return () => {
          if (element.requestFullscreen) {
              element.requestFullscreen();
          }
      };
  }


  // Función para manejar errores
  const handleError = (error: unknown) => {
    toast(`Error al escanear QR: ${error}`, { type: "error" });
    console.error("Error al escanear QR:", error);
  };

  return (
    <div
      className="h-full bg-zoo bg-contain flex items-center justify-center gap-20">
      <div className="flex flex-col items-start">
        <img src="/assets/logo.png" alt="Evalingua Logo" className="w-96 mb-10" />
        <p className="font-bold text-md md:text-2xl">Escanea el código QR que aparece</p>
        <p className="font-bold text-md md:text-2xl">en el sistema, para iniciar el juego</p>
        <button 
          className="bg-orange-600 p-2 rounded-xl text-xl font-bold mt-4
           border-4 border-orange-900 border-solid
           hover:bg-orange-700 hover:border-orange-800 transition duration-100 ease-in-out"
           onClick={handleDemoLevel}>
          Probar demo
          </button>
      </div>
      <div className="w-96 h-96">
        <Scanner 
          allowMultiple={true}
          styles={{ container: {} }}
          classNames={{ container: "border-4 border-red-600 rounded-lg", video: "rounded-lg" }}
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: "environment" }}
          scanDelay={3000}
          components={{zoom: true}}
        />
      </div>
    </div>
  );
};

export default QrScannerComponent;