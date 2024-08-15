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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const agency_entity_1 = require("../agency/agency.entity");
const mailer_1 = require("@nestjs-modules/mailer");
let UserService = class UserService {
    constructor(usersRepository, agenciesRepository, mailerService) {
        this.usersRepository = usersRepository;
        this.agenciesRepository = agenciesRepository;
        this.mailerService = mailerService;
    }
    async getListUser() {
        return await this.usersRepository.find({ relations: ['agency'] });
    }
    async getUserById(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async addUser(username, email, password, name, phone, agencyCode, roleName, service, permissions) {
        const existingUser = await this.usersRepository.findOne({ where: { username: username } });
        if (existingUser) {
            throw new common_1.ConflictException('Username already exists');
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?!.*[\s])(?!.*[^\w\d]).{6,15}$/;
        if (!passwordRegex.test(password)) {
            throw new common_1.ConflictException('Password does not meet the requirements');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const passwordExpiryDate = new Date();
        passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 90);
        const newUser = this.usersRepository.create({
            username,
            email,
            password: hashedPassword,
            name,
            phone,
            agencyCode,
            roleName,
            service,
            permissions,
            passwordExpiryDate: passwordExpiryDate.toISOString(),
        });
        return this.usersRepository.save(newUser);
    }
    async loginUser(username, password) {
        const user = await this.usersRepository.findOne({ where: { username }, relations: ['agency'] });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.status === 1) {
            throw new common_1.HttpException("User's account has been inactive", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const currentDate = new Date();
        const passwordExpiryDate = new Date(user.passwordExpiryDate);
        const daysUntilExpiry = (passwordExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 0) {
            user.status = 1;
            await this.usersRepository.save(user);
            throw new common_1.HttpException('Password expired, account has been inactive', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (user.agency) {
            const agency = await this.agenciesRepository.findOne({ where: { code: user.agencyCode } });
            if (!agency) {
                throw new common_1.HttpException("User's agency not found", common_1.HttpStatus.NOT_FOUND);
            }
            if (agency.status === 1) {
                throw new common_1.HttpException("User's agent has been inactive", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const failCount = user.failLoginCount;
            user.failLoginCount = failCount + 1;
            if (failCount + 1 < 3) {
                await this.usersRepository.save(user);
                throw new common_1.UnauthorizedException('Password is wrong');
            }
            else if (failCount + 1 >= 3 && failCount + 1 < 5) {
                await this.usersRepository.save(user);
                throw new common_1.UnauthorizedException(`Password is wrong ${failCount + 1} times. Account will be locked after 5 times`);
            }
            else if (failCount + 1 === 5) {
                user.status = 1;
                await this.usersRepository.save(user);
                throw new common_1.UnauthorizedException(`Password is wrong ${failCount + 1} times. User's account has been inactive`);
            }
            else {
                throw new common_1.UnauthorizedException('Password is wrong');
            }
        }
        user.failLoginCount = 0;
        await this.usersRepository.save(user);
        const email = user.email;
        const service = user.service;
        const agencyCode = user.agency ? user.agency.code : '';
        const agencyName = user.agency ? user.agency.name : '';
        const permissions = user.permissions;
        const name = user.name;
        const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '24h' });
        let response = { username, token, email, service, agencyCode, agencyName, permissions, name };
        if (daysUntilExpiry <= 10) {
            return {
                ...response,
                warning: `${Math.ceil(daysUntilExpiry)} days until password expires, update new password before account is locked`,
            };
        }
        return response;
    }
    async forgotPassword(username, email) {
        const user = await this.usersRepository.findOne({ where: { username: username, email: email } });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const verificationCode = this.generateVerificationCode();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 10);
        user.passwordVerificationCode = verificationCode;
        user.verificationCodeExpiry = expiryTime.toISOString();
        await this.usersRepository.save(user);
        await this.mailerService.sendMail({
            from: 'VJ Vip Lounge',
            to: email,
            subject: `Verification code for change password`,
            text: verificationCode,
        });
        return { message: 'Verification code sent to your email', expiry: 600 };
    }
    async resetPassword(username, password, verifyCode) {
        const user = await this.usersRepository.findOne({ where: { username: username } });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        console.log(user.verificationCodeExpiry);
        if (user.verificationCodeExpiry < new Date().toISOString()) {
            throw new common_1.HttpException('Verification code expired', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (user.passwordVerificationCode !== verifyCode) {
            throw new common_1.HttpException('Verification code does not match', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?!.*[\s])(?!.*[^\w\d]).{6,15}$/;
        if (!passwordRegex.test(password)) {
            throw new common_1.ConflictException('Password does not meet the requirements');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordVerificationCode = null;
        user.verificationCodeExpiry = null;
        const passwordExpiryDate = new Date();
        passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 90);
        user.passwordExpiryDate = passwordExpiryDate.toISOString();
        user.failLoginCount = 0;
        return await this.usersRepository.save(user);
    }
    async changePassword(username, email, oldPassword, newPassword) {
        const user = await this.usersRepository.findOne({ where: { username: username, email: email } });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?!.*[\s])(?!.*[^\w\d]).{6,15}$/;
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Old password is wrong');
        }
        if (!passwordRegex.test(newPassword)) {
            throw new common_1.ConflictException('Password does not meet the requirements');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordVerificationCode = null;
        user.verificationCodeExpiry = null;
        const passwordExpiryDate = new Date();
        passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 90);
        user.passwordExpiryDate = passwordExpiryDate.toISOString();
        user.failLoginCount = 0;
        return await this.usersRepository.save(user);
    }
    async putUpdateUser(userId, name, phone, agencyCode, roleName, service, permissions) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        else {
            user.name = name;
            user.phone = phone;
            user.agencyCode = agencyCode;
            user.roleName = roleName;
            user.service = service;
            user.permissions = permissions;
            return await this.usersRepository.save(user);
        }
    }
    async putActiveUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const curentStatus = user.status === 0;
        if (curentStatus) {
            user.status = 1;
        }
        else {
            user.status = 0;
            user.failLoginCount = 0;
        }
        try {
            return await this.usersRepository.save(user);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to ${curentStatus ? 'unactive' : 'active'}.`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        try {
            await this.usersRepository.delete(userId);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to delete user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    generateVerificationCode(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let verificationCode = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            verificationCode += characters[randomIndex];
        }
        return verificationCode;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(agency_entity_1.Agency)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_1.MailerService])
], UserService);
//# sourceMappingURL=user.service.js.map