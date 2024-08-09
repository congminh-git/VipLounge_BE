import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency, Service } from './agency.entity';
import { Lounge } from '../lounge/lounge.entity';
import { CFRom } from '../cfRom/cfRom.entity';

@Injectable()
export class AgencyService {
    constructor(
        @InjectRepository(Agency)
        private agencyRepository: Repository<Agency>,
        @InjectRepository(Lounge)
        private loungeRepository: Repository<Lounge>,
        @InjectRepository(CFRom)
        private cfromRepository: Repository<CFRom>,
    ) {}

    async getListAgency(): Promise<Agency[]> {
        return this.agencyRepository.find({ relations: ['lounges', 'cfroms'] });
    }

    async getAgencyListServiceOptions(agency: string) {
        if (agency) {
            const lounge = await this.loungeRepository.find({ where: { agencyCode: agency } });
            const cfrom = await this.cfromRepository.find({ where: { agencyCode: agency } });
            return lounge.concat(cfrom);
        }
    }

    async getAgencyById(agencyId: number): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }
        return agency;
    }

    async addAgency(name: string, code: string, service: Service): Promise<Agency> {
        const existingAgencyName = await this.agencyRepository.findOne({ where: { name } });
        if (existingAgencyName) {
            throw new ConflictException('Agency name already exists');
        }
        const existingAgencyCode = await this.agencyRepository.findOne({ where: { code } });
        if (existingAgencyCode) {
            throw new ConflictException('Agency code already exists');
        }
        const newAgency = this.agencyRepository.create({ name, code, service });
        return this.agencyRepository.save(newAgency);
    }

    async updateAgency(name: string, service: Service, agencyId): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
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

    async putActiveAgency(agencyId: number): Promise<Agency> {
        const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
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

    async deleteAgency(agencyId: number): Promise<void> {
        const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
        if (!agency) {
            throw new NotFoundException('Agency not found');
        }

        try {
            await this.agencyRepository.delete(agencyId);
        } catch (error) {
            throw new HttpException('Failed to delete agency.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
