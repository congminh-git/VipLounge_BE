import { Agency } from '../agency/agency.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    passwordVerificationCode: string;
    verificationCodeExpiry: string;
    passwordExpiryDate: string;
    name: string;
    phone: string;
    service: string;
    agencyCode: string;
    roleName: string;
    permissions: string;
    status: number;
    failLoginCount: number;
    agency?: Agency;
}
