import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { AirportService } from './airport.service';

@Controller('airport')
export class AirportController {
    constructor(private readonly airportsService: AirportService) {}

    @Get()
    async getListAirport() {
        try {
            const result = await this.airportsService.getListAirport();
            return { data: result, status: 200, message: 'Successfully retrieved list of airports.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                throw new HttpException(
                    'Failed to retrieve list airports. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
