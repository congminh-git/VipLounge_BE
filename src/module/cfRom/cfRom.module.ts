import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CFRomController } from './cfRom.controller';
import { CFRomService } from './cfRom.service';
import { CFRom } from './cfRom.entity';
import { Agency } from '../agency/agency.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CFRom, Agency])],
    controllers: [CFRomController],
    providers: [CFRomService],
})
export class CFRomModule {}
