import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AirportService {
    constructor(private readonly httpService: HttpService) {}

    async getListAirport() {
        try {
            const url = `${process.env.VJ_API}/airports`;
            const response = await lastValueFrom(this.httpService.get(url));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get airports: ${error.message}`);
        }
    }
}
