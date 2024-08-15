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
exports.CheckService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const history_entity_1 = require("../history/history.entity");
const user_entity_1 = require("../user/user.entity");
const agency_entity_1 = require("../agency/agency.entity");
const history_service_1 = require("../history/history.service");
let CheckService = class CheckService {
    constructor(httpService, HistoryRepository, userTableRepository, agencyTableRepository, historyService) {
        this.httpService = httpService;
        this.HistoryRepository = HistoryRepository;
        this.userTableRepository = userTableRepository;
        this.agencyTableRepository = agencyTableRepository;
        this.historyService = historyService;
        this.headers = {
            Authorization: process.env.AUTH,
            Accept: 'application/json',
        };
    }
    async checkService(checkData) {
        try {
            const reservationByLocator = await this.getReservationByLocator(checkData.pnr, this.headers);
            const reservationByKey = await this.getReservationByKey(reservationByLocator.key, this.headers);
            const user = await this.userTableRepository.findOne({ where: { username: checkData.user } });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!checkData.agency) {
                throw new common_1.HttpException('Select agency to check', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const agency = await this.agencyTableRepository.findOne({ where: { code: checkData.agency } });
            if (!agency) {
                throw new common_1.HttpException('Agency not found', common_1.HttpStatus.NOT_FOUND);
            }
            else {
                if (checkData.service !== agency.service) {
                    throw new common_1.HttpException('Agency service is not suitable', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            if (checkData.service === 'lounge') {
                const result = await this.checkLounge(reservationByKey, this.headers, checkData, user, agency);
                if (result.eligible) {
                    const existingHistory = await this.HistoryRepository.findOne({
                        where: {
                            pnr: result.pnr,
                            passengerName: result.passengerName,
                            departureTime: result.departureTime,
                            airportCode: result.airportCode,
                            agencyCode: checkData.agency,
                        },
                    });
                    if (!existingHistory) {
                        const newTransaction = {
                            pnr: result.pnr,
                            passengerName: result.passengerName,
                            departureTime: result.departureTime,
                            flightCode: checkData.airline + checkData.flightNumber,
                            user: checkData.user,
                            agencyCode: result.agencyCode,
                            airportCode: result.airportCode,
                            service: checkData.service,
                        };
                        this.historyService.addTransaction(newTransaction);
                        return { ...result, question: false };
                    }
                    else {
                        return { ...result, question: true };
                    }
                }
                else {
                    return result;
                }
            }
            else if (checkData.service === 'connecting_flight') {
                const result = await this.checkConnectingFlight(reservationByKey, checkData, user, agency);
                if (result.eligible) {
                    const existingHistory = await this.HistoryRepository.findOne({
                        where: {
                            pnr: result.pnr,
                            passengerName: result.passengerName,
                            departureTime: result.departureTime,
                            airportCode: result.airportCode,
                            agencyCode: checkData.agency,
                        },
                    });
                    if (!existingHistory) {
                        const newTransaction = {
                            pnr: result.pnr,
                            passengerName: result.passengerName,
                            departureTime: result.departureTime,
                            flightCode: result.flightCode,
                            user: checkData.user,
                            agencyCode: result.agencyCode,
                            airportCode: result.airportCode,
                            service: checkData.service,
                        };
                        this.historyService.addTransaction(newTransaction);
                        return { ...result, question: false };
                    }
                    else {
                        return { ...result, question: true };
                    }
                }
                else {
                    return result;
                }
            }
        }
        catch (error) {
            console.log(error);
            if (error.response) {
                throw new common_1.HttpException(error.response || 'Error from external API', error.status);
            }
            else {
                throw new common_1.HttpException('Failed to get reservation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async checkLounge(reservationByKey, headers, checkData, user, agency) {
        const listSpecialService = ['CIPA', 'CIPB', 'CIPC', 'VIPA', 'VIPB', 'VIPC', 'SBOS', 'SBUS'];
        let isjourney;
        let segment;
        let passengerDetail;
        const passenger = reservationByKey.passengers.find((element) => element.reservationProfile.lastName + ' ' + element.reservationProfile.firstName);
        if (!passenger) {
            throw new common_1.HttpException('Passenger not found in this reservation', common_1.HttpStatus.NOT_FOUND);
        }
        const passengerKey = passenger.key;
        if (checkData.cityPair && checkData.flightNumber) {
            isjourney = reservationByKey.journeys.find((element) => element.segments.find((isSegment) => {
                if (isSegment.departure.airport.code === checkData.cityPair.slice(0, 3) &&
                    isSegment.departure.airport.code === agency.airportCode &&
                    this.isFlightDay(isSegment.departure.localScheduledTime, checkData.flightDateNumber) &&
                    checkData.airline === isSegment.flight.airlineCode.code &&
                    checkData.flightNumber === isSegment.flight.flightNumber &&
                    this.isWithinLastHours(isSegment.departure.localScheduledTime, 3)) {
                    segment = isSegment;
                    return true;
                }
            }));
        }
        else {
            isjourney = reservationByKey.journeys.find((element) => element.segments.find((isSegment) => {
                if (isSegment.departure.airport.code === agency.airportCode &&
                    this.isWithinLastHours(isSegment.departure.localScheduledTime, 3)) {
                    reservationByKey.passengerLegDetails.forEach((leg) => {
                        if (leg.passenger.key === passenger.key &&
                            leg.journey.key === element.key &&
                            leg.segment.key === isSegment.key &&
                            leg.travelStatus.checkedIn === true) {
                            segment = isSegment;
                        }
                    });
                    if (segment) {
                        return true;
                    }
                }
            }));
        }
        if (!isjourney) {
            console.log('Case journey');
            return {
                eligible: false,
            };
        }
        else {
            passengerDetail = isjourney.passengerJourneyDetails.find((element) => element.passenger.key === passengerKey);
        }
        if (!segment) {
            console.log('Case segment');
            return {
                eligible: false,
            };
        }
        let isResponseBody = {
            eligible: true,
            pnr: checkData.pnr,
            passengerName: checkData.fullName,
            departureTime: segment?.departure.localScheduledTime,
            checkTime: new Date().toString(),
            user: checkData.user,
            agencyCode: agency.code,
            airportCode: segment ? segment.departure.airport.code : checkData.cityPair.slice(0, 3),
            flightCode: segment.flight.airlineCode.code + segment.flight.flightNumber,
            service: checkData.service,
            passenger: passenger,
            journey: isjourney,
            segment: segment,
            successStatus: 0,
        };
        if (passengerDetail.bookingCode.description.includes('Skyboss') ||
            passengerDetail.bookingCode.description.includes('Business')) {
            isResponseBody.successStatus = 0;
            return isResponseBody;
        }
        else if (this.checkSpecialService(passenger, listSpecialService)) {
            isResponseBody.successStatus = 1;
            return isResponseBody;
        }
        const loyaltyProgram = passenger.reservationProfile.loyaltyProgram;
        if (loyaltyProgram?.number) {
            const loyaltyProgramData = await this.getLoyaltyProgramData(loyaltyProgram.number, headers);
            if (loyaltyProgramData[0]?.loyaltyAccount?.loyaltyTier?.description === 'Diamond') {
                console.log('Case loyalty');
                return {
                    eligible: false,
                };
            }
            else {
                isResponseBody.successStatus = 2;
                return isResponseBody;
            }
        }
        console.log('Case final');
        return {
            eligible: false,
        };
    }
    async checkConnectingFlight(reservationByKey, checkData, user, agency) {
        let journey, segment;
        const passenger = reservationByKey.passengers.find((element) => element.reservationProfile.lastName + ' ' + element.reservationProfile.firstName);
        if (checkData.cityPair && checkData.flightNumber) {
            journey = reservationByKey.journeys.find((element) => {
                if (element.segments.length > 1 &&
                    element.segments[1].departure.airport.code === checkData.cityPair.slice(0, 3) &&
                    this.isFlightDay(element.segments[1].departure.localScheduledTime, checkData.flightDateNumber) &&
                    checkData.airline === element.segments[1].flight.airlineCode.code &&
                    checkData.flightNumber === element.segments[1].flight.flightNumber) {
                    return true;
                }
            });
        }
        else {
            journey = reservationByKey.journeys.find((element) => {
                if (element.segments.length > 1 &&
                    element.segments[1].departure.airport.code === agency.airportCode) {
                    let isSegment;
                    reservationByKey.passengerLegDetails.forEach((leg) => {
                        if (leg.passenger.key === passenger.key &&
                            leg.journey.key === element.key &&
                            leg.segment.key === element.segments[1].key) {
                            isSegment = element.segments[1];
                        }
                    });
                    if (isSegment) {
                        return true;
                    }
                }
            });
        }
        if (!journey || journey.segments.length < 2) {
            return {
                eligible: false,
            };
        }
        else {
            segment = journey.segments[1];
            const passengerDetail = journey.passengerJourneyDetails.find((element) => element.passenger.key === passenger.key);
            if (!passengerDetail) {
                console.log('case 2');
                return {
                    eligible: false,
                };
            }
            const segment0 = journey.segments[0];
            const segment1 = journey.segments[1];
            if (this.compare(segment0.arrival.scheduledTime, segment1.departure.scheduledTime, 5, 24)) {
                const isResponseBody = {
                    eligible: true,
                    pnr: checkData.pnr,
                    passengerName: checkData.fullName,
                    departureTime: segment?.departure.localScheduledTime,
                    checkTime: new Date().toString(),
                    user: checkData.user,
                    agencyCode: agency.code,
                    airportCode: segment ? segment.departure.airport.code : checkData.cityPair.slice(0, 3),
                    flightCode: segment
                        ? segment.flight.airlineCode.code + segment.flight.flightNumber
                        : checkData.airline + checkData.flightNumber,
                    service: checkData.service,
                    passenger: passenger,
                    journey: journey,
                    segment: segment,
                    successStatus: 3,
                };
                return isResponseBody;
            }
            else {
                console.log('case 3');
                return {
                    eligible: false,
                };
            }
        }
    }
    async getReservationByLocator(pnr, headers) {
        const urlGetByLocator = `${process.env.VJ_API}/reservations?reservationLocator=${pnr}`;
        const resultByLocator = await (0, rxjs_1.lastValueFrom)(this.httpService.get(urlGetByLocator, { headers }));
        if (resultByLocator.data.length < 1) {
            throw new common_1.HttpException('Reservation not found', common_1.HttpStatus.NOT_FOUND);
        }
        return resultByLocator.data[0];
    }
    async getReservationByKey(key, headers) {
        const urlGetByKey = `${process.env.VJ_API}/reservations/${key}`;
        const resultByKey = await (0, rxjs_1.lastValueFrom)(this.httpService.get(urlGetByKey, { headers }));
        return resultByKey.data;
    }
    async getDeparture(departureAirport, departureDate, pnr, headers) {
        const url = `${process.env.VJ_API}/departures?departures=${departureDate}&departureAirport=${departureAirport}&reservationLocator=${pnr}`;
        const resultByKey = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, { headers }));
        return resultByKey.data;
    }
    async getLoyaltyProgramData(loyaltyNumber, headers) {
        const urlGetLoyaltyProgram = `${process.env.VJ_API}/frequentFlyers?loyaltyNumber=${loyaltyNumber}`;
        const resultLoyaltyProgram = await (0, rxjs_1.lastValueFrom)(this.httpService.get(urlGetLoyaltyProgram, { headers }));
        return resultLoyaltyProgram.data;
    }
    checkSpecialService(passenger, listSpecialService) {
        return !!passenger.passengerServiceRequests.find((element) => listSpecialService.includes(element.serviceRequest?.code));
    }
    isFlightDay(dateString, flightDateNumber) {
        const date = new Date(dateString);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diffInDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diffInDays === parseInt(flightDateNumber);
    }
    isWithinLastHours(time, lastHour) {
        const targetTime = new Date(time);
        const currentTime = new Date();
        const manyHoursBefore = new Date(targetTime.getTime() - lastHour * 60 * 60 * 1000);
        return currentTime >= manyHoursBefore && currentTime <= targetTime;
    }
    compare(time1, time2, min, max) {
        const date1 = new Date(time1);
        const date2 = new Date(time2);
        const diff = Math.abs(date2.getTime() - date1.getTime());
        const minMs = min * 60 * 60 * 1000;
        const maxMs = max * 60 * 60 * 1000;
        return diff >= minMs && diff <= maxMs;
    }
};
exports.CheckService = CheckService;
exports.CheckService = CheckService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(history_entity_1.History)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(agency_entity_1.Agency)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        history_service_1.HistoryService])
], CheckService);
//# sourceMappingURL=check.service.js.map