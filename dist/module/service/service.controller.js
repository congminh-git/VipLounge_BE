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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const service_service_1 = require("./service.service");
let ServiceController = class ServiceController {
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    async getListService() {
        try {
            const result = await this.serviceService.getListService();
            return { data: result, status: 200, message: 'Successfully retrieved list of services.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to retrieve list service. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async getServiceById(id) {
        const serviceId = parseInt(id, 10);
        try {
            const result = await this.serviceService.getServiceById(serviceId);
            return { data: result, status: 200, message: 'Successfully retrieved service.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Failed to retrieve service. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "getListService", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "getServiceById", null);
exports.ServiceController = ServiceController = __decorate([
    (0, common_1.Controller)('service'),
    __metadata("design:paramtypes", [service_service_1.ServiceService])
], ServiceController);
//# sourceMappingURL=service.controller.js.map