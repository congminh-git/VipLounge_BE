import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

@Injectable()
export class HistoryService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(History)
        private HistoryRepository: Repository<History>,
        @InjectRepository(User)
        private userTableRepository: Repository<User>,
        @InjectRepository(Agency)
        private agencyTableRepository: Repository<Agency>,
    ) {}

    async getListHistory(minDateRange: string, maxDateRange: string, agencyCode: string): Promise<History[]> {
        if (!minDateRange) {
            throw new HttpException('Missing query param minDateRange', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!maxDateRange) {
            throw new HttpException('Missing query param maxDateRange', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const adjustedMaxDateRange = new Date(maxDateRange);
        adjustedMaxDateRange.setHours(23, 59, 59, 999);
        if (!agencyCode) {
            return this.HistoryRepository.find({
                where: {
                    checkTime: Between(minDateRange, adjustedMaxDateRange.toISOString()),
                },
            });
        } else {
            return this.HistoryRepository.find({
                where: {
                    checkTime: Between(minDateRange, adjustedMaxDateRange.toISOString()),
                    agencyCode: agencyCode,
                },
            });
        }
    }

    async addTransaction(props: INewTransaction): Promise<History> {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        //Đếm số lượng hành khách đã sử dụng dịch vụ hôm nay
        const countTodayEntries = await this.HistoryRepository.count({
            where: {
                checkTime: Between(startOfToday, endOfToday),
            },
        });
        //Add History
        const newHistory = this.HistoryRepository.create({
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
        });
        return this.HistoryRepository.save(newHistory);
    }
}
