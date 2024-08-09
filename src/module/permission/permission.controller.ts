import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { PermissionService } from './permission.service';

@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Get()
    async getListPermission() {
        try {
            const result = await this.permissionService.getListPermission();
            return { data: result, status: 200, message: 'Successfully retrieved list of permissions.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve list permission. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getPermissionById(@Param('id') id: string) {
        const permissionId = parseInt(id, 10);
        try {
            const result = await this.permissionService.getPermissionById(permissionId);
            return { data: result, status: 200, message: 'Successfully retrieved permission.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve permission. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
