import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { User } from '../user/user.entity';
import { Agency } from '../agency/agency.entity';
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
export declare class HistoryService {
    private readonly httpService;
    private HistoryRepository;
    private userTableRepository;
    private agencyTableRepository;
    constructor(httpService: HttpService, HistoryRepository: Repository<History>, userTableRepository: Repository<User>, agencyTableRepository: Repository<Agency>);
    getListHistory(minDateRange: string, maxDateRange: string, agencyCode: string): Promise<History[]>;
    addTransaction(props: INewTransaction): Promise<History>;
}
