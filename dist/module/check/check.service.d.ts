import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
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
export declare class CheckService {
    private readonly httpService;
    private HistoryRepository;
    private userTableRepository;
    private agencyTableRepository;
    private historyService;
    constructor(httpService: HttpService, HistoryRepository: Repository<History>, userTableRepository: Repository<User>, agencyTableRepository: Repository<Agency>, historyService: HistoryService);
    private headers;
    checkService(checkData: any): Promise<any>;
    private checkLounge;
    private checkConnectingFlight;
    private getReservationByLocator;
    private getReservationByKey;
    private getDeparture;
    private getLoyaltyProgramData;
    private checkSpecialService;
    private isFlightDay;
    private isWithinLastHours;
    private compare;
}
