"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let HttpClientService = class HttpClientService {
    constructor(httpService) {
        this.httpService = httpService;
        this.defaultHeaders = {
            Authorization: process.env.AUTH,
            Accept: 'application/json',
        };
    }
    async request(method, url, headers = {}, data) {
        const mergedHeaders = { ...this.defaultHeaders, ...headers };
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.request({ method, url, headers: mergedHeaders, data }));
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data || 'Error from external API', error.response.status);
            }
            else {
                throw new common_1.HttpException('Failed to communicate with external API', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async get(url, headers) {
        return this.request('GET', url, headers);
    }
    async post(url, headers, data) {
        return this.request('POST', url, headers, data);
    }
    async put(url, headers, data) {
        return this.request('PUT', url, headers, data);
    }
};
exports.HttpClientService = HttpClientService;
exports.HttpClientService = HttpClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], HttpClientService);
//# sourceMappingURL=http-client.service.js.map