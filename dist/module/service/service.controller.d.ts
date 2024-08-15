import { ServiceService } from './service.service';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    getListService(): Promise<{
        data: import("./service.entity").Service[];
        status: number;
        message: string;
    }>;
    getServiceById(id: string): Promise<{
        data: import("./service.entity").Service;
        status: number;
        message: string;
    }>;
}
