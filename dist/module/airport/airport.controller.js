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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportController = void 0;
const common_1 = require("@nestjs/common");
const airport_service_1 = require("./airport.service");
let AirportController = class AirportController {
    constructor(airportsService) {
        this.airportsService = airportsService;
    }
    async getListAirport() {
        try {
            const result = await this.airportsService.getListAirport();
            return { data: result, status: 200, message: 'Successfully retrieved list of airports.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                throw new common_1.HttpException('Failed to retrieve list airports. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
exports.AirportController = AirportController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AirportController.prototype, "getListAirport", null);
exports.AirportController = AirportController = __decorate([
    (0, common_1.Controller)('airport'),
    __metadata("design:paramtypes", [airport_service_1.AirportService])
], AirportController);
//# sourceMappingURL=airport.controller.js.map