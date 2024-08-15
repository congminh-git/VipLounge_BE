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
exports.AgencyController = void 0;
const common_1 = require("@nestjs/common");
const agency_service_1 = require("./agency.service");
const agency_entity_1 = require("./agency.entity");
let AgencyController = class AgencyController {
    constructor(agencyService) {
        this.agencyService = agencyService;
    }
    async getListAgency() {
        try {
            const result = await this.agencyService.getListAgency();
            return { data: result, status: 200, message: 'Successfully retrieved list of agencys.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                throw new common_1.HttpException('Failed to retrieve list agency. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async getAgencyByKey(agencyKey) {
        try {
            const result = await this.agencyService.getAgencyByKey(agencyKey);
            return { data: result, status: 200, message: 'Successfully retrieved agency.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to retrieve agency. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async addAgency(agencyData) {
        try {
            const result = await this.agencyService.addAgency(agencyData.name, agencyData.code, agencyData.service, agencyData.airportCode);
            return { data: result, status: common_1.HttpStatus.CREATED, message: 'Agency added successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to add agency.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async updateAgency(agencyData, agencyKey) {
        try {
            const result = await this.agencyService.updateAgency(agencyData.name, agencyData.service, agencyKey);
            return { data: result, status: common_1.HttpStatus.OK, message: 'Agency update successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to update agency.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async putActiveAgency(agencyKey) {
        try {
            const result = await this.agencyService.putActiveAgency(agencyKey);
            return { data: result, status: common_1.HttpStatus.OK, message: 'Successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to lock user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async deleteAgency(agencyKey) {
        try {
            const result = await this.agencyService.deleteAgency(agencyKey);
            return { data: result, status: common_1.HttpStatus.OK, message: 'Agency delete successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to delete agency.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
exports.AgencyController = AgencyController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "getListAgency", null);
__decorate([
    (0, common_1.Get)(':agencyKey'),
    __param(0, (0, common_1.Param)('agencyKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "getAgencyByKey", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agency_entity_1.Agency]),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "addAgency", null);
__decorate([
    (0, common_1.Put)('update/:agencyKey'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('agencyKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agency_entity_1.Agency, String]),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "updateAgency", null);
__decorate([
    (0, common_1.Put)('active/:agencyKey'),
    __param(0, (0, common_1.Param)('agencyKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "putActiveAgency", null);
__decorate([
    (0, common_1.Delete)('/:agencyKey'),
    __param(0, (0, common_1.Param)('agencyKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgencyController.prototype, "deleteAgency", null);
exports.AgencyController = AgencyController = __decorate([
    (0, common_1.Controller)('agency'),
    __metadata("design:paramtypes", [agency_service_1.AgencyService])
], AgencyController);
//# sourceMappingURL=agency.controller.js.map