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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const history_entity_1 = require("./history.entity");
const user_entity_1 = require("../user/user.entity");
const agency_entity_1 = require("../agency/agency.entity");
let HistoryService = class HistoryService {
    constructor(httpService, HistoryRepository, userTableRepository, agencyTableRepository) {
        this.httpService = httpService;
        this.HistoryRepository = HistoryRepository;
        this.userTableRepository = userTableRepository;
        this.agencyTableRepository = agencyTableRepository;
    }
    async getListHistory(minDateRange, maxDateRange, agencyCode) {
        if (!minDateRange) {
            throw new common_1.HttpException('Missing query param minDateRange', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!maxDateRange) {
            throw new common_1.HttpException('Missing query param maxDateRange', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const adjustedMaxDateRange = new Date(maxDateRange);
        adjustedMaxDateRange.setHours(23, 59, 59, 999);
        if (!agencyCode) {
            return this.HistoryRepository.find({
                where: {
                    checkTime: (0, typeorm_2.Between)(minDateRange, adjustedMaxDateRange.toISOString()),
                },
            });
        }
        else {
            return this.HistoryRepository.find({
                where: {
                    checkTime: (0, typeorm_2.Between)(minDateRange, adjustedMaxDateRange.toISOString()),
                    agencyCode: agencyCode,
                },
            });
        }
    }
    async addTransaction(props) {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        const countTodayEntries = await this.HistoryRepository.count({
            where: {
                checkTime: (0, typeorm_2.Between)(startOfToday, endOfToday),
            },
        });
        const newHistory = this.HistoryRepository.create({
            transactionKey: (props.departureTime.split(' ')[0] +
                props.flightCode +
                countTodayEntries.toString().padStart(3, '0')).replaceAll('-', ''),
            pnr: props.pnr,
            passengerName: props.passengerName,
            departureTime: props.departureTime,
            flightCode: props.flightCode,
            user: props.user,
            agencyCode: props.agencyCode,
            airportCode: props.airportCode,
            service: props.service,
            checkTime: new Date().toISOString(),
        });
        return this.HistoryRepository.save(newHistory);
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(history_entity_1.History)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(agency_entity_1.Agency)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HistoryService);
//# sourceMappingURL=history.service.js.map