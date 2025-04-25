import {AxiosResponse} from "axios";
import { BaseResponse } from "../types/base.type";
import api from "../interceptors/axiosConfig";
import { AudioRequest, AudioResponse, ResultadoRequest, ResultadoResponse } from "../types/backend.type";

export class BackendService {

    async createResultado(request: ResultadoRequest): Promise<BaseResponse<ResultadoResponse>> {
        const response: AxiosResponse<BaseResponse<ResultadoResponse>> = await api.post(`resultado/create`, request);
        return response.data;
    }

    async createAudio(request: AudioRequest): Promise<BaseResponse<AudioResponse>> {
        const response: AxiosResponse<BaseResponse<AudioResponse>> = await api.post(`/audio/create`, request);
        return response.data;
    }
}