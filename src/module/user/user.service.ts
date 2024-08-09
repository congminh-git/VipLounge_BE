import { Permission } from './../permission/permission.entity';
import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Agency } from '../agency/agency.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Agency)
        private agencisRepository: Repository<Agency>,
        private readonly mailerService: MailerService,
    ) {}

    async getListUser(): Promise<User[]> {
        return await this.usersRepository.find({ relations: ['agency'] });
    }

    async getUserById(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async addUser(
        username: string,
        email: string,
        password: string,
        name: string,
        phone: string,
        agencyCode: string,
        roleName: string,
        service: string,
        serviceOption: string,
        permissions: string,
    ): Promise<User> {
        const existingUser = await this.usersRepository.findOne({ where: { username: username } });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?!.*[\s])(?!.*[^\w\d]).{6,15}$/;
        if (!passwordRegex.test(password)) {
            throw new ConflictException('Password does not meet the requirements');
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
            serviceOption,
            permissions,
            passwordExpiryDate: passwordExpiryDate.toISOString(),
        });
        return this.usersRepository.save(newUser);
    }

    async loginUser(
        username: string,
        password: string,
    ): Promise<{
        username: string;
        token: string;
        email: string;
        service: string;
        agencyCode: string;
        agencyName: string;
        serviceOption: string;
        permissions: string;
        name: string;
        warning?: string;
    }> {
        console.log(username);
        const user = await this.usersRepository.findOne({ where: { username }, relations: ['agency'] });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (user.status === 1) {
            throw new HttpException("User's account has been inactive", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const currentDate = new Date();
        const passwordExpiryDate = new Date(user.passwordExpiryDate);
        const daysUntilExpiry = (passwordExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysUntilExpiry < 0) {
            user.status = 1;
            await this.usersRepository.save(user);
            throw new HttpException('Password expired, account has been inactive', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (user.agency) {
            const agency = await this.agencisRepository.findOne({ where: { code: user.agencyCode } });
            if (!agency) {
                throw new HttpException("User's agency not found", HttpStatus.NOT_FOUND);
            }
            if (agency.status === 1) {
                throw new HttpException("User's agent has been inactive", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const failCount = user.failLoginCount;
            user.failLoginCount = failCount + 1;
            if (failCount + 1 < 3) {
                await this.usersRepository.save(user);
                throw new UnauthorizedException('Password is wrong');
            } else if (failCount + 1 >= 3 && failCount + 1 < 5) {
                await this.usersRepository.save(user);
                throw new UnauthorizedException(
                    `Password is wrong ${failCount + 1} times. Account will be locked after 5 times`,
                );
            } else if (failCount + 1 === 5) {
                user.status = 1;
                await this.usersRepository.save(user);
                throw new UnauthorizedException(
                    `Password is wrong ${failCount + 1} times. User's account has been inactive`,
                );
            } else {
                throw new UnauthorizedException('Password is wrong');
            }
        }

        user.failLoginCount = 0;
        await this.usersRepository.save(user);

        const email = user.email;
        const service = user.service;
        const agencyCode = user.agency ? user.agency.code : '';
        const agencyName = user.agency ? user.agency.name : '';
        const serviceOption = user.serviceOption;
        const permissions = user.permissions;
        const name = user.name;
        const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '24h' });
        let response = { username, token, email, service, agencyCode, agencyName, serviceOption, permissions, name };

        if (daysUntilExpiry <= 10) {
            return {
                ...response,
                warning: `${Math.ceil(daysUntilExpiry)} days until password expires, update new password before account is locked`,
            };
        }

        return response;
    }

    async forgotPassword(username: string, email: string) {
        const user = await this.usersRepository.findOne({ where: { username: username } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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

    async resetPassword(username: string, password: string, verifyCode: string) {
        const user = await this.usersRepository.findOne({ where: { username: username } });
        console.log(username);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        console.log(user.verificationCodeExpiry);
        if (user.verificationCodeExpiry < new Date().toISOString()) {
            throw new HttpException('Verification code expired', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (user.passwordVerificationCode !== verifyCode) {
            throw new HttpException('Verification code does not match', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?!.*[\s])(?!.*[^\w\d]).{6,15}$/;
        if (!passwordRegex.test(password)) {
            throw new ConflictException('Password does not meet the requirements');
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

    async putUpdateUser(
        userId: number,
        name: string,
        phone: string,
        agencyCode: string,
        roleName: string,
        service: string,
        serviceOption: string,
        permissions: string,
    ): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        } else {
            user.name = name;
            user.phone = phone;
            user.agencyCode = agencyCode;
            user.roleName = roleName;
            user.service = service;
            user.serviceOption = serviceOption;
            user.permissions = permissions;
            return await this.usersRepository.save(user);
        }
    }

    async putActiveUser(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const curentStatus = user.status === 0;
        if (curentStatus) {
            user.status = 1;
        } else {
            user.status = 0;
            user.failLoginCount = 0;
        }
        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new HttpException(
                `Failed to ${curentStatus ? 'unactive' : 'active'}.`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async deleteUser(userId: number): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        try {
            await this.usersRepository.delete(userId);
        } catch (error) {
            throw new HttpException('Failed to delete user.', HttpStatus.INTERNAL_SERVER_ERROR);
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
}
