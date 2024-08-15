import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './history.entity';
import { User } from '../user/user.entity';
import { Agency } from '../agency/agency.entity';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([History, Agency, User])],
    controllers: [HistoryController],
    providers: [HistoryService],
})
export class HistoryModule {}
