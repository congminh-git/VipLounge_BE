import { HttpStatus } from '@nestjs/common';
import { CheckService } from './check.service';
export declare class CheckController {
    private readonly checksService;
    constructor(checksService: CheckService);
    checkService(body: any): Promise<{
        data: any;
        status: HttpStatus;
        message: string;
    }>;
}
