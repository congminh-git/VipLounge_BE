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
exports.CheckController = void 0;
const common_1 = require("@nestjs/common");
const check_service_1 = require("./check.service");
let CheckController = class CheckController {
    constructor(checksService) {
        this.checksService = checksService;
    }
    async checkService(body) {
        try {
            const result = await this.checksService.checkService(body);
            return { data: result, status: common_1.HttpStatus.CREATED, message: 'History transaction added successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw new common_1.HttpException(error.message, error.getStatus());
            }
            else {
                throw new common_1.HttpException('Failed to check service rights.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
exports.CheckController = CheckController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CheckController.prototype, "checkService", null);
exports.CheckController = CheckController = __decorate([
    (0, common_1.Controller)('check'),
    __metadata("design:paramtypes", [check_service_1.CheckService])
], CheckController);
//# sourceMappingURL=check.controller.js.map