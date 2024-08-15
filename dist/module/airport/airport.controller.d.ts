import { AirportService } from './airport.service';
export declare class AirportController {
    private readonly airportsService;
    constructor(airportsService: AirportService);
    getListAirport(): Promise<{
        data: any;
        status: number;
        message: string;
    }>;
}
