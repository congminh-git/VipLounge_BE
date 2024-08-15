"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agency_entity_1 = require("./agency.entity");
let AgencyService = class AgencyService {
    constructor(agencyRepository) {
        this.agencyRepository = agencyRepository;
    }
    async getListAgency() {
        return this.agencyRepository.find();
    }
    async getAgencyByKey(agencyKey) {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new common_1.NotFoundException('Agency not found');
        }
        return agency;
    }
    async addAgency(name, code, service, airportCode) {
        const existingAgencyCode = await this.agencyRepository.findOne({ where: { code } });
        if (existingAgencyCode) {
            throw new common_1.ConflictException('Agency code already exists');
        }
        const key = code + airportCode + (service === 'lounge' ? 'LOUNGE' : 'CONNECTING');
        const newAgency = this.agencyRepository.create({ key, name, code, service, airportCode });
        return this.agencyRepository.save(newAgency);
    }
    async updateAgency(name, service, agencyKey) {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new common_1.NotFoundException('Agency not found');
        }
        agency.name = name;
        agency.service = service;
        try {
            return await this.agencyRepository.save(agency);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to update agency.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async putActiveAgency(agencyKey) {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new common_1.NotFoundException('Agency not found');
        }
        const curentStatus = agency.status === 0;
        if (curentStatus) {
            agency.status = 1;
        }
        else {
            agency.status = 0;
        }
        try {
            return await this.agencyRepository.save(agency);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to ${curentStatus ? 'unactive' : 'active'}.`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteAgency(agencyKey) {
        const agency = await this.agencyRepository.findOne({ where: { key: agencyKey } });
        if (!agency) {
            throw new common_1.NotFoundException('Agency not found');
        }
        try {
            await this.agencyRepository.delete(agencyKey);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to delete agency.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AgencyService = AgencyService;
exports.AgencyService = AgencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agency_entity_1.Agency)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgencyService);
//# sourceMappingURL=agency.service.js.map