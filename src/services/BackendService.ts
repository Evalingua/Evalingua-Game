import {AxiosResponse} from "axios";
import { BaseResponse } from "../types/base.type";
import { ConfigResponse } from "../types/config.type";
import api from "../interceptors/axiosConfig";

export class EvaluacionService {
    
    private readonly BASE_URL = '/evaluacion';

    async createResultado(paciente: number): Promise<BaseResponse<ConfigResponse[]>> {
        const response: AxiosResponse<BaseResponse<ConfigResponse[]>> = await api.post(`${this.BASE_URL}/create`, paciente);
        return response.data;
    }

    async createAudio(urlAudio: string): Promise<BaseResponse<string>> {
        const response: AxiosResponse<BaseResponse<string>> = await api.post(`${this.BASE_URL}/audio`, urlAudio);
        return response.data;
    }
}