"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agency_controller_1 = require("./agency.controller");
const agency_service_1 = require("./agency.service");
const agency_entity_1 = require("./agency.entity");
let AgencyModule = class AgencyModule {
};
exports.AgencyModule = AgencyModule;
exports.AgencyModule = AgencyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agency_entity_1.Agency])],
        controllers: [agency_controller_1.AgencyController],
        providers: [agency_service_1.AgencyService],
    })
], AgencyModule);
//# sourceMappingURL=agency.module.js.map