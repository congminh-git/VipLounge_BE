import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
    private readonly defaultHeaders = {
        Authorization: process.env.AUTH,
        Accept: 'application/json',
    };

    constructor(private readonly httpService: HttpService) {}

    private async request(method: string, url: string, headers: any = {}, data?: any): Promise<any> {
        const mergedHeaders = { ...this.defaultHeaders, ...headers };

        try {
            const response = await lastValueFrom(
                this.httpService.request({ method, url, headers: mergedHeaders, data }),
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new HttpException(error.response.data || 'Error from external API', error.response.status);
            } else {
                throw new HttpException('Failed to communicate with external API', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async get(url: string, headers?: any): Promise<any> {
        return this.request('GET', url, headers);
    }

    async post(url: string, headers?: any, data?: any): Promise<any> {
        return this.request('POST', url, headers, data);
    }

    async put(url: string, headers?: any, data?: any): Promise<any> {
        return this.request('PUT', url, headers, data);
    }
}
