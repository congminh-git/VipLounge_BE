import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency, Service } from './agency.entity';

@Injectable()
export class AgencyService {
    constructor(
        @InjectRepository(Agency)
        private agencyRepository: Repository<Agency>,
    ) {}

    async getListAgency(): Promise<Agency[]> {
        return this.agencyRepository.find();
    }

    async getAgencyByKey(agencyKey: string): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }
        return agency;
    }

    async addAgency(name: string, code: string, service: Service, airportCode: string): Promise<Agency> {
        const existingAgencyCode = await this.agencyRepository.findOne({ where: { code } });
        if (existingAgencyCode) {
            throw new ConflictException('Agency code already exists');
        }
        const key = code + airportCode + (service === 'lounge' ? 'LOUNGE' : 'CONNECTING');
        const newAgency = this.agencyRepository.create({ key, name, code, service, airportCode });
        return this.agencyRepository.save(newAgency);
    }

    async updateAgency(name: string, service: Service, agencyKey): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }
        agency.name = name;
        agency.service = service;
        try {
            return await this.agencyRepository.save(agency);
        } catch (error) {
            throw new HttpException('Failed to update agency.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async putActiveAgency(agencyKey: string): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }
        const curentStatus = agency.status === 0;
        if (curentStatus) {
            agency.status = 1;
        } else {
            agency.status = 0;
        }
        try {
            return await this.agencyRepository.save(agency);
        } catch (error) {
            throw new HttpException(
                `Failed to ${curentStatus ? 'unactive' : 'active'}.`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async deleteAgency(agencyKey: string) {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }

        try {
            await this.agencyRepository.delete(agencyKey);
        } catch (error) {
            throw new HttpException('Failed to delete agency.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
