export interface Config {
    idEvaluacion: string;
    settings: ConfigResponse[]
}

export interface ConfigResponse {
    segmento: string;
    fonemas: string[];
}