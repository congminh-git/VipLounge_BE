import { HttpService } from '@nestjs/axios';
export declare class AirportService {
    private readonly httpService;
    constructor(httpService: HttpService);
    getListAirport(): Promise<any>;
}
