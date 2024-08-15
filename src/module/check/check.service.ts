import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { History } from '../history/history.entity';
import { User } from '../user/user.entity';
import { Agency } from '../agency/agency.entity';
import { HistoryService } from '../history/history.service';

export interface INewTransaction {
    pnr: string;
    passengerName: string;
    departureTime: string;
    flightCode: string;
    user: string;
    agencyCode: string;
    airportCode: string;
    service: string;
}

interface ICheckBody {
    eligible: boolean;
    pnr?: string;
    passengerName?: string;
    departureTime?: string;
    checkTime?: string;
    user?: string;
    agencyCode?: string;
    airportCode?: string;
    flightCode?: string;
    service?: string;
}

@Injectable()
export class CheckService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(History)
        private HistoryRepository: Repository<History>,
        @InjectRepository(User)
        private userTableRepository: Repository<User>,
        @InjectRepository(Agency)
        private agencyTableRepository: Repository<Agency>,
        private historyService: HistoryService,
    ) {}

    private headers = {
        Authorization: process.env.AUTH,
        Accept: 'application/json',
    };

    async checkService(checkData: any): Promise<any> {
        try {
            const reservationByLocator = await this.getReservationByLocator(checkData.pnr, this.headers);
            const reservationByKey = await this.getReservationByKey(reservationByLocator.key, this.headers);
            const user = await this.userTableRepository.findOne({ where: { username: checkData.user } });
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            if (!checkData.agency) {
                throw new HttpException('Select agency to check', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const agency = await this.agencyTableRepository.findOne({ where: { code: checkData.agency } });
            if (!agency) {
                throw new HttpException('Agency not found', HttpStatus.NOT_FOUND);
            } else {
                if (checkData.service !== agency.service) {
                    throw new HttpException('Agency service is not suitable', HttpStatus.INTERNAL_SERVER_ERROR);
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
                    //Kiểm tra transaction này đã được thêm trước đó hay chưa
                    if (!existingHistory) {
                        const newTransaction: INewTransaction = {
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
                    } else {
                        return { ...result, question: true };
                    }
                } else {
                    return result;
                }
            } else if (checkData.service === 'connecting_flight') {
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
                    //Kiểm tra transaction này đã được thêm trước đó hay chưa
                    if (!existingHistory) {
                        const newTransaction: INewTransaction = {
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
                    } else {
                        return { ...result, question: true };
                    }
                } else {
                    return result;
                }
            }
        } catch (error) {
            console.log(error);
            if (error.response) {
                throw new HttpException(error.response || 'Error from external API', error.status);
            } else {
                throw new HttpException('Failed to get reservation', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    private async checkLounge(
        reservationByKey: any,
        headers: any,
        checkData: any,
        user: User,
        agency: Agency,
    ): Promise<ICheckBody> {
        //List dịch vụ đặc biệt
        const listSpecialService = ['CIPA', 'CIPB', 'CIPC', 'VIPA', 'VIPB', 'VIPC', 'SBOS', 'SBUS'];
        let isjourney;
        let segment;
        let passengerDetail;

        //Kiểm tra hành khách
        const passenger = reservationByKey.passengers.find(
            (element) => element.reservationProfile.lastName + ' ' + element.reservationProfile.firstName,
        );
        if (!passenger) {
            throw new HttpException('Passenger not found in this reservation', HttpStatus.NOT_FOUND);
        }
        const passengerKey = passenger.key;

        // Tìm journey và segment đang kiểm tra
        if (checkData.cityPair && checkData.flightNumber) {
            isjourney = reservationByKey.journeys.find((element) =>
                element.segments.find((isSegment) => {
                    if (
                        isSegment.departure.airport.code === checkData.cityPair.slice(0, 3) &&
                        isSegment.departure.airport.code === agency.airportCode &&
                        this.isFlightDay(isSegment.departure.localScheduledTime, checkData.flightDateNumber) &&
                        checkData.airline === isSegment.flight.airlineCode.code &&
                        checkData.flightNumber === isSegment.flight.flightNumber &&
                        this.isWithinLastHours(isSegment.departure.localScheduledTime, 3)
                    ) {
                        segment = isSegment;
                        return true;
                    }
                }),
            );
        } else {
            isjourney = reservationByKey.journeys.find((element) =>
                element.segments.find((isSegment) => {
                    if (
                        isSegment.departure.airport.code === agency.airportCode &&
                        this.isWithinLastHours(isSegment.departure.localScheduledTime, 3)
                    ) {
                        reservationByKey.passengerLegDetails.forEach((leg) => {
                            if (
                                leg.passenger.key === passenger.key &&
                                leg.journey.key === element.key &&
                                leg.segment.key === isSegment.key &&
                                leg.travelStatus.checkedIn === true
                            ) {
                                segment = isSegment;
                            }
                        });
                        if (segment) {
                            return true;
                        }
                    }
                }),
            );
        }

        if (!isjourney) {
            console.log('Case journey');
            return {
                eligible: false,
            };
        } else {
            passengerDetail = isjourney.passengerJourneyDetails.find(
                (element) => element.passenger.key === passengerKey,
            );
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

        //Kiểm tra theo hạng vé và dịch vụ đặc biệt
        if (
            passengerDetail.bookingCode.description.includes('Skyboss') ||
            passengerDetail.bookingCode.description.includes('Business')
        ) {
            isResponseBody.successStatus = 0;
            return isResponseBody;
        } else if (this.checkSpecialService(passenger, listSpecialService)) {
            isResponseBody.successStatus = 1;
            return isResponseBody;
        }

        // Kiểm tra hạng hội viên
        const loyaltyProgram = passenger.reservationProfile.loyaltyProgram;
        if (loyaltyProgram?.number) {
            const loyaltyProgramData = await this.getLoyaltyProgramData(loyaltyProgram.number, headers);
            if (loyaltyProgramData[0]?.loyaltyAccount?.loyaltyTier?.description === 'Diamond') {
                console.log('Case loyalty');
                return {
                    eligible: false,
                };
            } else {
                isResponseBody.successStatus = 2;
                return isResponseBody;
            }
        }

        console.log('Case final');
        return {
            eligible: false,
        };
    }

    private async checkConnectingFlight(
        reservationByKey: any,
        checkData: any,
        user: User,
        agency: Agency,
    ): Promise<ICheckBody> {
        let journey, segment;
        const passenger = reservationByKey.passengers.find(
            (element) => element.reservationProfile.lastName + ' ' + element.reservationProfile.firstName,
        );

        if (checkData.cityPair && checkData.flightNumber) {
            journey = reservationByKey.journeys.find((element) => {
                if (
                    element.segments.length > 1 &&
                    element.segments[1].departure.airport.code === checkData.cityPair.slice(0, 3) &&
                    this.isFlightDay(element.segments[1].departure.localScheduledTime, checkData.flightDateNumber) &&
                    checkData.airline === element.segments[1].flight.airlineCode.code &&
                    checkData.flightNumber === element.segments[1].flight.flightNumber
                ) {
                    return true;
                }
            });
        } else {
            journey = reservationByKey.journeys.find((element) => {
                if (
                    element.segments.length > 1 &&
                    element.segments[1].departure.airport.code === agency.airportCode
                    // && this.isWithinLastHours(element.segments[1].departure.localScheduledTime,5)
                ) {
                    let isSegment;
                    reservationByKey.passengerLegDetails.forEach((leg) => {
                        if (
                            leg.passenger.key === passenger.key &&
                            leg.journey.key === element.key &&
                            leg.segment.key === element.segments[1].key
                            // && leg.travelStatus.checkedIn === true
                        ) {
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
        } else {
            segment = journey.segments[1];
            const passengerDetail = journey.passengerJourneyDetails.find(
                (element) => element.passenger.key === passenger.key,
            );
            if (!passengerDetail) {
                console.log('case 2');
                return {
                    eligible: false,
                };
            }
            const segment0 = journey.segments[0];
            const segment1 = journey.segments[1];
            // const departure0 = await this.getDeparture(
            //     segment0.departure.airport.code,
            //     segment0.departure.localScheduledTime.split(' ')[0],
            //     reservationByKey.locator,
            //     this.headers,
            // );
            // const departure1 = await this.getDeparture(
            //     segment1.departure.airport.code,
            //     segment1.departure.localScheduledTime.split(' ')[0],
            //     reservationByKey.locator,
            //     this.headers,
            // );

            if (
                // this.compare(
                //     departure0[0].flightStatusLeg.flightLeg.arrival.scheduledTime,
                //     departure1[0].flightStatusLeg.flightLeg.departure.scheduledTime,
                //     5,
                //     24,
                // ) ||
                this.compare(segment0.arrival.scheduledTime, segment1.departure.scheduledTime, 5, 24)
            ) {
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
            } else {
                console.log('case 3');
                return {
                    eligible: false,
                };
            }
        }
    }

    private async getReservationByLocator(pnr: string, headers: any): Promise<any> {
        const urlGetByLocator = `${process.env.VJ_API}/reservations?reservationLocator=${pnr}`;
        const resultByLocator = await lastValueFrom(this.httpService.get(urlGetByLocator, { headers }));
        if (resultByLocator.data.length < 1) {
            throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
        }
        return resultByLocator.data[0];
    }

    private async getReservationByKey(key: string, headers: any): Promise<any> {
        const urlGetByKey = `${process.env.VJ_API}/reservations/${key}`;
        const resultByKey = await lastValueFrom(this.httpService.get(urlGetByKey, { headers }));
        return resultByKey.data;
    }

    private async getDeparture(
        departureAirport: string,
        departureDate: string,
        pnr: string,
        headers: any,
    ): Promise<any> {
        const url = `${process.env.VJ_API}/departures?departures=${departureDate}&departureAirport=${departureAirport}&reservationLocator=${pnr}`;
        const resultByKey = await lastValueFrom(this.httpService.get(url, { headers }));
        return resultByKey.data;
    }

    private async getLoyaltyProgramData(loyaltyNumber: string, headers: any): Promise<any> {
        const urlGetLoyaltyProgram = `${process.env.VJ_API}/frequentFlyers?loyaltyNumber=${loyaltyNumber}`;
        const resultLoyaltyProgram = await lastValueFrom(this.httpService.get(urlGetLoyaltyProgram, { headers }));
        return resultLoyaltyProgram.data;
    }

    private checkSpecialService(passenger: any, listSpecialService: string[]): boolean {
        return !!passenger.passengerServiceRequests.find((element) =>
            listSpecialService.includes(element.serviceRequest?.code),
        );
    }

    private isFlightDay(dateString: string, flightDateNumber: string): boolean {
        const date = new Date(dateString);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diffInDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diffInDays === parseInt(flightDateNumber);
    }

    private isWithinLastHours(time, lastHour: number) {
        const targetTime = new Date(time);
        const currentTime = new Date();
        const manyHoursBefore = new Date(targetTime.getTime() - lastHour * 60 * 60 * 1000);

        return currentTime >= manyHoursBefore && currentTime <= targetTime;
    }

    private compare(time1: string, time2: string, min: number, max: number): boolean {
        const date1 = new Date(time1);
        const date2 = new Date(time2);
        const diff = Math.abs(date2.getTime() - date1.getTime());
        const minMs = min * 60 * 60 * 1000;
        const maxMs = max * 60 * 60 * 1000;
        return diff >= minMs && diff <= maxMs;
    }
}
