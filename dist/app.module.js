"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("./module/user/user.module");
const agency_module_1 = require("./module/agency/agency.module");
const role_module_1 = require("./module/role/role.module");
const permission_module_1 = require("./module/permission/permission.module");
const user_entity_1 = require("./module/user/user.entity");
const role_entity_1 = require("./module/role/role.entity");
const service_entity_1 = require("./module/service/service.entity");
const agency_entity_1 = require("./module/agency/agency.entity");
const permission_entity_1 = require("./module/permission/permission.entity");
const airport_module_1 = require("./module/airport/airport.module");
const check_module_1 = require("./module/check/check.module");
const mailer_1 = require("@nestjs-modules/mailer");
const history_module_1 = require("./module/history/history.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRoot({
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
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'sql12.freemysqlhosting.net',
                port: 3306,
                username: 'sql12726267',
                password: 'Fje9HPIWx1',
                database: 'sql12726267',
                autoLoadEntities: true,
                synchronize: true,
                entities: [user_entity_1.User, service_entity_1.Service, role_entity_1.Role, agency_entity_1.Agency, permission_entity_1.Permission],
            }),
            user_module_1.UserModule,
            agency_module_1.AgencyModule,
            role_module_1.RoleModule,
            permission_module_1.PermissionModule,
            airport_module_1.AirportModule,
            check_module_1.CheckModule,
            history_module_1.HistoryModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map