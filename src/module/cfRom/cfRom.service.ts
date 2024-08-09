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
import { CFRom } from './cfRom.entity';
import { Agency } from '../agency/agency.entity';

@Injectable()
export class CFRomService {
    constructor(
        @InjectRepository(CFRom)
        private cfRomRepository: Repository<CFRom>,
        @InjectRepository(Agency)
        private agencyRepository: Repository<Agency>,
    ) {}

    async getListCFRom(): Promise<CFRom[]> {
        return this.cfRomRepository.find({ relations: ['agency'] });
    }

    async getCFRomById(cfRomId: number): Promise<CFRom> {
        const cfroom = await this.cfRomRepository.findOne({ where: { id: cfRomId } });
        if (!cfroom) {
            throw new NotFoundException('Connecting flight room not found');
        }
        return cfroom;
    }

    async addCFRom(name: string, code: string, agencyCode: string, airportCode: string): Promise<CFRom> {
        const existingCFRomName = await this.cfRomRepository.findOne({ where: { name } });
        if (existingCFRomName) {
            throw new ConflictException('Connecting flight room name already exists');
        }
        const existingCFRomCode = await this.cfRomRepository.findOne({ where: { code } });
        if (existingCFRomCode) {
            throw new ConflictException('Connecting flight room code already exists');
        }
        const existingAgency = await this.agencyRepository.findOne({ where: { code: agencyCode } });
        if (!existingAgency) {
            throw new ConflictException('Agency does not exist');
        } else {
            if (existingAgency.service !== 'connecting_flight' && existingAgency.service !== 'master') {
                throw new ConflictException("Agency don't have this service");
            }
        }
        const newCFRom = this.cfRomRepository.create({ name, code, agencyCode, airportCode });
        return this.cfRomRepository.save(newCFRom);
    }

    async updateCFRom(name: string, agencyCode: string, airportCode: string, cfRomId): Promise<CFRom> {
        const cfRom = await this.cfRomRepository.findOne({ where: { id: cfRomId } });
        if (!cfRom) {
            throw new NotFoundException('Connecting flight room not found');
        }
        const existingAgency = await this.agencyRepository.findOne({ where: { code: agencyCode } });
        if (!existingAgency) {
            throw new ConflictException('Agency does not exist');
        } else {
            if (existingAgency.service !== 'connecting_flight' && existingAgency.service !== 'master') {
                throw new ConflictException("Agency don't have this service");
            }
        }
        cfRom.name = name;
        cfRom.airportCode = airportCode;
        cfRom.agencyCode = agencyCode;
        try {
            return await this.cfRomRepository.save(cfRom);
        } catch (error) {
            throw new HttpException('Failed to update connecting flight room.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteCFRom(cfRomId: number): Promise<void> {
        const cfRom = await this.cfRomRepository.findOne({ where: { id: cfRomId } });
        if (!cfRom) {
            throw new NotFoundException('Connecting flight room not found');
        }

        try {
            await this.cfRomRepository.delete(cfRomId);
        } catch (error) {
            throw new HttpException('Failed to delete connecting flight room.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
