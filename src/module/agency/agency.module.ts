import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { Agency } from './agency.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Agency])],
    controllers: [AgencyController],
    providers: [AgencyService],
})
export class AgencyModule {}
