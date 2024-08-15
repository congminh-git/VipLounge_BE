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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_entity_1 = require("./user.entity");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getListUser() {
        try {
            const result = await this.userService.getListUser();
            return { data: result, status: 200, message: 'Successfully retrieved list of users.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to retrieve list of users. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async getUserById(id) {
        const userId = parseInt(id, 10);
        try {
            const result = await this.userService.getUserById(userId);
            return { data: result, status: 200, message: 'Successfully retrieved user.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to retrieve user. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async addUser(userData) {
        try {
            const result = await this.userService.addUser(userData.username, userData.email, userData.password, userData.name, userData.phone, userData.agencyCode, userData.roleName, userData.service, userData.permissions);
            return { data: result, status: common_1.HttpStatus.CREATED, message: 'User added successfully.' };
        }
        catch (error) {
            console.log(error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to add user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async loginUser(userData) {
        try {
            const result = await this.userService.loginUser(userData.username, userData.password);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User logged in successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to login user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async forgotPassword(userData) {
        try {
            const result = await this.userService.forgotPassword(userData.username, userData.email);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User logged in successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Something went wrong.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async resetPassword(body) {
        try {
            const result = await this.userService.resetPassword(body.username, body.password, body.verifyCode);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User logged in successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Something went wrong.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async changePassword(body) {
        try {
            const result = await this.userService.changePassword(body.username, body.email, body.oldPassword, body.newPassword);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User logged in successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                console.log(error);
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Something went wrong.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async putUpdateUser(id, userData) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.putUpdateUser(userId, userData.name, userData.phone, userData.agencyCode, userData.roleName, userData.service, userData.permissions);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User logged in successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to update user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async putActiveUser(id) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.putActiveUser(userId);
            return { data: result, status: common_1.HttpStatus.OK, message: 'Successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to lock user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
    async deleteUser(id) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.deleteUser(userId);
            return { data: result, status: common_1.HttpStatus.OK, message: 'User delete successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                if (error instanceof common_1.HttpException) {
                    throw new common_1.HttpException(error.message, error.getStatus());
                }
                else {
                    throw new common_1.HttpException('Failed to delete user.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getListUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Put)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Put)('change-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "putUpdateUser", null);
__decorate([
    (0, common_1.Put)('active/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "putActiveUser", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map