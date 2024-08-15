import { HttpStatus } from '@nestjs/common';
import { HistoryService, INewTransaction } from './history.service';
import { History } from './history.entity';
export declare class HistoryController {
    private readonly checksService;
    constructor(checksService: HistoryService);
    getListHistory(minDate: any, maxDate: any, agencyCode: any): Promise<{
        data: History[];
        status: number;
        message: string;
    }>;
    addTransaction(body: INewTransaction): Promise<{
        data: History;
        status: HttpStatus;
        message: string;
    }>;
}
