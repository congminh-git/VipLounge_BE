import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoungeController } from './lounge.controller';
import { LoungeService } from './lounge.service';
import { Lounge } from './lounge.entity';
import { Agency } from '../agency/agency.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lounge, Agency])],
    controllers: [LoungeController],
    providers: [LoungeService],
})
export class LoungeModule {}
