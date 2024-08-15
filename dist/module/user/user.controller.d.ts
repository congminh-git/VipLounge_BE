import { HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getListUser(): Promise<{
        data: User[];
        status: number;
        message: string;
    }>;
    getUserById(id: string): Promise<{
        data: User;
        status: number;
        message: string;
    }>;
    addUser(userData: User): Promise<{
        data: User;
        status: HttpStatus;
        message: string;
    }>;
    loginUser(userData: {
        username: string;
        password: string;
    }): Promise<{
        data: {
            username: string;
            token: string;
            email: string;
            service: string;
            agencyCode: string;
            agencyName: string;
            permissions: string;
            name: string;
            warning?: string;
        };
        status: HttpStatus;
        message: string;
    }>;
    forgotPassword(userData: {
        username: string;
        email: string;
    }): Promise<{
        data: {
            message: string;
            expiry: number;
        };
        status: HttpStatus;
        message: string;
    }>;
    resetPassword(body: {
        username: string;
        password: string;
        verifyCode: string;
    }): Promise<{
        data: User;
        status: HttpStatus;
        message: string;
    }>;
    changePassword(body: {
        username: string;
        email: string;
        oldPassword: string;
        newPassword: any;
    }): Promise<{
        data: User;
        status: HttpStatus;
        message: string;
    }>;
    putUpdateUser(id: string, userData: User): Promise<{
        data: User;
        status: HttpStatus;
        message: string;
    }>;
    putActiveUser(id: string): Promise<{
        data: User;
        status: HttpStatus;
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        data: void;
        status: HttpStatus;
        message: string;
    }>;
}
