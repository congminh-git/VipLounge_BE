import { Repository } from 'typeorm';
import { Service } from './service.entity';
export declare class ServiceService {
    private serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    getListService(): Promise<Service[]>;
    getServiceById(serviceId: number): Promise<Service>;
}
