import { Module } from '@nestjs/common';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryTable } from './check.entity';
import { Lounge } from '../lounge/lounge.entity';
import { CFRom } from '../cfRom/cfRom.entity';
import { User } from '../user/user.entity';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([HistoryTable, Lounge, CFRom, User])],
    controllers: [CheckController],
    providers: [CheckService],
})
export class CheckModule {}
