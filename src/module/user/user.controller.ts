import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getListUser() {
        try {
            const result = await this.userService.getListUser();
            return { data: result, status: 200, message: 'Successfully retrieved list of users.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException(
                        'Failed to retrieve list of users. Please try again later.',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
            }
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const userId = parseInt(id, 10);
        try {
            const result = await this.userService.getUserById(userId);
            return { data: result, status: 200, message: 'Successfully retrieved user.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException(
                        'Failed to retrieve user. Please try again later.',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
            }
        }
    }

    @Post('register')
    async addUser(@Body() userData: User) {
        try {
            const result = await this.userService.addUser(
                userData.username,
                userData.email,
                userData.password,
                userData.name,
                userData.phone,
                userData.agencyCode,
                userData.roleName,
                userData.service,
                userData.permissions,
            );
            return { data: result, status: HttpStatus.CREATED, message: 'User added successfully.' };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Failed to add user.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Post('login')
    async loginUser(@Body() userData: { username: string; password: string }) {
        try {
            const result = await this.userService.loginUser(userData.username, userData.password);
            return { data: result, status: HttpStatus.OK, message: 'User logged in successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Failed to login user.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() userData: { username: string; email: string }) {
        try {
            const result = await this.userService.forgotPassword(userData.username, userData.email);
            return { data: result, status: HttpStatus.OK, message: 'User logged in successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Put('reset-password')
    async resetPassword(@Body() body: { username: string; password: string; verifyCode: string }) {
        try {
            const result = await this.userService.resetPassword(body.username, body.password, body.verifyCode);
            return { data: result, status: HttpStatus.OK, message: 'User logged in successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Put('change-password')
    async changePassword(@Body() body: { username: string; email: string; oldPassword: string; newPassword }) {
        try {
            const result = await this.userService.changePassword(
                body.username,
                body.email,
                body.oldPassword,
                body.newPassword,
            );
            return { data: result, status: HttpStatus.OK, message: 'User logged in successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Put('update/:id')
    async putUpdateUser(@Param('id') id: string, @Body() userData: User) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.putUpdateUser(
                userId,
                userData.name,
                userData.phone,
                userData.agencyCode,
                userData.roleName,
                userData.service,
                userData.permissions,
            );
            return { data: result, status: HttpStatus.OK, message: 'User logged in successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Failed to update user.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Put('active/:id')
    async putActiveUser(@Param('id') id: string) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.putActiveUser(userId);
            return { data: result, status: HttpStatus.OK, message: 'Successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Failed to lock user.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }

    @Delete('/:id')
    async deleteUser(@Param('id') id: string) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.userService.deleteUser(userId);
            return { data: result, status: HttpStatus.OK, message: 'User delete successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                if (error instanceof HttpException) {
                    throw new HttpException(error.message, error.getStatus());
                } else {
                    throw new HttpException('Failed to delete user.', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
    }
}
