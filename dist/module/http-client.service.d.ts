import { HttpService } from '@nestjs/axios';
export declare class HttpClientService {
    private readonly httpService;
    private readonly defaultHeaders;
    constructor(httpService: HttpService);
    private request;
    get(url: string, headers?: any): Promise<any>;
    post(url: string, headers?: any, data?: any): Promise<any>;
    put(url: string, headers?: any, data?: any): Promise<any>;
}
