import { Module } from '@nestjs/common';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '../history/history.entity';
import { User } from '../user/user.entity';
import { Agency } from '../agency/agency.entity';
import { HistoryService } from '../history/history.service';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([History, Agency, User])],
    controllers: [CheckController],
    providers: [CheckService, HistoryService],
})
export class CheckModule {}
