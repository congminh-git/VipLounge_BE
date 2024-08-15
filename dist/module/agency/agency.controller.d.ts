import { HttpStatus } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from './agency.entity';
export declare class AgencyController {
    private readonly agencyService;
    constructor(agencyService: AgencyService);
    getListAgency(): Promise<{
        data: Agency[];
        status: number;
        message: string;
    }>;
    getAgencyByKey(agencyKey: string): Promise<{
        data: Agency;
        status: number;
        message: string;
    }>;
    addAgency(agencyData: Agency): Promise<{
        data: Agency;
        status: HttpStatus;
        message: string;
    }>;
    updateAgency(agencyData: Agency, agencyKey: string): Promise<{
        data: Agency;
        status: HttpStatus;
        message: string;
    }>;
    putActiveAgency(agencyKey: string): Promise<{
        data: Agency;
        status: HttpStatus;
        message: string;
    }>;
    deleteAgency(agencyKey: string): Promise<{
        data: void;
        status: HttpStatus;
        message: string;
    }>;
}
