import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { Agency } from './agency.entity';
import { CFRom } from '../cfRom/cfRom.entity';
import { Lounge } from '../lounge/lounge.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Agency, Lounge, CFRom])],
    controllers: [AgencyController],
    providers: [AgencyService],
})
export class AgencyModule {}
