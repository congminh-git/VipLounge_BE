import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Agency } from '../agency/agency.entity';
import { MailerService } from '@nestjs-modules/mailer';
export declare class UserService {
    private usersRepository;
    private agenciesRepository;
    private readonly mailerService;
    constructor(usersRepository: Repository<User>, agenciesRepository: Repository<Agency>, mailerService: MailerService);
    getListUser(): Promise<User[]>;
    getUserById(userId: number): Promise<User>;
    addUser(username: string, email: string, password: string, name: string, phone: string, agencyCode: string, roleName: string, service: string, permissions: string): Promise<User>;
    loginUser(username: string, password: string): Promise<{
        username: string;
        token: string;
        email: string;
        service: string;
        agencyCode: string;
        agencyName: string;
        permissions: string;
        name: string;
        warning?: string;
    }>;
    forgotPassword(username: string, email: string): Promise<{
        message: string;
        expiry: number;
    }>;
    resetPassword(username: string, password: string, verifyCode: string): Promise<User>;
    changePassword(username: string, email: string, oldPassword: string, newPassword: any): Promise<User>;
    putUpdateUser(userId: number, name: string, phone: string, agencyCode: string, roleName: string, service: string, permissions: string): Promise<User>;
    putActiveUser(userId: number): Promise<User>;
    deleteUser(userId: number): Promise<void>;
    generateVerificationCode(length?: number): string;
}
