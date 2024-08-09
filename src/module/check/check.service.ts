import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { HistoryTable } from './check.entity';
import { CFRom } from '../cfRom/cfRom.entity';
import { Lounge } from '../lounge/lounge.entity';
import { User } from '../user/user.entity';

export interface INewTransaction {
    pnr: string;
    passengerName: string;
    departureTime: string;
    flightCode: string;
    user: string;
    agencyCode: string;
    airportCode: string;
    service: string;
    serviceOption: string;
}

@Injectable()
export class CheckService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(HistoryTable)
        private historyTableRepository: Repository<HistoryTable>,
        @InjectRepository(Lounge)
        private loungeTableRepository: Repository<Lounge>,
        @InjectRepository(CFRom)
        private cfromTableRepository: Repository<CFRom>,
        @InjectRepository(User)
        private userTableRepository: Repository<User>,
    ) {}

    private headers = {
        Authorization: process.env.AUTH,
        Accept: 'application/json',
    };

    async getListHistoryTable(
        minDateRange: string,
        maxDateRange: string,
        agencyCode: string,
        serviceOptions: string,
    ): Promise<HistoryTable[]> {
        if (!minDateRange) {
            throw new HttpException('Missing query param minDateRange', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!maxDateRange) {
            throw new HttpException('Missing query param maxDateRange', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const adjustedMaxDateRange = new Date(maxDateRange);
        adjustedMaxDateRange.setHours(23, 59, 59, 999);
        if (!agencyCode && !serviceOptions) {
            return this.historyTableRepository.find({
                where: {
                    checkTime: Between(minDateRange, adjustedMaxDateRange.toISOString()),
                },
            });
        } else if (agencyCode && !serviceOptions) {
            return this.historyTableRepository.find({
                where: {
                    checkTime: Between(minDateRange, adjustedMaxDateRange.toISOString()),
                    agencyCode: agencyCode,
                },
            });
        } else if (serviceOptions && serviceOptions) {
            return this.historyTableRepository.find({
                where: {
                    checkTime: Between(minDateRange, adjustedMaxDateRange.toISOString()),
                    agencyCode: agencyCode,
                    serviceOption: serviceOptions,
                },
            });
        }
    }

    async addTransaction(props: INewTransaction): Promise<HistoryTable> {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        //Đếm số lượng hành khách đã sử dụng dịch vụ hôm nay
        const countTodayEntries = await this.historyTableRepository.count({
            where: {
                checkTime: Between(startOfToday, endOfToday),
            },
        });
        //Add History
        const newHistory = this.historyTableRepository.create({
            transactionKey: (
                props.departureTime.split(' ')[0] +
                props.flightCode +
                countTodayEntries.toString().padStart(3, '0')
            ).replaceAll('-', ''),
            pnr: props.pnr,
            passengerName: props.passengerName,
            departureTime: props.departureTime,
            flightCode: props.flightCode,
            user: props.user,
            agencyCode: props.agencyCode,
            airportCode: props.airportCode,
            service: props.service,
            checkTime: new Date().toISOString(),
            serviceOption: props.serviceOption,
        });
        return this.historyTableRepository.save(newHistory);
    }

    async checkService(checkData: any): Promise<any> {
        try {
            const reservationByLocator = await this.getReservationByLocator(checkData.pnr, this.headers);
            const reservationByKey = await this.getReservationByKey(reservationByLocator.key, this.headers);
            const user = await this.userTableRepository.findOne({ where: { username: checkData.user } });
            if (!user) {
                throw new HttpException('User not found', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (checkData.service === 'lounge') {
                const result = await this.checkLounge(reservationByKey, this.headers, checkData, user);
                if (result.eligible) {
                    const existingHistory = await this.historyTableRepository.findOne({
                        where: {
                            pnr: result.pnr,
                            passengerName: result.passengerName,
                            departureTime: result.departureTime,
                            airportCode: result.airportCode,
                            agencyCode: checkData.agencyCode,
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
                            serviceOption: result.serviceOption,
                        };
                        this.addTransaction(newTransaction);
                        return { ...result, question: false };
                    } else {
                        return { ...result, question: true };
                    }
                } else {
                    return result;
                }
            } else if (checkData.service === 'connecting_flight') {
                this.checkConnectingFlight(reservationByKey, checkData);
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
    ): Promise<{
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
        serviceOption?: string;
    }> {
        //List dịch vụ đặc biệt
        const listSpecialService = ['CIPA', 'CIPB', 'CIPC', 'VIPA', 'VIPB', 'VIPC', 'SBOS', 'SBUS'];
        let journey;
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

        //Get thông tin dịch vụ Lounge hoặc Connecting Flight của tài khoản
        const userPermissions = JSON.parse(user.permissions);
        const checkPermission = userPermissions.find((permission) => permission.includes('CHECK'));
        let serviceOption;
        if (checkPermission === 'CHECK_USER_OWNED') {
            serviceOption =
                checkData.service === 'lounge'
                    ? await this.loungeTableRepository.findOne({ where: { code: user.serviceOption } })
                    : await this.cfromTableRepository.findOne({ where: { code: user.serviceOption } });

            if (!serviceOption || checkData.cityPair.slice(0, 3) !== serviceOption.airportCode) {
                return {
                    eligible: false,
                };
            }
        } else if (checkPermission === 'CHECK_AGENCY_OWNED') {
            serviceOption =
                checkData.service === 'lounge'
                    ? await this.loungeTableRepository.findOne({
                          where: {
                              agencyCode: user.agencyCode,
                          },
                      })
                    : await this.cfromTableRepository.findOne({
                          where: {
                              agencyCode: user.agencyCode,
                          },
                      });
            if (!serviceOption || checkData.cityPair.slice(0, 3) !== serviceOption.airportCode) {
                return {
                    eligible: false,
                };
            }
        } else {
            serviceOption =
                checkData.service === 'lounge'
                    ? await this.loungeTableRepository.findOne({
                          where: {
                              airportCode: checkData.cityPair.slice(0, 3),
                          },
                      })
                    : await this.cfromTableRepository.findOne({
                          where: {
                              airportCode: checkData.cityPair.slice(0, 3),
                          },
                      });

            if (!serviceOption) {
                throw new HttpException(`Suitable lounge doesn't exist `, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        // Tìm journey và segment đang kiểm tra
        if (checkData.cityPair && checkData.flightDateNumber) {
            journey = reservationByKey.journeys.find((element) =>
                element.segments.find((isSegment) => {
                    if (
                        isSegment.departure.airport.code === checkData.cityPair.slice(0, 3) &&
                        isSegment.departure.airport.code === serviceOption.airportCode &&
                        this.isFlightDay(isSegment.departure.localScheduledTime, checkData.flightDateNumber) &&
                        checkData.airline === isSegment.flight.airlineCode.code &&
                        checkData.flightNumber === isSegment.flight.flightNumber
                    ) {
                        segment = isSegment;
                        return true;
                    }
                }),
            );
        } else {
            reservationByKey.journeys.forEach((journey) => {
                journey.segments.forEach((element) => {
                    reservationByKey.passengerLegDetails.forEach((legDetail) => {
                        if (
                            legDetail.passenger.key === passengerKey &&
                            legDetail.journey.key === journey.key &&
                            legDetail.segment.key === element.key &&
                            legDetail.travelStatus.checkedIn === true &&
                            this.isWithinLast3Hours(segment.departure.scheduledTime)
                        ) {
                            journey = journey;
                            segment = element;
                        }
                    });
                });
            });
        }

        if (!journey) {
            return {
                eligible: false,
            };
        } else {
            passengerDetail = journey.passengerJourneyDetails.find((element) => element.passenger.key === passengerKey);
        }

        if (!segment) {
            return {
                eligible: false,
            };
        }

        const isResponseBody = {
            eligible: true,
            pnr: checkData.pnr,
            passengerName: checkData.fullName,
            departureTime: segment?.departure.localScheduledTime,
            checkTime: new Date().toString(),
            user: checkData.user,
            agencyCode: serviceOption.agencyCode,
            airportCode: segment ? segment.departure.airport.code : checkData.cityPair.slice(0, 3),
            flightCode: checkData.airline + checkData.flightNumber,
            service: checkData.service,
            serviceOption: serviceOption.code,
        };

        //Kiểm tra theo hạng vé và dịch vụ đặc biệt
        if (
            passengerDetail.bookingCode.description.includes('Skyboss') ||
            passengerDetail.bookingCode.description.includes('Business') ||
            this.checkSpecialService(passenger, listSpecialService)
        ) {
            return isResponseBody;
        }

        // Kiểm tra hạng hội viên
        const loyaltyProgram = passenger.reservationProfile.loyaltyProgram;
        if (loyaltyProgram?.number) {
            const loyaltyProgramData = await this.getLoyaltyProgramData(loyaltyProgram.number, headers);
            if (loyaltyProgramData[0]?.loyaltyAccount?.loyaltyTier?.description === 'Diamond') {
                return {
                    eligible: false,
                };
            } else {
                return isResponseBody;
            }
        }

        return {
            eligible: false,
        };
    }

    private checkConnectingFlight(reservationByKey: any, checkData: any): void {
        console.log('Check');
    }

    private async getReservationByLocator(pnr: string, headers: any): Promise<any> {
        const urlGetByLocator = `${process.env.VJ_API}/reservations?reservationLocator=${pnr}`;
        const resultByLocator = await lastValueFrom(this.httpService.get(urlGetByLocator, { headers }));
        if (!resultByLocator.data.length) {
            throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
        }
        return resultByLocator.data[0];
    }

    private async getReservationByKey(key: string, headers: any): Promise<any> {
        const urlGetByKey = `${process.env.VJ_API}/reservations/${key}`;
        const resultByKey = await lastValueFrom(this.httpService.get(urlGetByKey, { headers }));
        return resultByKey.data;
    }

    private async getDeparture(departureDate: string, locator: string, headers: any): Promise<any> {
        const urlGetByKey = `${process.env.VJ_API}/departures?departures=${departureDate}&reservationLocator=${locator}`;
        const resultByKey = await lastValueFrom(this.httpService.get(urlGetByKey, { headers }));
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

    private isWithinLast3Hours(time) {
        const targetTime = new Date(time);
        const currentTime = new Date();
        const threeHoursBefore = new Date(targetTime.getTime() - 3 * 60 * 60 * 1000);

        return currentTime >= threeHoursBefore && currentTime <= targetTime;
    }
}
