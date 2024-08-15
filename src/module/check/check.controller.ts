import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { CheckService, INewTransaction } from './check.service';
import { History } from '../history/history.entity';

@Controller('check')
export class CheckController {
    constructor(private readonly checksService: CheckService) {}

    @Post()
    async checkService(@Body() body) {
        try {
            const result = await this.checksService.checkService(body);
            return { data: result, status: HttpStatus.CREATED, message: 'History transaction added successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw new HttpException(error.message, error.getStatus());
            } else {
                throw new HttpException('Failed to check service rights.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
