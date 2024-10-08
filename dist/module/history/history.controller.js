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
exports.HistoryController = void 0;
const common_1 = require("@nestjs/common");
const history_service_1 = require("./history.service");
let HistoryController = class HistoryController {
    constructor(checksService) {
        this.checksService = checksService;
    }
    async getListHistory(minDate, maxDate, agencyCode) {
        try {
            const result = await this.checksService.getListHistory(minDate, maxDate, agencyCode);
            return { data: result, status: 200, message: 'Successfully retrieved list of checks.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                throw new common_1.HttpException('Failed to retrieve list checks. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async addTransaction(body) {
        try {
            const result = await this.checksService.addTransaction(body);
            return { data: result, status: common_1.HttpStatus.CREATED, message: 'History transaction added successfully.' };
        }
        catch (error) {
            console.log(error);
            if (error instanceof common_1.HttpException) {
                throw new common_1.HttpException(error.message, error.getStatus());
            }
            else {
                throw new common_1.HttpException('Failed to add history transaction.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
exports.HistoryController = HistoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('minDate')),
    __param(1, (0, common_1.Query)('maxDate')),
    __param(2, (0, common_1.Query)('agencyCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "getListHistory", null);
__decorate([
    (0, common_1.Post)('addTransaction'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "addTransaction", null);
exports.HistoryController = HistoryController = __decorate([
    (0, common_1.Controller)('history'),
    __metadata("design:paramtypes", [history_service_1.HistoryService])
], HistoryController);
//# sourceMappingURL=history.controller.js.map