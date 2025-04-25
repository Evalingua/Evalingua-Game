export interface ResultadoRequest {
    evaluacionId: string;
    fonema: string;
    username: string;
    totalResultados: number;
}

export interface ResultadoResponse {
    id: number;
    evaluacionId: string;
    fonemaId: number;
    fonema: string;
    alteracionId: number;
    alteracion: string;
    estadoRegistro: boolean;
    username: string;
    fechaCreacion: string;
}

export interface AudioRequest {
    audioPath: string;
    audioUrl: string;
    resultadoId: number;
    palabra: string;
    posicion: string;
}

export interface AudioResponse {
    id: number;
    audioPath: string;
    fechaGrabacion: string;
}