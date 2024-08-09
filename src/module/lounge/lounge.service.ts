import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lounge } from './lounge.entity';
import { Agency } from '../agency/agency.entity';

@Injectable()
export class LoungeService {
    constructor(
        @InjectRepository(Lounge)
        private loungeRepository: Repository<Lounge>,
        @InjectRepository(Agency)
        private agencyRepository: Repository<Agency>,
    ) {}

    async getListLounge(): Promise<Lounge[]> {
        return this.loungeRepository.find({ relations: ['agency'] });
    }

    async getLoungeById(loungeId: number): Promise<Lounge> {
        const lounge = await this.loungeRepository.findOne({ where: { id: loungeId } });
        if (!lounge) {
            throw new NotFoundException('Lounge not found');
        }
        return lounge;
    }

    async addLounge(name: string, code: string, agencyCode: string, airportCode: string): Promise<Lounge> {
        const existingLoungeName = await this.loungeRepository.findOne({ where: { name } });
        if (existingLoungeName) {
            throw new ConflictException('Lounge name already exists');
        }
        const existingLoungeCode = await this.loungeRepository.findOne({ where: { code } });
        if (existingLoungeCode) {
            throw new ConflictException('Lounge code already exists');
        }

        const existingAgency = await this.agencyRepository.findOne({ where: { code: agencyCode } });
        if (!existingAgency) {
            throw new ConflictException('Agency does not exist');
        } else {
            if (existingAgency.service !== 'lounge' && existingAgency.service !== 'master') {
                throw new ConflictException("Agency don't have this service");
            }
        }
        const newLounge = this.loungeRepository.create({ name, code, agencyCode, airportCode });
        return this.loungeRepository.save(newLounge);
    }

    async updateLounge(name: string, agencyCode: string, airportCode: string, loungeId): Promise<Lounge> {
        const lounge = await this.loungeRepository.findOne({ where: { id: loungeId } });
        if (!lounge) {
            throw new NotFoundException('Lounge not found');
        }
        const existingAgency = await this.agencyRepository.findOne({ where: { code: agencyCode } });
        if (!existingAgency) {
            throw new ConflictException('Agency does not exist');
        } else {
            if (existingAgency.service !== 'lounge' && existingAgency.service !== 'master') {
                throw new ConflictException("Agency don't have this service");
            }
        }
        lounge.name = name;
        lounge.airportCode = airportCode;
        lounge.agencyCode = agencyCode;
        try {
            return await this.loungeRepository.save(lounge);
        } catch (error) {
            throw new HttpException('Failed to update lounge.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteLounge(loungeId: number): Promise<void> {
        const lounge = await this.loungeRepository.findOne({ where: { id: loungeId } });
        if (!lounge) {
            throw new NotFoundException('Lounge not found');
        }

        try {
            await this.loungeRepository.delete(loungeId);
        } catch (error) {
            throw new HttpException('Failed to delete lounge.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
