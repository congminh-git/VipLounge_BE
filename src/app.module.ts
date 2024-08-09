import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { AgencyModule } from './module/agency/agency.module';
import { LoungeModule } from './module/lounge/lounge.module';
import { CFRomModule } from './module/cfRom/cfRom.module';
import { RoleModule } from './module/role/role.module';
import { PermissionModule } from './module/permission/permission.module';
import { ServiceModule } from './module/service/service.module';
import { User } from './module/user/user.entity';
import { Role } from './module/role/role.entity';
import { Service } from './module/service/service.entity';
import { Agency } from './module/agency/agency.entity';
import { Lounge } from './module/lounge/lounge.entity';
import { CFRom } from './module/cfRom/cfRom.entity';
import { Permission } from './module/permission/permission.entity';
import { AirportModule } from './module/airport/airport.module';
import { CheckModule } from './module/check/check.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'congminh0801@gmail.com',
                    pass: 'hopw tkfc melo ffpo',
                },
            },
            defaults: {
                from: '"No Reply" <noreply@email.com>',
            },
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '',
            database: 'lounge_application',
            autoLoadEntities: true,
            synchronize: true,
            // logging: true,
            entities: [User, Service, Role, Agency, Permission, Lounge, CFRom],
        }),
        UserModule,
        AgencyModule,
        LoungeModule,
        CFRomModule,
        RoleModule,
        PermissionModule,
        AirportModule,
        CheckModule,
        // ServiceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
