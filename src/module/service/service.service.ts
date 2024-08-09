import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';

@Injectable()
export class ServiceService {
    constructor(
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
    ) {}

    async getListService(): Promise<Service[]> {
        return this.serviceRepository.find();
    }

    async getServiceById(serviceId: number): Promise<Service> {
        const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
        if (!service) {
            throw new NotFoundException('Service not found');
        }
        return service;
    }
}
