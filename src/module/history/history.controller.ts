import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { HistoryService, INewTransaction } from './history.service';
import { History } from './history.entity';

@Controller('history')
export class HistoryController {
    constructor(private readonly checksService: HistoryService) {}

    @Get()
    async getListHistory(@Query('minDate') minDate, @Query('maxDate') maxDate, @Query('agencyCode') agencyCode) {
        try {
            const result = await this.checksService.getListHistory(minDate, maxDate, agencyCode);
            return { data: result, status: 200, message: 'Successfully retrieved list of checks.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                throw new HttpException(
                    'Failed to retrieve list checks. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Post('addTransaction')
    async addTransaction(@Body() body: INewTransaction) {
        try {
            const result = await this.checksService.addTransaction(body);
            return { data: result, status: HttpStatus.CREATED, message: 'History transaction added successfully.' };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) {
                throw new HttpException(error.message, error.getStatus());
            } else {
                throw new HttpException('Failed to add history transaction.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
