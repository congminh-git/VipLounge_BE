import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Agency } from '../agency/agency.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [TypeOrmModule.forFeature([User, Agency]), MailerModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
